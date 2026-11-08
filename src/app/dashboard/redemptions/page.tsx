'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  FileText,
  FileDown,
  Gift,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate, maskBankAccount } from '@/lib/utils';
import { Redemption, Profile } from '@/types';
import { generateVoucherPDFReceipt } from '@/lib/pdf/generate-receipt';

export default function RedemptionsPage() {
  const supabase = createClient();

  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRedemptions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof);

      const { data: redList } = await supabase
        .from('redemptions')
        .select('*, reward:rewards(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (redList) setRedemptions(redList as any);
      setLoading(false);
    }

    loadRedemptions();
  }, []);

  const copyVoucherCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadPDF = (redemption: Redemption) => {
    if (!profile) return;

    const doc = generateVoucherPDFReceipt({
      redemption,
      user: profile,
      reward: redemption.reward || {
        title: redemption.type === 'cash' ? 'Cash Payout' : 'Digital Voucher',
        reward_value_inr: redemption.reward_value_inr,
      },
    });

    doc.save(`LeafLoop_Receipt_${redemption.receipt_id}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
            <FileText className="w-4 h-4 text-[#22c55e]" />
            Redemption Slips & Voucher Codes
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
            Redemption History
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            View allocated codes, bank payout status, and download tamper-evident official PDF receipts.
          </p>
        </div>

        <Link
          href="/dashboard/store"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          <Gift className="w-4 h-4" />
          Rewards Marketplace
        </Link>
      </div>

      {loading ? (
        <div className="eco-card p-12 bg-white text-center text-xs text-gray-400">
          Loading redemptions...
        </div>
      ) : redemptions.length === 0 ? (
        <div className="eco-card p-12 bg-white text-center space-y-3">
          <Gift className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No redemptions yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Earn Leaf Coins by completing eco habits and redeem them for cash payouts or vouchers.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/store"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold"
            >
              Browse Rewards Store
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {redemptions.map((red) => {
            const isCash = red.type === 'cash';
            const isPaid = red.status === 'paid';
            const isProcessing = red.status === 'processing';
            const isRequested = red.status === 'requested';
            const isRejected = red.status === 'rejected' || red.status === 'refunded';

            return (
              <div
                key={red.id}
                className="eco-card p-5 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-[#86efac] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isCash ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isCash ? <IndianRupee className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        {red.reward?.title || (isCash ? 'Cash Disbursement' : 'Brand Voucher')}
                      </h3>
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
                        {red.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-x-2">
                      <span>Receipt: <strong className="font-mono text-gray-700">{red.receipt_id}</strong></span>
                      <span>•</span>
                      <span>{formatDate(red.created_at)}</span>
                    </div>

                    {/* Cash details */}
                    {isCash && (
                      <p className="text-xs text-gray-600">
                        Account: {red.bank_account_masked || 'Bank Account'} | IFSC: {red.bank_ifsc || 'N/A'}
                        {red.utr_number && (
                          <span className="ml-2 font-mono text-emerald-800 font-bold">
                            (UTR: {red.utr_number})
                          </span>
                        )}
                      </p>
                    )}

                    {/* Voucher code box */}
                    {red.voucher_code && (
                      <div className="inline-flex items-center gap-2 pt-1">
                        <span className="font-mono font-bold text-xs bg-gray-100 px-2.5 py-1 rounded text-gray-900 border border-gray-200">
                          {red.voucher_code}
                        </span>
                        <button
                          onClick={() => copyVoucherCode(red.voucher_code!, red.id)}
                          className="p-1 text-gray-500 hover:text-emerald-700 rounded hover:bg-gray-100"
                          title="Copy Code"
                        >
                          {copiedId === red.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Admin notes if any */}
                    {red.admin_notes && (
                      <p className="text-xs text-gray-500 italic mt-0.5">
                        Admin Note: {red.admin_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-400 block font-medium">Cost</span>
                    <span className="text-sm font-bold text-[#166534]">
                      {formatCoins(red.coins_spent)}
                    </span>
                    <span className="text-xs text-gray-700 block font-semibold">
                      {formatINR(red.reward_value_inr)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadPDF(red)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3EBE3] text-gray-700 hover:text-[#166534] hover:bg-[#F0F6F0] text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#166534]" />
                    PDF Slip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
