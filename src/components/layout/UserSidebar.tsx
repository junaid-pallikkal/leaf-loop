'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Leaf,
  LayoutDashboard,
  Camera,
  Coins,
  Gift,
  History,
  Receipt,
  User,
  ShieldCheck,
  Trophy,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Flame,
  ArrowUpRight,
  HelpCircle,
} from 'lucide-react';
import { formatCoins } from '@/lib/utils';
import { Profile, WalletAccount } from '@/types';

interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  highlight?: boolean;
  badge?: string | null;
}

interface SidebarSection {
  title: string;
  items: SidebarNavItem[];
}

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (prof) setProfile(prof);

        const { data: wal } = await supabase
          .from('wallet_accounts')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (wal) setWallet(wal);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navSections: SidebarSection[] = [
    {
      title: 'Core Platform',
      items: [
        {
          href: '/dashboard',
          label: 'Command Center',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: '/dashboard/capture',
          label: 'Capture Activity',
          icon: Camera,
          highlight: true,
          badge: 'AI Vision',
        },
        {
          href: '/dashboard/activities',
          label: 'Activity History',
          icon: History,
        },
      ],
    },
    {
      title: 'Economy & Rewards',
      items: [
        {
          href: '/dashboard/wallet',
          label: 'Coin Wallet & Ledger',
          icon: Coins,
          badge: `${wallet ? formatCoins(wallet.available_balance) : '0'} LC`,
        },
        {
          href: '/dashboard/store',
          label: 'Rewards Store',
          icon: Gift,
          badge: 'Instant',
        },
        {
          href: '/dashboard/redemptions',
          label: 'Receipts & Payouts',
          icon: Receipt,
        },
      ],
    },
    {
      title: 'Impact Community',
      items: [
        {
          href: '/dashboard/leaderboard',
          label: 'Citizen Leaderboard',
          icon: Trophy,
        },
        {
          href: '/dashboard/analytics',
          label: 'Personal Footprint',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Account Settings',
      items: [
        {
          href: '/dashboard/profile',
          label: 'Profile & Banking',
          icon: User,
        },
      ],
    },
  ];

  return (
    <>
      {/* MOBILE TOP BAR (High-contrast phone header) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-3 sm:px-4 bg-white/95 backdrop-blur-md border-b border-[#E3EBE3]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 hover:text-[#166534] rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#166534] to-[#14532d] flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-4 h-4 text-[#86efac]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#166534]">LeafLoop</span>
          </Link>
        </div>

        <Link
          href="/dashboard/wallet"
          className="min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] border border-[#86efac]/80 text-[#166534] text-xs font-bold shadow-2xs hover:bg-[#bbf7d0] transition-colors"
        >
          <Coins className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>{wallet ? formatCoins(wallet.available_balance) : '0'} LC</span>
        </Link>
      </div>

      {/* MOBILE DRAWER BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* PERSISTENT DESKTOP & MOBILE SLIDE-OUT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-[#E3EBE3] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#E3EBE3] flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#14532d] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Leaf className="w-5 h-5 text-[#86efac]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#166534]">
                  LeafLoop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534] bg-[#dcfce7] border border-[#86efac]/40 px-1.5 py-0.2 rounded-full">
                  eco
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Every Good Habit Counts</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CITIZEN WALLET TELEMETRY CARD */}
        <div className="px-3 pt-3 shrink-0">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#166534] via-[#14532d] to-[#052e16] text-white shadow-sm relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#22c55e]/15 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-[#86efac] mb-1">
              <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                <Coins className="w-3.5 h-3.5 text-[#22c55e]" />
                Available Leaf Coins
              </span>
              <Link
                href="/dashboard/store"
                className="text-[10px] font-bold text-white bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition-colors flex items-center gap-0.5"
              >
                Redeem <ArrowUpRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
              {wallet ? formatCoins(wallet.available_balance) : '0'}
              <span className="text-xs font-semibold text-[#86efac]">LC</span>
              <span className="text-[11px] font-normal text-white/60 ml-auto">
                ≈ ₹{((wallet?.available_balance ?? 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1 text-[#86efac]">
                <Flame className="w-3 h-3 text-amber-400" />
                Active Streak
              </span>
              <Link
                href="/dashboard/wallet"
                className="text-white hover:text-[#86efac] flex items-center gap-0.5 font-medium transition-colors"
              >
                Ledger <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                if (item.highlight) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#166534] to-[#22c55e] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all group my-1.5"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#86efac] animate-pulse" />
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-[#166534] shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-[#dcfce7] text-[#166534] font-bold shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#22c55e] before:rounded-r'
                        : 'text-gray-600 hover:text-[#166534] hover:bg-[#F0F6F0]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#166534]' : 'text-gray-400 group-hover:text-[#166534]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-[#166534]'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-[#dcfce7] group-hover:text-[#166534]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* ADMIN SUITE ELEVATION BANNER (IF ADMIN) */}
          {profile?.role === 'admin' && (
            <div className="pt-2">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                Security & Authority
              </div>
              <Link
                href="/admin"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-bold hover:shadow-xs transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Admin Suite
                </span>
                <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                  Superadmin
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* SIDEBAR FOOTER WITH PROFILE & LOGOUT */}
        <div className="p-3 border-t border-[#E3EBE3] shrink-0 bg-gray-50/50">
          <div className="flex items-center justify-between px-2 py-1.5">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 min-w-0 group hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                  {profile?.full_name?.charAt(0) || 'C'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {profile?.full_name || 'Citizen Steward'}
                </p>
                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  <span>{profile?.role === 'admin' ? 'Administrator' : 'Eco Citizen'}</span>
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly & Elevated Capture Button) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3EBE3] flex items-center justify-around px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg"
      >
        <Link
          href="/dashboard"
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
            pathname === '/dashboard' ? 'text-[#166534] font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] leading-none">Home</span>
        </Link>

        <Link
          href="/dashboard/wallet"
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
            pathname.startsWith('/dashboard/wallet')
              ? 'text-[#166534] font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span className="text-[10px] leading-none">Wallet</span>
        </Link>

        {/* Center Floating Action Button (Elevated Capture Trigger) */}
        <Link
          href="/dashboard/capture"
          title="Capture Environmental Action"
          className="flex flex-col items-center justify-center -mt-6 w-13 h-13 rounded-full bg-gradient-to-tr from-[#166534] to-[#22c55e] text-white shadow-lg active:scale-95 transition-transform border-4 border-white shrink-0"
        >
          <Camera className="w-5 h-5 text-white" />
        </Link>

        <Link
          href="/dashboard/store"
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
            pathname.startsWith('/dashboard/store')
              ? 'text-[#166534] font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span className="text-[10px] leading-none">Store</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-1 rounded-xl text-gray-500 hover:text-[#166534] transition-colors"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] leading-none">Menu</span>
        </button>
      </nav>
    </>
  );
}
