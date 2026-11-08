'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Medal, Award, Flame, Leaf, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { LeaderboardEntry } from '@/types';

export default function DashboardLeaderboardPage() {
  const supabase = createClient();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await supabase.rpc('get_leaderboard', {
        p_period: period,
        p_limit: 50,
      });

      if (data) setEntries(data);
      setLoading(false);
    }

    loadData();
  }, [period]);

  const tabs = [
    { id: 'daily' as const, label: 'Today' },
    { id: 'weekly' as const, label: 'This Week' },
    { id: 'monthly' as const, label: 'This Month' },
    { id: 'all_time' as const, label: 'All-Time' },
  ];

  const userRankEntry = entries.find((e) => e.user_id === currentUserId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-500" />
            Verified Contribution Points
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0e2717]">
            Citizen Eco Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Rankings are computed strictly from verified environmental activity points (not wallet balance).
          </p>
        </div>

        <Link
          href="/dashboard/capture"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          Boost Your Rank
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* User's Current Standing Card */}
      {userRankEntry && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              #{userRankEntry.rank}
            </div>
            <div>
              <span className="text-[11px] text-emerald-200 uppercase tracking-wider block font-semibold">
                Your Current Rank
              </span>
              <span className="text-base font-bold">{userRankEntry.full_name}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/80 block">Contribution Points</span>
            <span className="text-xl font-extrabold text-[#86efac]">
              {userRankEntry.total_points} pts
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3EBE3] pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = period === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#166534] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#166534] hover:bg-[#dcfce7]/40'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#166534]" /> Loading leaderboard rankings...
        </div>
      ) : entries.length === 0 ? (
        <div className="eco-card p-12 bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#166534] flex items-center justify-center mx-auto">
            <Leaf className="w-6 h-6 text-[#22c55e]" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No ranked activities in this period</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Be the very first citizen to submit a verified environmental action in this cycle!
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/capture"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-medium"
            >
              Capture Activity Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="eco-card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                <tr>
                  <th className="py-3 px-4 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Citizen Steward</th>
                  <th className="py-3 px-4 text-center">Verified Habits</th>
                  <th className="py-3 px-4 text-center">CO₂ Offset</th>
                  <th className="py-3 px-4 text-right">Contribution Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {entries.map((entry) => {
                  const isUser = entry.user_id === currentUserId;
                  return (
                    <tr
                      key={entry.user_id}
                      className={`hover:bg-[#F7FAF7]/60 transition-colors ${
                        isUser ? 'bg-emerald-50/60 font-semibold' : entry.rank === 1 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                            🥇 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                            🥈 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-800 font-bold text-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="text-gray-500 font-semibold">{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {entry.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
                              {entry.full_name}
                              {isUser && (
                                <span className="text-[10px] bg-emerald-100 text-[#166534] px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-gray-400">Verified Citizen</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-700">
                        {entry.verified_activities}
                      </td>
                      <td className="py-3.5 px-4 text-center text-emerald-700 font-semibold">
                        {entry.co2_saved_kg} kg
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-[#166534] text-sm">
                          {entry.total_points}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
