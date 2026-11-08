'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Coins,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react';
import { SystemSettings } from '@/types';

export default function AdminSettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [coinsPerRupee, setCoinsPerRupee] = useState('100');
  const [minCoinsRedeem, setMinCoinsRedeem] = useState('500');
  const [maxCoinsRedeem, setMaxCoinsRedeem] = useState('10000');
  const [dailyCap, setDailyCap] = useState('20000');
  const [processingNotice, setProcessingNotice] = useState(
    'Payout requests are audited and processed within 24 to 48 business hours directly to your verified bank account via IMPS/NEFT.'
  );
  const [aiMinConfidence, setAiMinConfidence] = useState('0.85');
  const [duplicateCheckEnabled, setDuplicateCheckEnabled] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('system_settings').select('*');
      if (data) {
        data.forEach((s) => {
          if (s.key === 'cash_conversion_rate') {
            if (s.value?.coins_per_rupee) setCoinsPerRupee(s.value.coins_per_rupee.toString());
          } else if (s.key === 'redemption_limits') {
            if (s.value?.min_coins_per_redemption)
              setMinCoinsRedeem(s.value.min_coins_per_redemption.toString());
            if (s.value?.max_coins_per_redemption)
              setMaxCoinsRedeem(s.value.max_coins_per_redemption.toString());
            if (s.value?.daily_redemption_cap)
              setDailyCap(s.value.daily_redemption_cap.toString());
          } else if (s.key === 'processing_message') {
            if (s.value?.message) setProcessingNotice(s.value.message);
          } else if (s.key === 'ai_rules') {
            if (s.value?.auto_approve_min_confidence)
              setAiMinConfidence(s.value.auto_approve_min_confidence.toString());
            if (s.value?.duplicate_check_enabled !== undefined)
              setDuplicateCheckEnabled(Boolean(s.value.duplicate_check_enabled));
          } else if (s.key === 'gemini_api_key') {
            if (s.value?.api_key) setGeminiApiKey(s.value.api_key);
          }
        });
      }
      setLoading(false);
    }

    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updates: Array<{ key: string; value: any; updated_at: string }> = [
        {
          key: 'cash_conversion_rate',
          value: {
            coins_per_rupee: parseInt(coinsPerRupee, 10),
            formula: `${parseInt(coinsPerRupee, 10) * 10} LC = ₹10`,
            currency: 'INR',
            symbol: '₹',
          },
          updated_at: new Date().toISOString(),
        },
        {
          key: 'redemption_limits',
          value: {
            min_coins_per_redemption: parseInt(minCoinsRedeem, 10),
            max_coins_per_redemption: parseInt(maxCoinsRedeem, 10),
            daily_redemption_cap: parseInt(dailyCap, 10),
          },
          updated_at: new Date().toISOString(),
        },
        {
          key: 'processing_message',
          value: {
            title: 'Secure Disbursement',
            message: processingNotice.trim(),
          },
          updated_at: new Date().toISOString(),
        },
        {
          key: 'ai_rules',
          value: {
            auto_approve_min_confidence: parseFloat(aiMinConfidence),
            duplicate_check_enabled: duplicateCheckEnabled,
            require_admin_if_suspicious: true,
          },
          updated_at: new Date().toISOString(),
        },
        {
          key: 'gemini_api_key',
          value: {
            api_key: geminiApiKey.trim(),
            provider: 'Google Gemini Vision AI',
          },
          updated_at: new Date().toISOString(),
        },
      ];

      for (const item of updates) {
        const { error: upsertErr } = await supabase
          .from('system_settings')
          .upsert(item, { onConflict: 'key' });
        if (upsertErr) throw upsertErr;
      }

      setMessage('System parameters successfully saved and synchronized across platform.');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
          System Parameters & Policies
        </h1>
        <p className="text-xs text-gray-500">
          Configure cash conversion ratios, redemption thresholds, payout disclaimers, and AI vision rules.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Cash Conversion Rate */}
        <div className="eco-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#166534] flex items-center gap-2">
            <Coins className="w-4 h-4" /> Cash Conversion Benchmark
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Coins per 1 Indian Rupee (LC / ₹1)
              </label>
              <input
                type="number"
                required
                value={coinsPerRupee}
                onChange={(e) => setCoinsPerRupee(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Standard: 100 LC = ₹1.00 (1,000 LC = ₹10.00)
              </span>
            </div>

            <div className="p-3 bg-[#F0F6F0] rounded-xl border border-[#E3EBE3] flex items-center justify-between text-xs">
              <span className="text-gray-600">Calculated Example:</span>
              <span className="font-bold text-[#166534] text-sm">
                1,000 LC = ₹{(1000 / (parseInt(coinsPerRupee, 10) || 100)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Redemption Limits */}
        <div className="eco-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#166534] flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Redemption Floor & Ceiling Limits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Minimum Coins per Payout
              </label>
              <input
                type="number"
                required
                value={minCoinsRedeem}
                onChange={(e) => setMinCoinsRedeem(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Maximum Coins per Payout
              </label>
              <input
                type="number"
                required
                value={maxCoinsRedeem}
                onChange={(e) => setMaxCoinsRedeem(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Daily Velocity Cap per Citizen
              </label>
              <input
                type="number"
                required
                value={dailyCap}
                onChange={(e) => setDailyCap(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
          </div>
        </div>

        {/* User Processing Notice */}
        <div className="eco-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#166534] flex items-center gap-2">
            <Info className="w-4 h-4" /> Payout Processing Notice (User Facing)
          </h2>

          <div>
            <textarea
              rows={2}
              value={processingNotice}
              onChange={(e) => setProcessingNotice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Displayed in the cash redemption modal before citizen submits payout request.
            </span>
          </div>
        </div>

        {/* AI & Fraud Rules */}
        <div className="eco-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#166534] flex items-center gap-2">
            <Cpu className="w-4 h-4" /> AI Vision Engine & Anti-Fraud Gates
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Global Auto-Approval Minimum Confidence Threshold (0.70 – 0.95)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={aiMinConfidence}
                onChange={(e) => setAiMinConfidence(e.target.value)}
                className="w-full max-w-xs px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Any submission below this confidence level is automatically routed for human Admin review.
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-xs font-semibold text-gray-900 block">
                  Cryptographic Perceptual Duplicate Detection
                </span>
                <span className="text-[11px] text-gray-500">
                  Hash check against all historical activity photos to flag repeat submissions.
                </span>
              </div>
              <input
                type="checkbox"
                checked={duplicateCheckEnabled}
                onChange={(e) => setDuplicateCheckEnabled(e.target.checked)}
                className="w-4 h-4 text-[#166534] rounded focus:ring-[#166534]"
              />
            </div>

            {/* Google Gemini Vision API Key Configuration */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#166534] block">
                    Google Gemini Multimodal Vision API Key
                  </span>
                  <span className="text-[11px] text-gray-600">
                    Powers state-of-the-art vision models (Gemini 2.0 Flash / 1.5 Flash). If omitted, the high-precision local computer vision engine is used.
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    geminiApiKey
                      ? 'bg-emerald-100 text-[#166534] border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {geminiApiKey ? '● Gemini Vision Active' : '● Local CV Fallback Active'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534] bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[10px] text-gray-500">
                You can generate a free API key instantly at{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#166534] underline font-semibold"
                >
                  Google AI Studio (aistudio.google.com)
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save System Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
