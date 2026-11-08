'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Leaf,
  Camera,
  Coins,
  Trophy,
  BarChart3,
  Gift,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { formatCoins } from '@/lib/utils';
import { Profile, WalletAccount } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadAuth() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        if (prof) setProfile(prof);

        const { data: wal } = await supabase
          .from('wallet_accounts')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
        if (wal) setWallet(wal);
      }
    }

    loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
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
      } else {
        setProfile(null);
        setWallet(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/about', label: 'About', icon: Leaf },
    { href: '/impact', label: 'Impact Dashboard', icon: BarChart3, badge: 'Live' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/rewards', label: 'Rewards Store', icon: Gift },
  ];

  // Hide the marketing navbar inside dashboard and admin suites (which have their own dedicated persistent sidebars)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#E3EBE3] shadow-xs'
          : 'bg-[#F7FAF7]/90 backdrop-blur-sm border-b border-[#E3EBE3]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#14532d] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Leaf className="w-5 h-5 text-[#86efac]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#166534]">
                  LeafLoop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534] bg-[#dcfce7] border border-[#86efac]/50 px-1.5 py-0.5 rounded-full">
                  eco bonus
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                Every Good Habit Counts
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-[#166534] bg-[#dcfce7] shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-[#166534] hover:bg-gray-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#166534]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP RIGHT AUTH / ACTION CLUSTER */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                {/* Admin Mode Pill (If Superadmin) */}
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-300 hover:bg-amber-500/20 transition-colors shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Admin Suite</span>
                  </Link>
                )}

                {/* Coin Wallet Pill */}
                <Link
                  href="/dashboard/wallet"
                  title="View Coin Wallet & Ledger"
                  className="flex items-center gap-2 bg-[#dcfce7] border border-[#86efac] px-3.5 py-1.5 rounded-xl hover:bg-[#bbf7d0] transition-all shadow-2xs group"
                >
                  <div className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center">
                    <Coins className="w-3 h-3 text-[#86efac] group-hover:rotate-12 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-[#166534]">
                    {formatCoins(wallet?.available_balance ?? 50)}{' '}
                    <span className="text-[10px] font-normal text-emerald-700">LC</span>
                  </span>
                </Link>

                {/* Direct Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold shadow-xs hover:bg-[#14532d] transition-all hover:scale-102"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#86efac]" />
                  <span>Command Center</span>
                  <ArrowRight className="w-3 h-3 text-[#86efac]" />
                </Link>

                {/* Quick Profile Avatar */}
                <Link
                  href="/dashboard/profile"
                  className="w-8 h-8 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center font-bold text-xs uppercase border border-emerald-300 hover:scale-105 transition-transform"
                  title="Profile & Settings"
                >
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-gray-700 hover:text-[#166534] px-4 py-2 rounded-xl hover:bg-gray-100/70 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#166534] text-white px-4 py-2.5 rounded-xl hover:bg-[#14532d] shadow-sm transition-all hover:scale-102"
                >
                  <span>Get Started</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#22c55e]/30 text-[#86efac] text-[10px]">
                    +50 LC
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#86efac]" />
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE CONTROLS */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                href="/dashboard/wallet"
                className="flex items-center gap-1.5 bg-[#dcfce7] border border-[#86efac] px-2.5 py-1 rounded-full text-xs font-bold text-[#166534]"
              >
                <Coins className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>{formatCoins(wallet?.available_balance ?? 50)}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 hover:text-[#166534] rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN SLIDE-DOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3EBE3] bg-white px-5 pt-4 pb-8 space-y-4 shadow-xl animate-fade-in">
          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Public Portals
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl min-h-[44px] ${
                    isActive
                      ? 'bg-[#dcfce7] text-[#166534] font-bold'
                      : 'text-gray-700 hover:bg-[#F7FAF7]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#166534]" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section (If Logged In) */}
          {user ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                My Citizen Account
              </p>

              <Link
                href="/dashboard"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-bold shadow-xs min-h-[44px]"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#86efac]" />
                  Command Center
                </span>
                <ChevronRight className="w-4 h-4 text-[#86efac]" />
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/dashboard/capture"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-[#166534] text-xs font-bold border border-emerald-200 min-h-[44px]"
                >
                  <Camera className="w-4 h-4" />
                  Capture Habit
                </Link>
                <Link
                  href="/dashboard/wallet"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 min-h-[44px]"
                >
                  <Coins className="w-4 h-4 text-amber-600" />
                  Wallet Ledger
                </Link>
              </div>

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-300 text-xs font-bold min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Admin High-Security Suite
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({profile?.full_name || user.email})
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/auth/register"
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#166534] rounded-xl shadow-md min-h-[44px]"
              >
                <span>Create Free Account (+50 LC Bonus)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#86efac]" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center py-2.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl min-h-[44px]"
              >
                Sign In to Existing Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
