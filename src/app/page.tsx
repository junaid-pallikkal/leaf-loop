import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Leaf,
  ShieldCheck,
  Camera,
  Coins,
  ArrowRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  TreePine,
  Recycle,
  Bike,
  Flame,
  IndianRupee,
  Gift,
  Users,
} from 'lucide-react';
import { formatCoins, formatINR } from '@/lib/utils';
import { PublicImpactStats, ActivityCategory, Reward } from '@/types';

export const revalidate = 60; // Cache for 60 seconds

async function getLandingData() {
  const supabase = await createClient();

  // 1. Fetch real-time impact stats
  const { data: statsData } = await supabase.rpc('get_public_impact_stats');
  const stats: PublicImpactStats = statsData || {
    total_users: 0,
    total_activities: 0,
    approved_activities: 0,
    pending_activities: 0,
    coins_distributed: 0,
    rewards_redeemed: 0,
    estimated_co2_kg: 0,
    trees_or_cleanups: 0,
  };

  // 2. Fetch categories
  const { data: categories } = await supabase
    .from('activity_categories')
    .select('*')
    .eq('is_active', true)
    .order('base_coins', { ascending: false });

  // 3. Fetch featured rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('coin_cost', { ascending: true })
    .limit(4);

  // 4. Fetch recent verified activities
  const { data: recentActivities } = await supabase
    .from('activities')
    .select('*, category:activity_categories(name, slug, icon), user:profiles(full_name, avatar_url)')
    .in('status', ['approved', 'auto_approved'])
    .order('created_at', { ascending: false })
    .limit(3);

  return {
    stats,
    categories: (categories as ActivityCategory[]) || [],
    rewards: (rewards as Reward[]) || [],
    recentActivities: recentActivities || [],
  };
}

export default async function HomePage() {
  const { stats, categories, rewards, recentActivities } = await getLandingData();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E3EBE3] bg-gradient-to-b from-[#F7FAF7] via-white to-[#F7FAF7]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#dcfce7]/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dcfce7] border border-[#86efac]/80 text-[#166534] text-xs font-semibold tracking-wide shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#22c55e]" />
            <span>Every Good Habit Counts</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
            <span className="font-normal text-[#166534]/90">Real Cash & Vouchers</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0e2717] max-w-4xl mx-auto leading-tight sm:leading-none">
            Turn Your Daily <span className="text-[#166534]">Eco Habits</span> Into Verified <span className="text-[#22c55e]">Rewards</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Photograph your eco-friendly habits—from recycling waste and tree planting to cycling and composting. Our AI + Admin system verifies your action and deposits genuine Leaf Coins instantly into your wallet.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard/capture"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#166534] text-white font-semibold text-sm shadow-md hover:bg-[#14532d] transition-all hover:scale-[1.02]"
            >
              <Camera className="w-4 h-4 text-[#86efac]" />
              Capture Habit Now
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/rewards"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#166534] border border-[#E3EBE3] font-semibold text-sm shadow-sm hover:bg-[#F0F6F0] transition-colors"
            >
              <Gift className="w-4 h-4 text-[#166534]" />
              Browse Rewards Store
            </Link>
          </div>

          {/* Live Platform Impact Counters */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
              <div className="eco-card p-4 sm:p-5 bg-white">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-medium">Verified Actions</span>
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2717]">
                  {stats.approved_activities.toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Real database verified</p>
              </div>

              <div className="eco-card p-4 sm:p-5 bg-white">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-medium">CO₂ Offset (kg)</span>
                  <Leaf className="w-4 h-4 text-[#166534]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#166534]">
                  {Number(stats.estimated_co2_kg).toLocaleString()} kg
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Calculated carbon impact</p>
              </div>

              <div className="eco-card p-4 sm:p-5 bg-white">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-medium">Coins Distributed</span>
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                  {formatCoins(stats.coins_distributed)}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">In circulation</p>
              </div>

              <div className="eco-card p-4 sm:p-5 bg-white">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-medium">Rewards Claimed</span>
                  <Gift className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2717]">
                  {stats.rewards_redeemed.toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Cash & Vouchers paid</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP VERIFICATION PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            How LeafLoop Works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0e2717]">
            3 Seamless Steps to Earn Real Environmental Rewards
          </h2>
          <p className="text-sm text-gray-600">
            A transparent loop connecting everyday environmental goodwill to authenticated digital currency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="eco-card p-6 bg-white relative">
            <div className="w-12 h-12 rounded-xl bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-[#0e2717] mb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#166534]" />
              Capture Evidence
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Take a clear photo of your environmental action: segregated bins, plant saplings, collected roadside litter, or bicycle commute.
            </p>
          </div>

          <div className="eco-card p-6 bg-white relative">
            <div className="w-12 h-12 rounded-xl bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-[#0e2717] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
              AI + Admin Verification
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our Vision Engine identifies category, items, and confidence while checking for duplicate images. High-confidence actions auto-approve, with admin oversight.
            </p>
          </div>

          <div className="eco-card p-6 bg-white relative">
            <div className="w-12 h-12 rounded-xl bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-[#0e2717] mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              Cash Out or Redeem Vouchers
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Leaf Coins are credited directly to your ledger. Redeem for cash sent straight to your bank account via IMPS/NEFT or claim branded e-vouchers with instant PDF receipts.
            </p>
          </div>
        </div>
      </section>

      {/* ENVIRONMENTAL ACTION CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#166534]">
              Stewardship Categories
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
              Every Action Creates Tangible Impact
            </h2>
          </div>
          <Link
            href="/dashboard/capture"
            className="text-xs font-semibold text-[#166534] hover:underline inline-flex items-center gap-1"
          >
            Start contributing now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="eco-card p-5 bg-white hover:border-[#86efac] transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#166534]">
                    +{cat.base_coins} Leaf Coins
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    ~{cat.co2_offset_kg} kg CO₂ offset
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0e2717] mb-1.5">{cat.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{cat.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Daily cap: {cat.max_daily_per_user} submissions</span>
                <span className="text-[#166534] font-medium">
                  {cat.auto_approve_enabled ? '✓ Auto-approval enabled' : 'Admin review required'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED REWARDS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F0F6F0] rounded-2xl p-6 sm:p-10 border border-[#E3EBE3]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] bg-white px-2.5 py-1 rounded-full border border-[#E3EBE3]">
                Rewards Store Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717] mt-2">
                Redeem Leaf Coins for Real Value
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Conversion benchmark: 1000 LC = ₹10 INR • Direct bank payouts & digital gift cards.
              </p>
            </div>
            <Link
              href="/rewards"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white font-semibold text-xs hover:bg-[#14532d] transition-colors"
            >
              View All Rewards <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-xl p-5 border border-[#E3EBE3] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] uppercase ${
                        reward.type === 'cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {reward.type === 'cash' ? 'Cash Payout' : 'E-Voucher'}
                    </span>
                    <span className="text-gray-500 font-normal">
                      {reward.remaining_quantity} in stock
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0e2717] mb-1">{reward.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{reward.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Cost</p>
                    <p className="text-sm font-bold text-[#166534]">
                      {formatCoins(reward.coin_cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Value</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatINR(reward.reward_value_inr)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 bg-[#166534] text-white space-y-4 rounded-2xl relative overflow-hidden shadow-md border border-[#14532d]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/20 border border-[#86efac]/30 text-[#86efac] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Join thousands of active eco stewards
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Make Every Good Habit Count?
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
            Register in seconds, get your 50 welcome bonus Leaf Coins, and upload your first environmental action today.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#166534] font-bold text-sm shadow-md hover:bg-gray-100 transition-transform hover:scale-105"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
