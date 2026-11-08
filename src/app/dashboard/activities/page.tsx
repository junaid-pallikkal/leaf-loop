'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Coins,
  X,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { formatCoins, formatDate } from '@/lib/utils';
import { Activity } from '@/types';

export default function ActivitiesHistoryPage() {
  const supabase = createClient();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    async function loadActivities() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('activities')
        .select('*, category:activity_categories(name, slug, co2_offset_kg)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setActivities(data as any);
      setLoading(false);
    }
    loadActivities();
  }, []);

  const filtered = activities.filter((act) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'approved'
        ? act.status === 'approved' || act.status === 'auto_approved'
        : act.status === filterStatus;

    const matchesSearch =
      searchQuery === ''
        ? true
        : act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
            <History className="w-4 h-4 text-[#22c55e]" />
            Personal Stewardship Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
            Activity History & Verifications
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Track all submitted environmental actions, AI detection breakdowns, and coin awards.
          </p>
        </div>

        <Link
          href="/dashboard/capture"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          <Camera className="w-4 h-4 text-[#86efac]" />
          New Capture
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="eco-card p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Submissions' },
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Under Review' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#166534] text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-[#F0F6F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
          />
        </div>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="eco-card p-12 bg-white text-center text-xs text-gray-500">
          Loading activity records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="eco-card p-12 bg-white text-center space-y-3">
          <Camera className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No submissions found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filterStatus === 'all'
              ? 'You have not submitted any environmental activities yet.'
              : `No activities found with status "${filterStatus}".`}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/capture"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold"
            >
              Capture New Activity
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((activity) => {
            const isApproved =
              activity.status === 'approved' || activity.status === 'auto_approved';
            const isRejected = activity.status === 'rejected';

            return (
              <div
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className="eco-card overflow-hidden bg-white hover:border-[#86efac] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                          isApproved
                            ? 'bg-emerald-600 text-white'
                            : isRejected
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {activity.status === 'auto_approved'
                          ? 'Auto-Approved'
                          : activity.status.replace('_', ' ')}
                      </span>
                    </div>

                    {isApproved && (
                      <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur text-white text-xs font-bold px-2 py-0.5 rounded">
                        +{activity.coins_awarded} LC
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded">
                      {activity.category?.name || 'Category'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {activity.ai_description || activity.description || 'Verified habit'}
                    </p>

                    {/* AI Confidence meter */}
                    {activity.ai_confidence && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <span>AI Confidence</span>
                          <span className="font-semibold text-[#166534]">
                            {(activity.ai_confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-[#166534] rounded-full"
                            style={{ width: `${activity.ai_confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{formatDate(activity.created_at)}</span>
                  <span className="text-[#166534] font-semibold hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-gray-200 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534]">
                  {selectedActivity.category?.name}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {selectedActivity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo preview in full */}
            <div className="rounded-xl overflow-hidden bg-gray-100 max-h-72 border border-gray-200">
              <img
                src={selectedActivity.image_url}
                alt={selectedActivity.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Status & Coin summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E3EBE3]">
                <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                <p className="text-sm font-bold text-gray-900 capitalize mt-0.5">
                  {selectedActivity.status.replace('_', ' ')}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#dcfce7] border border-[#86efac]">
                <p className="text-[10px] uppercase font-bold text-gray-500">Coins Awarded</p>
                <p className="text-base font-extrabold text-[#166534] mt-0.5">
                  {formatCoins(selectedActivity.coins_awarded)}
                </p>
              </div>
            </div>

            {/* AI Result Details */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
              <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#166534]" />
                AI Vision Detection Breakdown
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {selectedActivity.ai_description || selectedActivity.description}
              </p>

              {selectedActivity.ai_confidence && (
                <div className="flex items-center justify-between text-gray-600 pt-1">
                  <span>Confidence Score:</span>
                  <span className="font-bold text-[#166534]">
                    {(selectedActivity.ai_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {selectedActivity.ai_raw_result?.detectedObjects && (
                <div className="pt-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                    Detected Items:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedActivity.ai_raw_result.detectedObjects.map((obj: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] text-gray-700"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Note or Admin Notes */}
            {selectedActivity.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Reason for Rejection:
                </p>
                <p>{selectedActivity.rejection_reason}</p>
                {selectedActivity.admin_notes && (
                  <p className="text-red-700 mt-1 italic">
                    Administrator Note: {selectedActivity.admin_notes}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
