import React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  BarChart3,
  Leaf,
  CheckCircle2,
  Users,
  Coins,
  Gift,
  TreePine,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate } from '@/lib/utils';
import { PublicImpactStats } from '@/types';

export const revalidate = 30; // Real-time cached for 30s

export const metadata = {
  title: 'Public Environmental Impact Dashboard | LeafLoop',
  description: 'Real-time database analytics tracking verified eco habits, carbon offsets, and reward distributions.',
};

async function getImpactData() {
  const supabase = await createClient();

  // 1. RPC Impact Stats
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

  // 2. Category-wise statistics
  const { data: categoryStats } = await supabase
    .from('activity_categories')
    .select(`
      id,
      name,
      slug,
      co2_offset_kg,
      base_coins,
      activities:activities(id, status, coins_awarded)
    `);

  const categoryBreakdown = (categoryStats || []).map((cat: any) => {
    const approvedActivities = (cat.activities || []).filter(
      (a: any) => a.status === 'approved' || a.status === 'auto_approved'
    );
    const totalCount = (cat.activities || []).length;
    const totalCoins = approvedActivities.reduce(
      (sum: number, a: any) => sum + (a.coins_awarded || cat.base_coins),
      0
    );
    const totalCo2 = Number((approvedActivities.length * cat.co2_offset_kg).toFixed(1));

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      totalCount,
      approvedCount: approvedActivities.length,
      totalCoins,
      totalCo2,
    };
  });

  // 3. Recent 6 verified activities
  const { data: recentFeed } = await supabase
    .from('activities')
    .select('*, category:activity_categories(name, slug, co2_offset_kg), user:profiles(full_name, avatar_url)')
    .in('status', ['approved', 'auto_approved'])
    .order('created_at', { ascending: false })
    .limit(6);

  return {
    stats,
    categoryBreakdown,
    recentFeed: recentFeed || [],
  };
}

export default async function ImpactPage() {
  const { stats, categoryBreakdown, recentFeed } = await getImpactData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
          <BarChart3 className="w-4 h-4 text-[#22c55e]" />
          Real-Time Public Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0e2717]">
          Public Environmental Impact Dashboard
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Aggregated in real-time from verified PostgreSQL transaction ledgers. Every habit logged contributes directly to measurable carbon reduction.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Registered Citizens</span>
            <Users className="w-4 h-4 text-[#166534]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2717]">
            {stats.total_users.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Active environmental stewards</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Verified Habits</span>
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#166534]">
            {stats.approved_activities.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Out of {stats.total_activities} logged</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">CO₂ Reduction</span>
            <Leaf className="w-4 h-4 text-[#166534]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0e2717]">
            {Number(stats.estimated_co2_kg).toLocaleString()} kg
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Calculated carbon avoided</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Coins Granted</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {formatCoins(stats.coins_distributed)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Earned by contributors</p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="eco-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0e2717] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#166534]" />
            Category-Wise Environmental Impact
          </h2>
          <span className="text-xs text-gray-500">Live Database Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Category Name</th>
                <th className="py-3 px-4 text-center">Verified Activities</th>
                <th className="py-3 px-4 text-center">Est. CO₂ Offset (kg)</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Leaf Coins Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {categoryBreakdown.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-gray-900">{cat.name}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-[#166534]">
                    {cat.approvedCount}
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-700">{cat.totalCo2} kg</td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                    {formatCoins(cat.totalCoins)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Verified Habit Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0e2717] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#22c55e]" />
          Recent Verified Citizen Submissions
        </h2>

        {recentFeed.length === 0 ? (
          <div className="eco-card p-8 bg-white text-center text-gray-500 text-sm">
            <p>No verified activities yet. Be the first to capture an environmental habit!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFeed.map((act: any) => (
              <div key={act.id} className="eco-card overflow-hidden bg-white flex flex-col">
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={act.image_url}
                    alt={act.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-[#166534] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    +{act.coins_awarded} LC
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded">
                      {act.category?.name || 'Eco Habit'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-2 line-clamp-1">
                      {act.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {act.ai_description || act.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>{act.user?.full_name || 'Anonymous Citizen'}</span>
                    <span>{formatDate(act.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
