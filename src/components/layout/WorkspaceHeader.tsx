'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Coins, Camera, Flame, Sparkles, ChevronRight, Bell, ShieldCheck } from 'lucide-react';
import { formatCoins } from '@/lib/utils';
import { Profile, WalletAccount } from '@/types';

export default function WorkspaceHeader() {
  const pathname = usePathname();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (prof) setProfile(prof);

        const { data: wal } = await supabase
          .from('wallet_accounts')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (wal) setWallet(wal);
      }
    }

    loadData();
  }, []);

  const getPageInfo = () => {
    if (pathname === '/dashboard') {
      return { title: 'Citizen Command Center', subtitle: 'Overview, pending reviews & streak metrics' };
    }
    if (pathname.startsWith('/dashboard/capture')) {
      return { title: 'Capture Environmental Habit', subtitle: 'AI Vision photo verification & coin award' };
    }
    if (pathname.startsWith('/dashboard/wallet')) {
      return { title: 'Leaf Coin Wallet Ledger', subtitle: 'Double-entry cryptographic transaction audit' };
    }
    if (pathname.startsWith('/dashboard/store')) {
      return { title: 'Rewards Marketplace', subtitle: 'Direct bank payouts & retail shopping vouchers' };
    }
    if (pathname.startsWith('/dashboard/activities')) {
      return { title: 'Environmental Activity History', subtitle: 'All photographic submissions & verification status' };
    }
    if (pathname.startsWith('/dashboard/redemptions')) {
      return { title: 'Redemption Slips & PDF Receipts', subtitle: 'Cryptographic handover certificates with QR codes' };
    }
    if (pathname.startsWith('/dashboard/leaderboard')) {
      return { title: 'Citizen Eco Leaderboard', subtitle: 'Community rankings by verified contribution points' };
    }
    if (pathname.startsWith('/dashboard/analytics')) {
      return { title: 'Personal Environmental Footprint', subtitle: 'Verified CO₂ abatement & coin velocity statistics' };
    }
    if (pathname.startsWith('/dashboard/profile')) {
      return { title: 'Citizen Profile & Banking Preset', subtitle: 'Account preferences & encrypted payout details' };
    }
    return { title: 'Citizen Workspace', subtitle: 'Every Good Habit Counts' };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="hidden md:flex items-center justify-between h-18 px-8 bg-white/90 backdrop-blur-md border-b border-[#E3EBE3] sticky top-0 z-30 transition-all">
      {/* LEFT: TITLE & SUBTITLE */}
      <div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold mb-0.5">
          <span>LeafLoop</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-[#166534]">{pageInfo.title}</span>
        </div>
        <h1 className="text-base font-extrabold text-[#0e2717] tracking-tight">{pageInfo.title}</h1>
      </div>

      {/* RIGHT: ACTIONS & USER SUMMARY */}
      <div className="flex items-center gap-3">
        {/* Habit Streak Widget */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Active Streak</span>
        </div>

        {/* Quick Capture Button */}
        <Link
          href="/dashboard/capture"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#166534] to-[#22c55e] hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all hover:scale-102"
        >
          <Camera className="w-3.5 h-3.5 text-[#86efac]" />
          <span>Capture Action</span>
        </Link>

        {/* Live Coin Balance Pill */}
        <Link
          href="/dashboard/wallet"
          title="Open Wallet Ledger"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#dcfce7] border border-[#86efac] text-[#166534] hover:bg-[#bbf7d0] transition-colors shadow-2xs group"
        >
          <div className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center">
            <Coins className="w-3 h-3 text-[#86efac] group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs font-black">
            {wallet ? formatCoins(wallet.available_balance) : '0'} LC
          </span>
        </Link>

        {/* Profile Avatar Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 p-1 pl-2 pr-3 rounded-xl border border-gray-200 hover:border-[#166534] transition-all bg-white hover:bg-gray-50"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#166534] to-[#14532d] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
              {profile?.full_name?.charAt(0) || 'C'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22c55e] border border-white" />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-bold text-gray-800 leading-none">
              {profile?.full_name?.split(' ')[0] || 'Citizen'}
            </p>
            <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
              {profile?.role === 'admin' ? 'Superadmin' : 'Member'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
