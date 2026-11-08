import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Coins,
  Camera,
  Gift,
  ArrowRight,
  TrendingUp,
  Leaf,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate } from '@/lib/utils';
import { Profile, WalletAccount, Activity } from '@/types';

export const revalidate = 0; // Dynamic on load

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch wallet
  const { data: wallet } = await supabase
    .from('wallet_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch recent user activities
  const { data: activities } = await supabase
    .from('activities')
    .select('*, category:activity_categories(name, slug, co2_offset_kg)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const userActivities: Activity[] = (activities as any) || [];

  // Calculate personal metrics
  const approvedCount = userActivities.filter(
    (a) => a.status === 'approved' || a.status === 'auto_approved'
  ).length;
  const pendingCount = userActivities.filter((a) => a.status === 'pending').length;
  const estimatedCo2Saved = userActivities
    .filter((a) => a.status === 'approved' || a.status === 'auto_approved')
    .reduce((sum, a) => sum + (a.category?.co2_offset_kg || 1.5), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EBE3] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
              Welcome back, {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">
              Citizen Steward
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Keep up the momentum. Every verified environmental action earns real Leaf Coins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/capture"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm transition-all"
          >
            <Camera className="w-4 h-4 text-[#86efac]" />
            Capture Habit
          </Link>
          <Link
            href="/dashboard/store"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0F6F0] text-[#166534] text-xs font-semibold hover:bg-[#dcfce7] transition-colors"
          >
            <Gift className="w-4 h-4 text-[#166534]" />
            Redeem Coins
          </Link>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="eco-card p-5 bg-gradient-to-br from-emerald-50/60 to-white border-[#86efac]">
          <div className="flex items-center justify-between text-[#166534] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Available Balance
            </span>
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#166534]">
            {formatCoins(wallet?.available_balance ?? 50)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E3EBE3]/60 text-xs">
            <span className="text-gray-500">
              ≈ {formatINR((wallet?.available_balance ?? 50) / 100)} INR
            </span>
            <Link
              href="/dashboard/store"
              className="text-[#166534] font-semibold hover:underline flex items-center gap-0.5"
            >
              Cash out <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Lifetime Earned */}
        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Lifetime Earned
            </span>
            <Sparkles className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCoins(wallet?.lifetime_earned ?? 50)}
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Cumulative stewardship points
          </p>
        </div>

        {/* Total Redeemed */}
        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Redeemed
            </span>
            <Gift className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCoins(wallet?.total_redeemed ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Claimed rewards</span>
            <Link
              href="/dashboard/redemptions"
              className="text-blue-600 font-semibold hover:underline"
            >
              Receipts
            </Link>
          </div>
        </div>

        {/* Impact CO2 */}
        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Carbon Reduced
            </span>
            <Leaf className="w-4 h-4 text-[#166534]" />
          </div>
          <div className="text-2xl font-bold text-[#166534]">
            {estimatedCo2Saved.toFixed(1)} kg
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Across {approvedCount} verified habits
          </p>
        </div>
      </div>

      {/* Main Content Grid: Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0e2717] flex items-center gap-2">
              <History className="w-5 h-5 text-[#166534]" />
              Recent Activity Submissions
            </h2>
            <Link
              href="/dashboard/activities"
              className="text-xs font-semibold text-[#166534] hover:underline"
            >
              View All History
            </Link>
          </div>

          {userActivities.length === 0 ? (
            <div className="eco-card p-10 bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-[#22c55e]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No activities logged yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Capture your first environmental habit now—such as segregating recyclables, planting, or cycling.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/capture"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture First Habit
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userActivities.map((activity) => {
                const isApproved =
                  activity.status === 'approved' || activity.status === 'auto_approved';
                const isRejected = activity.status === 'rejected';

                return (
                  <div
                    key={activity.id}
                    className="eco-card p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#86efac] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">
                            {activity.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {activity.status === 'auto_approved'
                              ? 'Auto-Approved'
                              : activity.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {activity.category?.name} • {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#166534] block">
                          {isApproved
                            ? `+${activity.coins_awarded} LC`
                            : isRejected
                            ? '0 LC'
                            : 'Pending'}
                        </span>
                        {activity.ai_confidence && (
                          <span className="text-[10px] text-gray-400">
                            AI {(activity.ai_confidence * 100).toFixed(0)}% Match
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/activities?id=${activity.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#166534] hover:bg-[#F0F6F0] rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Actions & Rewards Teaser */}
        <div className="space-y-6">
          {/* Quick Capture Card */}
          <div className="rounded-2xl p-6 bg-[#166534] text-white space-y-4 shadow-sm border border-[#14532d]">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 text-[#86efac] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Have an activity ready?</h3>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                Take a photograph of your recyclable sorting, composting, or outdoor planting. Get verified in seconds!
              </p>
            </div>
            <Link
              href="/dashboard/capture"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-[#166534] text-xs font-bold shadow hover:bg-gray-100 transition-colors"
            >
              Open Camera / Upload Photo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Wallet Actions */}
          <div className="eco-card p-5 bg-white space-y-3">
            <h3 className="text-sm font-bold text-[#0e2717] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              Wallet Quick Links
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/dashboard/wallet"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7FAF7] transition-colors border border-transparent hover:border-[#E3EBE3]"
              >
                <span className="text-gray-700 font-medium">Double-Entry Transaction Ledger</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/store"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7FAF7] transition-colors border border-transparent hover:border-[#E3EBE3]"
              >
                <span className="text-gray-700 font-medium">Cash Payout & Brand Vouchers</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/redemptions"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7FAF7] transition-colors border border-transparent hover:border-[#E3EBE3]"
              >
                <span className="text-gray-700 font-medium">Redemption Receipts & Vouchers</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
