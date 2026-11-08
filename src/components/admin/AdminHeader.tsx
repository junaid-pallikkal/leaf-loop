'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Leaf, ExternalLink, Lock, CheckSquare, IndianRupee } from 'lucide-react';
import { Profile } from '@/types';

export default function AdminHeader() {
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function loadProfile() {
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

        const { count } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingCount(count || 0);
      }
    }

    loadProfile();
  }, [pathname]);

  const getPageTitle = () => {
    if (pathname === '/admin') return { title: 'System Telemetry & Activity Velocity', section: 'Overview' };
    if (pathname.startsWith('/admin/submissions')) return { title: 'Evidence Triage & AI Verification', section: 'Verification' };
    if (pathname.startsWith('/admin/payouts')) return { title: 'Cash Payout Disbursements', section: 'Financial' };
    if (pathname.startsWith('/admin/rewards')) return { title: 'Rewards Catalog & Voucher Inventory', section: 'Economy' };
    if (pathname.startsWith('/admin/categories')) return { title: 'Environmental Categories & AI Rules', section: 'Economy' };
    if (pathname.startsWith('/admin/wallets')) return { title: 'Double-Entry Ledger & Balance Auditing', section: 'Financial' };
    if (pathname.startsWith('/admin/analytics')) return { title: 'Platform Financial Outflow & Analytics', section: 'Reports' };
    if (pathname.startsWith('/admin/settings')) return { title: 'System Operational Configuration', section: 'System' };
    return { title: 'Admin Control Center', section: 'Administration' };
  };

  const page = getPageTitle();

  return (
    <header className="hidden md:flex items-center justify-between h-18 px-8 bg-white border-b border-[#E3EBE3] sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono mb-0.5">
          <span>LeafLoop Admin</span>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{page.section}</span>
        </div>
        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">{page.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* PostgreSQL Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-mono font-bold">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL TLS</span>
        </div>

        {/* Pending Submissions Alert Pill (if any) */}
        {pendingCount > 0 && (
          <Link
            href="/admin/submissions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingCount} Pending Triage</span>
          </Link>
        )}

        {/* Switch to Citizen App */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-[#166534] hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-all hover:scale-102"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          <span>Citizen App</span>
          <ExternalLink className="w-3 h-3 text-emerald-600" />
        </Link>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {profile?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-gray-900 leading-none">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-emerald-600 font-mono font-semibold leading-none mt-1">
              Superadmin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
