'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide the marketing footer on dashboard & admin suites
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-white border-t border-[#E3EBE3] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#166534] flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 text-[#86efac]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#166534]">
                LeafLoop
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every Good Habit Counts. Empowering citizens, schools, and communities to convert verifiable everyday eco actions into real Leaf Coins, cash payouts, and brand rewards.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dcfce7] text-[11px] font-semibold text-[#166534]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
              AI + Admin Verified Platform
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/about" className="hover:text-[#166534] transition-colors">
                  About LeafLoop & Mission
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-[#166534] transition-colors">
                  Public Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#166534] transition-colors">
                  Steward Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-[#166534] transition-colors">
                  Rewards Store & Cash Payouts
                </Link>
              </li>
              <li>
                <Link href="/dashboard/capture" className="hover:text-[#166534] transition-colors">
                  Capture Environmental Habit
                </Link>
              </li>
            </ul>
          </div>

          {/* Environmental Action Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3">
              Action Categories
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                Waste Segregation & Recycling
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                Tree Plantation & Urban Gardening
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                Community Clean-up Drives
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                Zero-Emission Commute
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                Composting & Organic Waste
              </li>
            </ul>
          </div>

          {/* Verification & Payout Guarantee */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3">
              Transparency & Security
            </h4>
            <div className="bg-[#F7FAF7] p-3 rounded-lg border border-[#E3EBE3] space-y-2 text-xs text-gray-600">
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
                Immutable Ledger
              </p>
              <p className="text-[11px] leading-relaxed text-gray-500">
                All Leaf Coin issuances and redemptions operate via atomic PostgreSQL double-entry ledgers. Real-time bank payouts via IMPS/NEFT with official UTR records.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E3EBE3] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} LeafLoop (eco bonus). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for our Planet.
          </p>
        </div>
      </div>
    </footer>
  );
}
