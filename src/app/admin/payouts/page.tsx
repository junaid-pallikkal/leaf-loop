'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  ShieldCheck,
  FileText,
  X,
  CreditCard,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate, maskBankAccount } from '@/lib/utils';
import { Redemption } from '@/types';

export default function AdminPayoutsPage() {
  const supabase = createClient();

  const [payouts, setPayouts] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected payout for processing
  const [selectedPayout, setSelectedPayout] = useState<Redemption | null>(null);
  const [actionType, setActionType] = useState<'paid' | 'processing' | 'rejected'>('paid');
  const [utrNumber, setUtrNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayouts();
  }, []);

  async function loadPayouts() {
    setLoading(true);
    const { data } = await supabase
      .from('redemptions')
      .select('*, user:profiles(*), reward:rewards(*)')
      .eq('type', 'cash')
      .order('created_at', { ascending: false });

    if (data) setPayouts(data as any);
    setLoading(false);
  }

  const openActionModal = (p: Redemption, action: 'paid' | 'processing' | 'rejected') => {
    setSelectedPayout(p);
    setActionType(action);
    setUtrNumber(p.utr_number || '');
    setAdminNotes('');
    setMessage(null);
    setError(null);
  };

  const handleProcessPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    if (actionType === 'paid' && !utrNumber.trim()) {
      setError('Please provide a valid Bank UTR / Payment Reference Number.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_process_cash_payout', {
        p_redemption_id: selectedPayout.id,
        p_action: actionType,
        p_utr_number: utrNumber.trim() || null,
        p_admin_notes: adminNotes.trim() || null,
      });

      if (rpcError) throw new Error(rpcError.message);

      setMessage(
        `Payout marked as ${actionType}. ${
          actionType === 'rejected' ? 'Coins refunded to citizen wallet.' : ''
        }`
      );

      loadPayouts();
      setTimeout(() => {
        setSelectedPayout(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update payout.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = payouts.filter((p) => {
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch =
      search === ''
        ? true
        : p.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.user?.email.toLowerCase().includes(search.toLowerCase()) ||
          p.receipt_id.toLowerCase().includes(search.toLowerCase()) ||
          p.bank_account_masked?.includes(search);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
            Cash Payout Disbursements
          </h1>
          <p className="text-xs text-gray-500">
            Audit banking credentials, disburse funds via IMPS/NEFT, record UTR references, or refund rejected requests.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="eco-card p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Payouts' },
            { id: 'requested', label: 'Requested' },
            { id: 'processing', label: 'Processing' },
            { id: 'paid', label: 'Disbursed (Paid)' },
            { id: 'rejected', label: 'Rejected (Refunded)' },
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
            placeholder="Search citizen or receipt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="eco-card bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading payout records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No payout records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                <tr>
                  <th className="py-3 px-4">Receipt / Citizen</th>
                  <th className="py-3 px-4">Bank Account & IFSC</th>
                  <th className="py-3 px-4 text-center">Amount (INR)</th>
                  <th className="py-3 px-4 text-center">Coins Spent</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filtered.map((p) => {
                  const isPaid = p.status === 'paid';
                  const isProcessing = p.status === 'processing';
                  const isRequested = p.status === 'requested';
                  const isRejected = p.status === 'rejected';

                  return (
                    <tr key={p.id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-xs text-gray-800">
                            {p.receipt_id}
                          </span>
                          <p className="font-semibold text-gray-900 text-xs">
                            {p.user?.full_name || 'Citizen'}
                          </p>
                          <p className="text-[11px] text-gray-400">{p.user?.email}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-mono font-medium text-xs text-gray-800">
                            {p.bank_account_masked || 'Bank Account'}
                          </p>
                          <p className="text-[11px] font-mono text-gray-500">
                            IFSC: {p.bank_ifsc || 'N/A'}
                          </p>
                          {p.utr_number && (
                            <p className="text-[10px] font-mono text-emerald-700 font-bold">
                              UTR: {p.utr_number}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-800">
                        {formatINR(p.reward_value_inr)}
                      </td>

                      <td className="py-3.5 px-4 text-center text-gray-600 font-medium">
                        {formatCoins(p.coins_spent)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isProcessing
                              ? 'bg-blue-100 text-blue-800'
                              : isRejected
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isPaid && !isRejected ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openActionModal(p, 'paid')}
                              className="px-2.5 py-1 rounded-md bg-[#166534] text-white text-[11px] font-semibold hover:bg-[#14532d]"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => openActionModal(p, 'rejected')}
                              className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-[11px] font-semibold hover:bg-red-200"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534]">
                  Process Payout
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {selectedPayout.receipt_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
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

            {/* Payout details card */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
              <p>
                <strong>Beneficiary:</strong> {selectedPayout.user?.full_name} ({selectedPayout.user?.email})
              </p>
              <p>
                <strong>Account:</strong> {selectedPayout.bank_account_masked}
              </p>
              <p>
                <strong>IFSC:</strong> {selectedPayout.bank_ifsc}
              </p>
              <p>
                <strong>Disbursement:</strong> {formatINR(selectedPayout.reward_value_inr)} ({formatCoins(selectedPayout.coins_spent)})
              </p>
            </div>

            <form onSubmit={handleProcessPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534] bg-white"
                >
                  <option value="paid">Mark as Paid (Disbursed)</option>
                  <option value="processing">Mark as Processing</option>
                  <option value="rejected">Reject & Refund Coins to Citizen</option>
                </select>
              </div>

              {actionType === 'paid' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank UTR / IMPS Transaction Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 431215894231"
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Administrator Notes
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    actionType === 'rejected'
                      ? 'Reason for rejection (e.g. invalid IFSC)'
                      : 'Audit or transaction note...'
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm disabled:opacity-50 ${
                    actionType === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[#166534] hover:bg-[#14532d]'
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                  ) : (
                    'Confirm Action'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
