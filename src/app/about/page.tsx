import React from 'react';
import Link from 'next/link';
import {
  Leaf,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Coins,
  ArrowRight,
  Sparkles,
  TreePine,
  Recycle,
  Scale,
  Users2,
  Lock,
} from 'lucide-react';

export const metadata = {
  title: 'About LeafLoop – Every Good Habit Counts',
  description: 'Learn how LeafLoop revolutionizes environmental responsibility through AI verification, Leaf Coins, and authentic cash and voucher disbursements.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
          <Leaf className="w-4 h-4 text-[#22c55e]" />
          About LeafLoop (eco bonus)
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0e2717]">
          Every Good Habit Counts.
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          LeafLoop exists to make everyday environmental stewardship verifiable, rewarding, and economically empowering for students, individuals, and communities everywhere.
        </p>
      </div>

      {/* The Mission */}
      <div className="eco-card p-8 bg-white border border-[#E3EBE3] space-y-4">
        <h2 className="text-2xl font-bold text-[#0e2717] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#166534]" />
          Our Core Mission
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          While climate discussions often center on macro-level industrial policies, billions of individual micro-actions go unnoticed. Segregating kitchen recyclables, planting a terrace sapling, choosing a bicycle over a motorbike, or cleaning a community park are the foundational blocks of genuine sustainability.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          LeafLoop closes this gap by transforming voluntary environmental habits into a quantifiable digital currency—<strong>Leaf Coins (LC)</strong>—which can be redeemed for authentic cash disbursements directly to your bank account or used to claim top-tier shopping and food vouchers.
        </p>
      </div>

      {/* Dual Verification Philosophy: AI + Admin */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            Verification Architecture
          </span>
          <h2 className="text-2xl font-bold text-[#0e2717] mt-1">
            Two-Tier Trust: AI + Human Governance
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Why AI alone is never treated as absolute proof of real-world activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="eco-card p-6 bg-white border border-[#E3EBE3] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#166534] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h3 className="text-lg font-bold text-[#0e2717]">Tier 1: AI Vision & Fraud Detection</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              When a citizen uploads a photograph, our computer vision models analyze pixel composition, item categories, and environmental context. Simultaneously, cryptographic perceptual hashing checks against previous database submissions to flag duplicate photos, screenshot spoofs, or suspicious anomalies.
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                Automated object & category recognition
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                Cryptographic duplicate photo detection
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                Confidence score rating (0.00 – 1.00)
              </li>
            </ul>
          </div>

          <div className="eco-card p-6 bg-white border border-[#E3EBE3] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="text-lg font-bold text-[#0e2717]">Tier 2: Administrator Governance</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              High-confidence activities under configured thresholds can be automatically approved, but any uncertain, suspicious, or high-value submission is routed to the human Administrator verification queue. Admins inspect the high-resolution photo, review AI confidence notes, and can approve, reject, or adjust coin rewards with comprehensive audit logging.
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Human review for edge cases & flagged photos
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Correction of mistaken categories
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Full audit trails for reward overrides
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tokenomics & Rewards Integrity */}
      <div className="eco-card p-8 bg-white border border-[#E3EBE3] space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
            Financial Integrity
          </span>
          <h2 className="text-2xl font-bold text-[#0e2717] mt-1">
            Leaf Coin Tokenomics & Double-Entry Ledger
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Never a frontend-edited number. Every coin is backed by immutable database transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E3EBE3]">
            <p className="text-xs text-gray-500 font-medium">Conversion Standard</p>
            <p className="text-lg font-bold text-[#166534] mt-1">1,000 LC = ₹10 INR</p>
            <p className="text-[11px] text-gray-400 mt-1">Admin configurable rate</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E3EBE3]">
            <p className="text-xs text-gray-500 font-medium">Payout Channels</p>
            <p className="text-lg font-bold text-gray-900 mt-1">IMPS / NEFT / UPI</p>
            <p className="text-[11px] text-gray-400 mt-1">Direct to verified bank account</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E3EBE3]">
            <p className="text-xs text-gray-500 font-medium">Voucher Inventory</p>
            <p className="text-lg font-bold text-gray-900 mt-1">Genuine Serial Codes</p>
            <p className="text-[11px] text-gray-400 mt-1">Amazon, Flipkart, Starbucks & more</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link
          href="/dashboard/capture"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#166534] text-white font-semibold text-sm hover:bg-[#14532d] shadow-sm transition-all"
        >
          Capture Your First Habit Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
