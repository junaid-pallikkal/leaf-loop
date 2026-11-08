import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeEnvironmentalImage, computeImageHash } from '@/lib/ai/vision-analyzer';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const categorySlug = (formData.get('categorySlug') as string) || 'waste-recycling';
    const userTitle = (formData.get('title') as string) || '';
    const userDescription = (formData.get('description') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Calculate image hash for duplicate detection
    const imageHash = computeImageHash(buffer);

    // Check if this exact photograph was already submitted previously
    const { data: existingDuplicate } = await supabase
      .from('activities')
      .select('id, user_id, title, status, created_at')
      .eq('image_hash', imageHash)
      .limit(1)
      .maybeSingle();

    // 2. Fetch category rules from database
    const { data: categories, error: catError } = await supabase
      .from('activity_categories')
      .select('*')
      .eq('is_active', true);

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json({ error: 'Failed to load activity rules.' }, { status: 500 });
    }

    const ruleConfigs = categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      minConfidence: Number(c.min_confidence_score),
      autoApproveEnabled: Boolean(c.auto_approve_enabled),
      baseCoins: c.base_coins,
      co2OffsetKg: Number(c.co2_offset_kg),
    }));

    // Fetch dynamic Gemini API key from system_settings if configured by admin
    const { data: geminiSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'gemini_api_key')
      .maybeSingle();

    const dynamicApiKey =
      geminiSetting?.value?.api_key ||
      geminiSetting?.value?.key ||
      process.env.GEMINI_API_KEY;

    // 3. Run AI Vision Analysis
    const aiResult = await analyzeEnvironmentalImage(
      buffer,
      file.type,
      categorySlug,
      ruleConfigs,
      dynamicApiKey
    );

    // If duplicate detected, flag as suspicious
    let isSuspicious = aiResult.isSuspicious;
    let suspicionReason = aiResult.suspicionReason;
    let duplicateOfId: string | null = null;

    if (existingDuplicate) {
      isSuspicious = true;
      duplicateOfId = existingDuplicate.id;
      suspicionReason = `Duplicate submission detected: identical image was submitted previously on ${new Date(
        existingDuplicate.created_at
      ).toLocaleDateString()}.`;
    }

    // 4. Upload photo to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('eco-evidence')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    let imageUrl = '';
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('eco-evidence').getPublicUrl(fileName);
      imageUrl = publicUrl;
    } else {
      // Fallback base64 or placeholder if storage write fails
      imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    const matchedCategory =
      categories.find((c) => c.slug === aiResult.categorySlug) || categories[0];

    // Determine final status
    // If suspicious or duplicate, it CANNOT be auto-approved under any circumstances!
    const canAutoApprove =
      !isSuspicious &&
      !existingDuplicate &&
      aiResult.autoApproveEligible &&
      matchedCategory.auto_approve_enabled;

    const finalStatus = canAutoApprove ? 'auto_approved' : 'pending';
    const coinsAwarded = canAutoApprove ? matchedCategory.base_coins : 0;

    // 5. Insert activity record
    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        category_id: matchedCategory.id,
        title: userTitle || aiResult.detectedActivity,
        description: userDescription || aiResult.description,
        image_url: imageUrl,
        image_hash: imageHash,
        ai_category_detected: aiResult.categoryName,
        ai_description: aiResult.description,
        ai_confidence: aiResult.confidenceScore,
        ai_raw_result: aiResult,
        is_suspicious: isSuspicious,
        suspicion_reason: suspicionReason,
        duplicate_of_activity_id: duplicateOfId,
        status: finalStatus,
        coins_awarded: coinsAwarded,
        verified_at: canAutoApprove ? new Date().toISOString() : null,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting activity:', insertError);
      return NextResponse.json({ error: 'Database save failed: ' + insertError.message }, { status: 500 });
    }

    // 6. If auto-approved, atomically credit coins and update ledger via secure RPC
    if (canAutoApprove && coinsAwarded > 0) {
      const { error: rpcError } = await supabase.rpc('auto_approve_activity', {
        p_activity_id: activity.id,
      });

      if (rpcError) {
        console.error('Auto-approval coin credit error:', rpcError);
      }
    }

    return NextResponse.json({
      success: true,
      activity,
      aiResult,
      isAutoApproved: canAutoApprove,
      coinsAwarded,
      isDuplicate: Boolean(existingDuplicate),
    });
  } catch (error: any) {
    console.error('AI Activity Analysis route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error analyzing evidence.' },
      { status: 500 }
    );
  }
}
