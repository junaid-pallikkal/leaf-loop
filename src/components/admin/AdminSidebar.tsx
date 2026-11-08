'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  CheckSquare,
  IndianRupee,
  Gift,
  FolderTree,
  Coins,
  BarChart3,
  Sliders,
  Leaf,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Profile } from '@/types';

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | null;
  badgeColor?: string;
}

interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<number>(0);
  const [pendingPayouts, setPendingPayouts] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
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

        // Fetch pending submissions count
        const { count: subCount } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingSubmissions(subCount || 0);

        // Fetch requested cash payouts count
        const { count: payCount } = await supabase
          .from('redemptions')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'cash')
          .eq('status', 'requested');
        setPendingPayouts(payCount || 0);
      }
    }

    loadAdminData();
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navSections: AdminNavSection[] = [
    {
      title: 'Command Center',
      items: [
        {
          href: '/admin',
          label: 'System Telemetry',
          icon: ShieldCheck,
          exact: true,
        },
        {
          href: '/admin/submissions',
          label: 'Submissions Triage',
          icon: CheckSquare,
          badge: pendingSubmissions > 0 ? `${pendingSubmissions} new` : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-black',
        },
        {
          href: '/admin/payouts',
          label: 'Cash Disbursements',
          icon: IndianRupee,
          badge: pendingPayouts > 0 ? `${pendingPayouts} req` : null,
          badgeColor: 'bg-emerald-400 text-slate-950 font-black',
        },
      ],
    },
    {
      title: 'Store & Economy',
      items: [
        {
          href: '/admin/rewards',
          label: 'Rewards & Inventory',
          icon: Gift,
        },
        {
          href: '/admin/categories',
          label: 'Categories & AI Rules',
          icon: FolderTree,
        },
        {
          href: '/admin/wallets',
          label: 'Double-Entry Ledger',
          icon: Coins,
        },
      ],
    },
    {
      title: 'Analytics & Controls',
      items: [
        {
          href: '/admin/analytics',
          label: 'Fiscal & AI Analytics',
          icon: BarChart3,
        },
        {
          href: '/admin/settings',
          label: 'System Parameters',
          icon: Sliders,
        },
      ],
    },
  ];

  return (
    <>
      {/* MOBILE TOP BAR (High-contrast admin phone header) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-3 sm:px-4 bg-[#090e17] text-white border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Open administration navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">LeafLoop</span>
              <span className="ml-1 text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800/60 font-mono">
                ADMIN
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-colors"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>Citizen App</span>
        </Link>
      </div>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ADMIN PERSISTENT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#090e17] text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">
                  LeafLoop
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 font-mono">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Authoritative Suite</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECURITY STATUS BANNER */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PostgreSQL Ledger Active
          </span>
          <span className="text-[9px] text-slate-400 font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded">
            RLS Locked
          </span>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {sec.title}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-emerald-300 before:rounded-r'
                        : 'text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* CITIZEN APP SWITCHER */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">
              Workspaces
            </div>
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-900/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Switch to Citizen App</span>
              </span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </Link>
          </div>
        </div>

        {/* ADMIN PROFILE FOOTER */}
        <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-900/40">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {profile?.full_name || 'System Admin'}
                </p>
                <p className="text-[10px] text-emerald-400 font-mono truncate">Authoritative Mode</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
