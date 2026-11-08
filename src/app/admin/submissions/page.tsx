'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Coins,
  Search,
  Filter,
  Eye,
  Info,
} from 'lucide-react';
import { formatCoins, formatDate } from '@/lib/utils';
import { Activity, ActivityCategory } from '@/types';

export default function AdminSubmissionsPage() {
  const supabase = createClient();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  // Action form state
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [coinOverride, setCoinOverride] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('Blurry or unverified evidence');
  const [customNotes, setCustomNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // Load categories
      const { data: cats } = await supabase.from('activity_categories').select('*');
      if (cats) setCategories(cats);

      loadActivities();
    }
    loadData();
  }, []);

  async function loadActivities() {
    setLoading(true);
    const { data } = await supabase
      .from('activities')
      .select('*, category:activity_categories(*), user:profiles(*)')
      .order('created_at', { ascending: false });

    if (data) {
      setActivities(data as any);
      if (data.length > 0 && !selectedActivity) {
        setSelectedActivity(data[0] as any);
      }
    }
    setLoading(false);
  }

  const handleSelect = (act: Activity) => {
    setSelectedActivity(act);
    setActionSuccess(null);
    setActionError(null);
    setCoinOverride(act.category?.base_coins.toString() || '50');
    setCustomNotes('');
  };

  const handleProcessSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setProcessing(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const overrideVal =
        decision === 'approve' && coinOverride.trim()
          ? parseInt(coinOverride.trim(), 10)
          : null;

      const { data, error } = await supabase.rpc('admin_verify_activity', {
        p_activity_id: selectedActivity.id,
        p_decision: decision,
        p_rejection_reason: decision === 'reject' ? rejectionReason : null,
        p_coin_override: overrideVal,
        p_admin_notes: customNotes.trim() || null,
      });

      if (error) throw new Error(error.message);

      setActionSuccess(
        `Activity successfully ${decision === 'approve' ? 'approved and coins credited' : 'rejected'}.`
      );

      // Refresh list
      loadActivities();
    } catch (err: any) {
      setActionError(err.message || 'Verification action failed.');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = activities.filter((act) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? act.status === 'approved' || act.status === 'auto_approved'
        : act.status === statusFilter;

    const matchesSearch =
      search === ''
        ? true
        : act.title.toLowerCase().includes(search.toLowerCase()) ||
          act.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          act.user?.email.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
          Activity Verification Queue
        </h1>
        <p className="text-xs text-gray-500">
          Inspect citizen photographs, evaluate AI confidence ratings, detect duplicate hashes, and issue Leaf Coins.
        </p>
      </div>

      {/* Filter bar */}
      <div className="eco-card p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-[#F0F6F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search citizen or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
          />
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submissions List (5 cols) */}
        <div className="lg:col-span-5 eco-card bg-white p-4 space-y-3 max-h-[750px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
            Submissions ({filtered.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading submissions...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No submissions match the current filter.
            </div>
          ) : (
            filtered.map((act) => {
              const isSelected = selectedActivity?.id === act.id;
              const isApproved = act.status === 'approved' || act.status === 'auto_approved';
              const isRejected = act.status === 'rejected';

              return (
                <div
                  key={act.id}
                  onClick={() => handleSelect(act)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#166534] bg-[#dcfce7]/30 ring-1 ring-[#166534]'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <img
                    src={act.image_url}
                    alt={act.title}
                    className="w-14 h-14 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-gray-900 truncate">
                        {act.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {act.user?.full_name || act.user?.email} • {act.category?.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span>{formatDate(act.created_at)}</span>
                      {act.ai_confidence && (
                        <span className="font-semibold text-[#166534]">
                          AI {(act.ai_confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Inspection & Decision Panel (7 cols) */}
        <div className="lg:col-span-7 eco-card bg-white p-6 space-y-6">
          {!selectedActivity ? (
            <div className="py-20 text-center text-xs text-gray-400">
              Select an activity from the queue to inspect.
            </div>
          ) : (
            <div className="space-y-6">
              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Title & Citizen Info */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534]">
                    {selectedActivity.category?.name}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Submitted by: <strong>{selectedActivity.user?.full_name || 'Citizen'}</strong> ({selectedActivity.user?.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-700 block">Status</span>
                  <span className="text-xs font-bold uppercase text-[#166534]">
                    {selectedActivity.status}
                  </span>
                </div>
              </div>

              {/* High-Resolution Evidence Photo */}
              <div className="rounded-xl overflow-hidden bg-gray-100 max-h-80 border border-gray-200 relative group">
                <img
                  src={selectedActivity.image_url}
                  alt={selectedActivity.title}
                  className="w-full h-full object-contain max-h-80 mx-auto"
                />
              </div>

              {/* AI Vision Metrics Breakdown */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#166534]" />
                    AI Vision Recognition Rating
                  </h4>
                  {selectedActivity.ai_confidence && (
                    <span className="font-extrabold text-sm text-[#166534]">
                      {(selectedActivity.ai_confidence * 100).toFixed(1)}% Confidence
                    </span>
                  )}
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {selectedActivity.ai_description || selectedActivity.description}
                </p>

                {selectedActivity.is_suspicious && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Flagged for Attention:</strong>{' '}
                      {selectedActivity.suspicion_reason || 'Anomaly detected during visual scan.'}
                    </div>
                  </div>
                )}

                {selectedActivity.ai_raw_result?.detectedObjects && (
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">
                      Identified Objects:
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

              {/* Action Form */}
              <form onSubmit={handleProcessSubmission} className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('approve')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'approve'
                        ? 'bg-[#166534] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Award Coins
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('reject')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      decision === 'reject'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Submission
                  </button>
                </div>

                {decision === 'approve' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Coin Award Amount (Base: {selectedActivity.category?.base_coins} LC)
                      </label>
                      <input
                        type="number"
                        value={coinOverride}
                        onChange={(e) => setCoinOverride(e.target.value)}
                        placeholder="50"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        Admin can override default coins for exceptional effort. Audit logged.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Administrator Verification Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Great community impact, clearly verified."
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Rejection Reason (Visible to Citizen)
                      </label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                      >
                        <option value="Blurry or unverified evidence">
                          Blurry or illegible photographic evidence
                        </option>
                        <option value="Not an environmental activity">
                          Image does not demonstrate positive environmental stewardship
                        </option>
                        <option value="Duplicate photograph">
                          Duplicate photograph previously submitted or downloaded from internet
                        </option>
                        <option value="Incomplete segregation or action">
                          Incomplete or insufficient environmental action
                        </option>
                        <option value="Custom rejection reason">
                          Other / Specify in notes below
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Detailed Explanation
                      </label>
                      <textarea
                        rows={2}
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Please capture a closer photo showing segregated recycling items..."
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={processing}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm disabled:opacity-50 ${
                      decision === 'approve'
                        ? 'bg-[#166534] hover:bg-[#14532d]'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Submit ${decision === 'approve' ? 'Approval' : 'Rejection'}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
