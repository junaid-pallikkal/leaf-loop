'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3,
  Leaf,
  Coins,
  TreePine,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { formatCoins } from '@/lib/utils';
import { Activity, WalletAccount, Profile } from '@/types';

export default function UserAnalyticsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [profRes, walRes, actRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('wallet_accounts').select('*').eq('user_id', user.id).single(),
        supabase
          .from('activities')
          .select('*, category:activity_categories(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (walRes.data) setWallet(walRes.data);
      if (actRes.data) setActivities(actRes.data as any);

      setLoading(false);
    }

    loadData();
  }, []);

  const approvedActivities = activities.filter(
    (a) => a.status === 'approved' || a.status === 'auto_approved'
  );
  const totalCo2Offset = approvedActivities.reduce(
    (acc, a) => acc + (a.category?.co2_offset_kg || 2),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
            <BarChart3 className="w-4 h-4 text-[#22c55e]" />
            Personal Impact Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0e2717] mt-1">
            Your Environmental Footprint
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Real-time tracking of verified habits, carbon abatement, and Leaf Coin earnings.
          </p>
        </div>

        <Link
          href="/dashboard/capture"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          Log New Action
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#166534]" /> Loading personal metrics...
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="eco-card p-5 bg-white">
              <span className="text-xs font-medium text-gray-500 block mb-1">CO₂ Abated</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#166534]">
                {totalCo2Offset.toFixed(1)} kg
              </span>
              <p className="text-[11px] text-gray-400 mt-1">Verified atmospheric offset</p>
            </div>

            <div className="eco-card p-5 bg-white">
              <span className="text-xs font-medium text-gray-500 block mb-1">Verified Actions</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {approvedActivities.length}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">Out of {activities.length} total logged</p>
            </div>

            <div className="eco-card p-5 bg-white">
              <span className="text-xs font-medium text-gray-500 block mb-1">Coins Earned</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {formatCoins(wallet?.lifetime_earned ?? 0)}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">Available: {wallet?.available_balance ?? 0} LC</p>
            </div>

            <div className="eco-card p-5 bg-white">
              <span className="text-xs font-medium text-gray-500 block mb-1">Leaderboard Pts</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0e2717]">
                {profile?.role === 'admin' ? 'Admin' : `${approvedActivities.length * 10} pts`}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">Verified contribution rank</p>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="eco-card p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#166534]" />
              Habit Verification Status Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 block">Verified & Rewarded</span>
                <span className="text-xl font-bold text-emerald-900">{approvedActivities.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs font-semibold text-amber-800 block">Under Review</span>
                <span className="text-xl font-bold text-amber-900">
                  {activities.filter((a) => a.status === 'pending').length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                <span className="text-xs font-semibold text-red-800 block">Rejected / Flagged</span>
                <span className="text-xl font-bold text-red-900">
                  {activities.filter((a) => a.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
