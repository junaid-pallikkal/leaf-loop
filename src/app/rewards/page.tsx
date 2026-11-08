import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Gift, IndianRupee, ShieldCheck, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { formatCoins, formatINR } from '@/lib/utils';
import { Reward } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'Rewards Store Overview | LeafLoop',
  description: 'Explore verified cash disbursements and branded shopping vouchers available for Leaf Coins redemption.',
};

export default async function PublicRewardsPage() {
  const supabase = await createClient();

  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('coin_cost', { ascending: true });

  const rewardList: Reward[] = (rewards as Reward[]) || [];
  const cashRewards = rewardList.filter((r) => r.type === 'cash');
  const voucherRewards = rewardList.filter((r) => r.type !== 'cash');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
          <Gift className="w-4 h-4 text-[#22c55e]" />
          Tangible Real-World Value
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0e2717]">
          LeafLoop Rewards Marketplace
        </h1>
        <p className="text-sm text-gray-600">
          Redeem your hard-earned Leaf Coins for direct bank payouts or instant digital vouchers from popular retail and dining brands.
        </p>
      </div>

      {/* Benchmark Rules Card */}
      <div className="eco-card p-6 bg-gradient-to-r from-emerald-50/50 to-white border border-[#E3EBE3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#166534] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#166534]" />
              Official Conversion Standard
            </h3>
            <p className="text-xs text-gray-600">
              1,000 Leaf Coins = ₹10.00 INR (100 LC per ₹1). Minimum cash payout starts from ₹10.
            </p>
          </div>

          <Link
            href="/dashboard/store"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm whitespace-nowrap"
          >
            Go to My Store
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Cash Payout Tier */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0e2717] flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-700" />
            Direct Bank Payouts
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Transferred directly to your verified bank savings account via IMPS/NEFT with verified UTR reference tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cashRewards.map((reward) => (
            <div
              key={reward.id}
              className="eco-card p-5 bg-white flex flex-col justify-between hover:border-[#86efac] transition-all hover:shadow-sm"
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
                    Coin Cost
                  </span>
                  <span className="text-base font-bold text-[#166534]">
                    {formatCoins(reward.coin_cost)}
                  </span>
                </div>

                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-lg bg-[#F0F6F0] text-[#166534] font-semibold text-xs hover:bg-[#dcfce7] transition-colors"
                >
                  Redeem
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Vouchers Tier */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0e2717] flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            Shopping & Lifestyle Vouchers
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Allocated instantly from authentic inventory with downloadable tamper-evident PDF receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {voucherRewards.map((reward) => (
            <div
              key={reward.id}
              className="eco-card p-5 bg-white flex flex-col justify-between hover:border-[#86efac] transition-all hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] uppercase">
                    Digital Voucher
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
                    Coin Cost
                  </span>
                  <span className="text-base font-bold text-[#166534]">
                    {formatCoins(reward.coin_cost)}
                  </span>
                </div>

                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-lg bg-[#166534] text-white font-semibold text-xs hover:bg-[#14532d] transition-colors"
                >
                  Claim Code
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
