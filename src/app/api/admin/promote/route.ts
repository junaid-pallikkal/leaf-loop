import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { secretKey, targetUserId } = await req.json();

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'leafloop_eco_admin_2026_secure';

    // Check if requester is already an admin OR provided the valid server secret
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isCurrentAdmin = myProfile?.role === 'admin';
    const isSecretValid = secretKey === expectedSecret;

    if (!isCurrentAdmin && !isSecretValid) {
      return NextResponse.json({ error: 'Invalid admin provisioning key' }, { status: 403 });
    }

    const userToPromote = targetUserId || user.id;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('id', userToPromote);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'ADMIN_PROMOTION',
      target_entity: 'profiles',
      target_id: userToPromote,
      details: { promoted_by: user.id, via_secret: isSecretValid },
    });

    return NextResponse.json({ success: true, message: 'User successfully granted administrator role.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
