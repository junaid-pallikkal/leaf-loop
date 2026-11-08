'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  Coins,
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate } from '@/lib/utils';
import { WalletAccount, WalletTransaction, Profile } from '@/types';

interface ExtendedWallet extends WalletAccount {
  user?: Profile;
}

export default function AdminWalletsPage() {
  const supabase = createClient();

  const [wallets, setWallets] = useState<ExtendedWallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions'>('wallets');

  // Bonus Modal
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<ExtendedWallet | null>(null);
  const [bonusCoins, setBonusCoins] = useState('100');
  const [bonusReason, setBonusReason] = useState('Community Environmental Initiative Bonus');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // 1. Wallets with profiles
    const { data: wList } = await supabase
      .from('wallet_accounts')
      .select('*, user:profiles(*)')
      .order('available_balance', { ascending: false });

    if (wList) setWallets(wList as any);

    // 2. Global transactions
    const { data: txList } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (txList) setTransactions(txList);

    setLoading(false);
  }

  const openBonusModal = (w: ExtendedWallet) => {
    setSelectedWallet(w);
    setBonusCoins('100');
    setBonusReason('Community Environmental Stewardship Bonus');
    setMessage(null);
    setError(null);
    setBonusModalOpen(true);
  };

  const handleGrantBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const coins = parseInt(bonusCoins, 10);
      if (isNaN(coins) || coins <= 0) {
        throw new Error('Please enter a valid positive coin amount.');
      }

      const newBalance = selectedWallet.available_balance + coins;
      const newLifetime = selectedWallet.lifetime_earned + coins;

      // Update wallet
      const { error: walError } = await supabase
        .from('wallet_accounts')
        .update({
          available_balance: newBalance,
          lifetime_earned: newLifetime,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', selectedWallet.user_id);

      if (walError) throw walError;

      // Insert ledger entry
      const { error: txError } = await supabase.from('wallet_transactions').insert({
        user_id: selectedWallet.user_id,
        type: 'ADMIN_ADJUSTMENT',
        amount: coins,
        balance_after: newBalance,
        reference_id: 'ADMIN_BONUS',
        reference_type: 'PROMOTIONAL',
        description: bonusReason.trim() || 'Admin promotional bonus credit',
      });

      if (txError) throw txError;

      // Insert audit log
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      await supabase.from('audit_logs').insert({
        actor_id: adminUser?.id,
        action: 'BONUS_CREDITED',
        target_entity: 'wallet_accounts',
        target_id: selectedWallet.user_id,
        details: { coins, reason: bonusReason },
      });

      setMessage(`Successfully credited ${coins} Leaf Coins to ${selectedWallet.user?.full_name || 'Citizen'}.`);
      loadData();
      setTimeout(() => setBonusModalOpen(false), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to grant coins.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWallets = wallets.filter((w) => {
    if (!search) return true;
    return (
      w.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.user?.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
            Wallet Accounts & Global Ledger
          </h1>
          <p className="text-xs text-gray-500">
            Audit system balances, view real-time immutable double-entry ledgers, and grant verified promotional bonuses.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'wallets' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Citizen Wallets ({wallets.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'transactions'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            System Ledger Log
          </button>
        </div>
      </div>

      {activeTab === 'wallets' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="eco-card p-4 bg-white flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search citizen by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Showing {filteredWallets.length} accounts
            </span>
          </div>

          {/* Wallets Table */}
          <div className="eco-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                  <tr>
                    <th className="py-3 px-4">Citizen Steward</th>
                    <th className="py-3 px-4 text-center">Available Balance</th>
                    <th className="py-3 px-4 text-center">Lifetime Earned</th>
                    <th className="py-3 px-4 text-center">Total Redeemed</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredWallets.map((w) => (
                    <tr key={w.user_id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-xs uppercase">
                            {w.user?.full_name ? w.user.full_name[0] : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">
                              {w.user?.full_name || 'Citizen'}
                            </span>
                            <span className="text-[11px] text-gray-400">{w.user?.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-[#166534] text-sm">
                        {formatCoins(w.available_balance)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-gray-900">
                        {formatCoins(w.lifetime_earned)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-medium text-gray-600">
                        {formatCoins(w.total_redeemed)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openBonusModal(w)}
                          className="px-3 py-1.5 rounded-lg bg-[#dcfce7] text-[#166534] text-xs font-semibold hover:bg-[#bbf7d0] transition-colors inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Bonus Credit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Global Transactions Tab */
        <div className="eco-card bg-white overflow-hidden p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            Real-Time System Ledger (Last 50 entries)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Balance After</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-xs text-gray-900 block">
                          {tx.type}
                        </span>
                        {tx.reference_id && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            {tx.reference_id}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={isCredit ? 'text-emerald-700' : 'text-red-600'}>
                          {isCredit ? `+${tx.amount} LC` : `${tx.amount} LC`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-800">
                        {tx.balance_after} LC
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400 text-xs">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: GRANT PROMOTIONAL BONUS */}
      {bonusModalOpen && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534]">
                  Administrator Coin Grant
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Credit Bonus: {selectedWallet.user?.full_name || 'Citizen'}
                </h3>
              </div>
              <button
                onClick={() => setBonusModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleGrantBonus} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Coins to Credit (LC)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bonusCoins}
                  onChange={(e) => setBonusCoins(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason / Ledger Description
                </label>
                <input
                  type="text"
                  required
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  placeholder="e.g. Earth Day community drive bonus"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Audit Notice:</strong> This action atomically writes an immutable transaction entry into the user&apos;s ledger and logs your Administrator ID in the system audit trail.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBonusModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Crediting...' : 'Confirm Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
