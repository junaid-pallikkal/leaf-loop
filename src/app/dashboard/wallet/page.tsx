'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter,
  Info,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate } from '@/lib/utils';
import { WalletAccount, WalletTransaction } from '@/types';

export default function WalletPage() {
  const supabase = createClient();

  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function loadWalletData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch wallet balance
      const { data: wal } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (wal) setWallet(wal);

      // 2. Fetch immutable transaction ledger
      const { data: txs } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (txs) setTransactions(txs);
      setLoading(false);
    }

    loadWalletData();
  }, []);

  const filteredTxs = transactions.filter((tx) => {
    if (typeFilter === 'all') return true;
    return tx.type === typeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
            <Coins className="w-4 h-4 text-amber-500" />
            Double-Entry Transaction Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
            Leaf Coin Wallet
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            All credits and disbursements are backed by immutable database records.
          </p>
        </div>

        <Link
          href="/dashboard/store"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          <Gift className="w-4 h-4 text-[#86efac]" />
          Redeem for Cash / Vouchers
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="eco-card p-5 bg-gradient-to-br from-emerald-50/70 via-white to-white border-[#86efac]">
          <div className="flex items-center justify-between text-[#166534] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Available Balance
            </span>
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#166534]">
            {formatCoins(wallet?.available_balance ?? 0)}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cash equivalence: ≈ {formatINR((wallet?.available_balance ?? 0) / 100)}
          </p>
        </div>

        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Lifetime Earned
            </span>
            <Sparkles className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCoins(wallet?.lifetime_earned ?? 0)}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Total coins ever awarded</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Redeemed
            </span>
            <Gift className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCoins(wallet?.total_redeemed ?? 0)}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Spent on cash & vouchers</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Pending Coins
            </span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCoins(wallet?.pending_balance ?? 0)}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Under review submissions</p>
        </div>
      </div>

      {/* Conversion Standard Card */}
      <div className="eco-card p-4 sm:p-5 bg-[#F0F6F0] border border-[#E3EBE3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-[#166534] flex items-center justify-center shrink-0 border border-[#E3EBE3]">
            <Info className="w-4 h-4 text-[#166534]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#166534]">Platform Conversion Benchmark</h4>
            <p className="text-xs text-gray-600">
              1,000 Leaf Coins = ₹10.00 INR (100 LC = ₹1). Payout limits: 500 LC minimum per transaction.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/store"
          className="text-xs font-bold text-[#166534] hover:underline whitespace-nowrap"
        >
          Explore Store Catalog →
        </Link>
      </div>

      {/* Ledger Table */}
      <div className="eco-card bg-white overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            Official Transaction History
          </h2>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'ACTIVITY_REWARD', label: 'Activity Rewards' },
              { id: 'CASH_REDEMPTION', label: 'Cash Payouts' },
              { id: 'VOUCHER_REDEMPTION', label: 'Vouchers' },
              { id: 'REDEMPTION_REFUND', label: 'Refunds' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  typeFilter === f.id
                    ? 'bg-[#166534] text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading ledger entries...</div>
        ) : filteredTxs.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No transactions found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                <tr>
                  <th className="py-3 px-4">Transaction / Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Balance After</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {filteredTxs.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-xs">
                              {tx.type.replace('_', ' ')}
                            </span>
                            {tx.reference_id && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                Ref: {tx.reference_id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 text-xs max-w-xs truncate">
                        {tx.description}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={isCredit ? 'text-emerald-700' : 'text-red-600'}>
                          {isCredit ? `+${tx.amount} LC` : `${tx.amount} LC`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-gray-800">
                        {tx.balance_after} LC
                      </td>

                      <td className="py-3.5 px-4 text-right text-gray-400 text-xs">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
