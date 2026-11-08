'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Leaf,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom');

  // Role Tab State: 'citizen' or 'admin'
  const [activeRole, setActiveRole] = useState<'citizen' | 'admin'>('citizen');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // One-click quick fill for Demo accounts
  const fillCredentials = (role: 'citizen' | 'admin') => {
    setError(null);
    if (role === 'admin') {
      setActiveRole('admin');
      setEmail('admin@leafloop.eco');
      setPassword('AdminEco2026!');
      toast.info('Filled Administrator demo credentials.');
    } else {
      setActiveRole('citizen');
      setEmail('demo@leafloop.eco');
      setPassword('EcoDemo2026!');
      toast.info('Filled Citizen Steward demo credentials.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        toast.error('Authentication failed: ' + signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch profile to verify role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single();

        const userRole = profile?.role || 'user';

        // If user logged in under Admin mode, verify they actually have the admin role
        if (activeRole === 'admin') {
          if (userRole !== 'admin') {
            await supabase.auth.signOut();
            const msg =
              'Access Restricted: This account does not possess Superadmin privileges. Please sign in via Citizen mode.';
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }

          toast.success(`Welcome back, Administrator ${profile?.full_name || ''}!`);
          router.push('/admin');
          router.refresh();
          return;
        }

        // Citizen Mode
        toast.success(`Signed in successfully. Welcome back, ${profile?.full_name || 'Citizen'}!`);
        if (userRole === 'admin' && !redirectedFrom) {
          // If an admin signs in via Citizen mode, route to dashboard or give option
          router.push(redirectedFrom || '/dashboard');
        } else {
          router.push(redirectedFrom || '/dashboard');
        }
        router.refresh();
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E3EBE3] shadow-md transition-all">
      {/* BRAND & HEADER */}
      <div className="text-center space-y-2">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-sm transition-colors ${
            activeRole === 'admin'
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-emerald-400'
              : 'bg-gradient-to-br from-[#166534] to-[#14532d] text-white'
          }`}
        >
          {activeRole === 'admin' ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          ) : (
            <Leaf className="w-6 h-6 text-[#86efac]" />
          )}
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#0e2717]">
          {activeRole === 'admin' ? 'Administrator Portal' : 'Sign In to LeafLoop'}
        </h2>
        <p className="text-xs text-gray-500">
          {activeRole === 'admin'
            ? 'High-security access to submission triage & economy controls'
            : 'Every Good Habit Counts • Access your wallet & rewards'}
        </p>
      </div>

      {/* ROLE SWITCHER TABS (CITIZEN VS ADMIN) */}
      <div className="grid grid-cols-2 p-1 bg-gray-100/90 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => {
            setActiveRole('citizen');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeRole === 'citizen'
              ? 'bg-white text-[#166534] shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Citizen Steward</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('admin');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeRole === 'admin'
              ? 'bg-slate-900 text-emerald-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>System Admin</span>
        </button>
      </div>

      {/* QUICK DEMO CREDENTIALS SHORTCUTS */}
      <div className="p-2.5 rounded-xl bg-[#F0F6F0] border border-[#E3EBE3] flex items-center justify-between text-xs">
        <span className="text-[11px] text-gray-600 font-medium">Quick Fill Credentials:</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => fillCredentials('citizen')}
            className="px-2 py-1 rounded-md bg-white border border-gray-200 text-[#166534] font-semibold text-[10px] hover:bg-emerald-50 transition-colors shadow-2xs"
          >
            Citizen Demo
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('admin')}
            className="px-2 py-1 rounded-md bg-slate-900 text-white font-semibold text-[10px] hover:bg-black transition-colors shadow-2xs"
          >
            Admin Demo
          </button>
        </div>
      </div>

      {/* ERROR ALERT BANNER */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {activeRole === 'admin' ? 'Admin Email Address' : 'Citizen Email Address'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeRole === 'admin' ? 'admin@leafloop.eco' : 'citizen@leafloop.eco'}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-[#166534] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 ${
            activeRole === 'admin'
              ? 'bg-slate-900 hover:bg-black text-emerald-400'
              : 'bg-[#166534] hover:bg-[#14532d]'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>{activeRole === 'admin' ? 'Enter Admin Suite' : 'Sign In as Citizen'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* FOOTER LINKS */}
      <div className="pt-2 border-t border-gray-100 text-center">
        {activeRole === 'citizen' ? (
          <p className="text-xs text-gray-600">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/auth/register"
              className="font-bold text-[#166534] hover:underline inline-flex items-center gap-1"
            >
              Register & claim 50 coins <Sparkles className="w-3 h-3 text-[#22c55e]" />
            </Link>
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 font-mono">
            Protected under PostgreSQL Row Level Security (RLS) & TLS 1.3
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-gray-400">Loading sign in portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
