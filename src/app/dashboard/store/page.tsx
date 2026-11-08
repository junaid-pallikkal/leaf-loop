'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Gift,
  Coins,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileDown,
  Info,
  Building,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { formatCoins, formatINR, maskBankAccount } from '@/lib/utils';
import { Reward, Profile, WalletAccount } from '@/types';
import { generateVoucherPDFReceipt } from '@/lib/pdf/generate-receipt';
import confetti from 'canvas-confetti';

export default function StorePage() {
  const supabase = createClient();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [modalType, setModalType] = useState<'cash' | 'voucher' | null>(null);

  // Cash form fields
  const [bankAccount, setBankAccount] = useState('');
  const [confirmBankAccount, setConfirmBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success state
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    async function loadStore() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) {
        setProfile(prof);
        if (prof.bank_account_number) setBankAccount(prof.bank_account_number);
        if (prof.bank_account_number) setConfirmBankAccount(prof.bank_account_number);
        if (prof.bank_ifsc) setBankIfsc(prof.bank_ifsc);
      }

      // 2. Wallet
      const { data: wal } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (wal) setWallet(wal);

      // 3. Rewards Catalog
      const { data: rewList } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('coin_cost', { ascending: true });
      if (rewList) setRewards(rewList as Reward[]);

      setLoading(false);
    }

    loadStore();
  }, []);

  const openRedeemModal = (reward: Reward) => {
    setSelectedReward(reward);
    setFormError(null);
    setSuccessData(null);
    if (reward.type === 'cash') {
      setModalType('cash');
    } else {
      setModalType('voucher');
    }
  };

  const closeModal = () => {
    setSelectedReward(null);
    setModalType(null);
    setFormError(null);
    setSuccessData(null);
  };

  // Submit Cash Payout Request
  const handleCashRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward) return;

    if (bankAccount !== confirmBankAccount) {
      setFormError('Bank Account Numbers do not match.');
      return;
    }

    if (!bankIfsc || bankIfsc.trim().length < 5) {
      setFormError('Please enter a valid Bank IFSC code.');
      return;
    }

    if ((wallet?.available_balance ?? 0) < selectedReward.coin_cost) {
      setFormError(
        `Insufficient Leaf Coins. Needed ${selectedReward.coin_cost} LC, available ${wallet?.available_balance ?? 0} LC.`
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await supabase.rpc('request_cash_redemption', {
        p_reward_id: selectedReward.id,
        p_bank_account: bankAccount.trim(),
        p_bank_ifsc: bankIfsc.trim().toUpperCase(),
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessData(data);
      // Update local wallet balance
      if (wallet) {
        setWallet({
          ...wallet,
          available_balance: data.balance_after,
          total_redeemed: wallet.total_redeemed + selectedReward.coin_cost,
        });
      }

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#166534', '#3b82f6'],
      });
    } catch (err: any) {
      setFormError(err.message || 'Redemption request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Voucher Redemption
  const handleVoucherRedeem = async () => {
    if (!selectedReward) return;

    if ((wallet?.available_balance ?? 0) < selectedReward.coin_cost) {
      setFormError(
        `Insufficient Leaf Coins. Needed ${selectedReward.coin_cost} LC, available ${wallet?.available_balance ?? 0} LC.`
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await supabase.rpc('redeem_voucher_code', {
        p_reward_id: selectedReward.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessData(data);
      // Update local wallet balance
      if (wallet) {
        setWallet({
          ...wallet,
          available_balance: data.balance_after,
          total_redeemed: wallet.total_redeemed + selectedReward.coin_cost,
        });
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#86efac', '#eab308', '#3b82f6'],
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to allocate voucher code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger PDF download
  const handleDownloadPDF = () => {
    if (!successData || !selectedReward || !profile) return;

    const doc = generateVoucherPDFReceipt({
      redemption: {
        receipt_id: successData.receipt_id,
        reward_value_inr: successData.reward_value_inr,
        coins_spent: successData.coins_spent,
        status: successData.status || 'PAID',
        voucher_code: successData.voucher_code,
        bank_account_masked: successData.bank_account_masked,
        bank_ifsc: bankIfsc,
        created_at: new Date().toISOString(),
        type: selectedReward.type,
      },
      user: profile,
      reward: selectedReward,
    });

    doc.save(`LeafLoop_Receipt_${successData.receipt_id}.pdf`);
  };

  const cashRewards = rewards.filter((r) => r.type === 'cash');
  const voucherRewards = rewards.filter((r) => r.type !== 'cash');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header + Balance Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EBE3] shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
            <Gift className="w-4 h-4 text-[#22c55e]" />
            Rewards Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
            Redeem Leaf Coins
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Select instant cash disbursements or genuine brand voucher codes.
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-[#F7FAF7] border border-[#E3EBE3] p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">
              Your Available Balance
            </span>
            <span className="text-xl font-extrabold text-[#166534]">
              {formatCoins(wallet?.available_balance ?? 0)}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              (≈ {formatINR((wallet?.available_balance ?? 0) / 100)})
            </span>
          </div>
        </div>
      </div>

      {/* Cash Payouts Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#0e2717] flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-700" />
            Direct Bank Cash Disbursements
          </h2>
          <p className="text-xs text-gray-500">
            Transferred directly to your verified Indian bank account. Default rate: 1,000 LC = ₹10.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cashRewards.map((reward) => {
            const canAfford = (wallet?.available_balance ?? 0) >= reward.coin_cost;

            return (
              <div
                key={reward.id}
                className="eco-card p-5 bg-white flex flex-col justify-between hover:border-[#86efac] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] uppercase">
                      Bank Transfer
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {reward.remaining_quantity} available
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1">{reward.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{reward.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-medium block">
                      Cost
                    </span>
                    <span className="text-base font-bold text-[#166534]">
                      {formatCoins(reward.coin_cost)}
                    </span>
                  </div>

                  <button
                    onClick={() => openRedeemModal(reward)}
                    disabled={!canAfford || reward.remaining_quantity <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      canAfford && reward.remaining_quantity > 0
                        ? 'bg-[#166534] text-white hover:bg-[#14532d] shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? 'Need More LC' : 'Redeem Cash'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Vouchers Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#0e2717] flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            Shopping & Dining Digital Vouchers
          </h2>
          <p className="text-xs text-gray-500">
            Allocated instantly from authentic inventory with instant downloadable PDF receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {voucherRewards.map((reward) => {
            const canAfford = (wallet?.available_balance ?? 0) >= reward.coin_cost;

            return (
              <div
                key={reward.id}
                className="eco-card p-5 bg-white flex flex-col justify-between hover:border-[#86efac] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] uppercase">
                      E-Voucher
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {reward.remaining_quantity} in stock
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1">{reward.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{reward.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-medium block">
                      Cost
                    </span>
                    <span className="text-base font-bold text-[#166534]">
                      {formatCoins(reward.coin_cost)}
                    </span>
                  </div>

                  <button
                    onClick={() => openRedeemModal(reward)}
                    disabled={!canAfford || reward.remaining_quantity <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      canAfford && reward.remaining_quantity > 0
                        ? 'bg-[#166534] text-white hover:bg-[#14532d] shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? 'Need More LC' : 'Claim Voucher'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REDEMPTION MODAL */}
      {selectedReward && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-2xl border border-gray-200 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534]">
                  {selectedReward.type === 'cash' ? 'Cash Payout' : 'Voucher Claim'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {selectedReward.title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Success Result */}
            {successData ? (
              <div className="space-y-5 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-gray-900">
                    Redemption Successful!
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    Receipt ID: {successData.receipt_id}
                  </p>
                </div>

                {/* If voucher, show code */}
                {successData.voucher_code && (
                  <div className="p-4 bg-[#dcfce7] rounded-xl border border-[#86efac] space-y-1">
                    <span className="text-[10px] text-gray-600 uppercase font-semibold">
                      Your Exclusive Voucher Code
                    </span>
                    <p className="text-xl font-mono font-bold text-[#166534] tracking-wider">
                      {successData.voucher_code}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Copy and paste at checkout on merchant website/app.
                    </p>
                  </div>
                )}

                {/* If cash, show processing message */}
                {modalType === 'cash' && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Payout Dispatched for Audit
                    </p>
                    <p className="text-[11px] leading-relaxed text-emerald-800">
                      Payout of {formatINR(selectedReward.reward_value_inr)} has been placed. Funds will be transferred to your account ({maskBankAccount(bankAccount)}) within 24–48 business hours via IMPS.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Official PDF Receipt
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* If not redeemed yet, show confirmation/form */
              <div className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Coin deduction preview */}
                <div className="p-3.5 rounded-xl bg-[#F0F6F0] border border-[#E3EBE3] flex items-center justify-between text-xs">
                  <span className="text-gray-600">Total Coins to Deduct:</span>
                  <span className="font-bold text-[#166534] text-sm">
                    {formatCoins(selectedReward.coin_cost)}
                  </span>
                </div>

                {modalType === 'cash' ? (
                  <form onSubmit={handleCashRedeem} className="space-y-3.5">
                    {/* Beneficiary Details */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                      <p className="font-semibold text-gray-800">Beneficiary Information:</p>
                      <p>Name: {profile?.full_name || 'Registered Citizen'}</p>
                      <p>Email: {profile?.email}</p>
                      {profile?.phone && <p>Mobile: {profile.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="e.g. 100234567890"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirm Bank Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={confirmBankAccount}
                        onChange={(e) => setConfirmBankAccount(e.target.value)}
                        placeholder="Re-enter bank account number"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bank IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-3 py-2 text-xs uppercase font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    {/* Processing notice */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                      <strong>Processing Notice:</strong> Payout requests are audited and processed within 24 to 48 business hours directly to your verified bank account via IMPS/NEFT.
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Confirm Cash Payout'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Voucher confirmation */
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      An authentic digital voucher code will be instantly drawn from our inventory and assigned to your account. You will receive an official verifiable PDF receipt.
                    </p>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                      <p className="font-semibold text-gray-800">Terms & Conditions:</p>
                      <p>{selectedReward.terms_and_conditions || 'Valid for 12 months from issuance. Non-refundable.'}</p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleVoucherRedeem}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Allocating Code...
                          </>
                        ) : (
                          'Confirm & Claim Voucher'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
