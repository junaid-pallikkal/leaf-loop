'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Mail,
  Phone,
  Building,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { maskBankAccount } from '@/lib/utils';
import { Profile } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // Password change with current password verification
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Admin promotion secret
  const [adminKey, setAdminKey] = useState('');
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setBankAccount(data.bank_account_number || '');
        setBankIfsc(data.bank_ifsc || '');
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const masked = bankAccount ? maskBankAccount(bankAccount) : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          bank_account_number: bankAccount.trim() || null,
          bank_account_masked: masked,
          bank_ifsc: bankIfsc.trim().toUpperCase() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      const okMsg = 'Profile and banking information updated successfully.';
      setSuccessMessage(okMsg);
      toast.success(okMsg);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: fullName,
              phone,
              bank_account_number: bankAccount,
              bank_account_masked: masked,
              bank_ifsc: bankIfsc.toUpperCase(),
            }
          : null
      );
    } catch (err: any) {
      const errMsg = err.message || 'Failed to update profile.';
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      const msg = 'Please enter your current account password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'New password must contain at least 6 characters.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'New password and confirmation password do not match.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (newPassword === currentPassword) {
      const msg = 'New password must be different from your existing password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setUpdatingPassword(true);

    try {
      // 1. Verify Current Password by re-authenticating against Supabase Auth
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error('Current password does not match our records. Please verify and re-enter.');
      }

      // 2. Once verified, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      const successMsg = 'Your account password has been updated successfully!';
      setPasswordSuccess(successMsg);
      toast.success(successMsg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.message || 'Failed to update password.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Secure admin elevation
  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);
    setAdminError(null);
    setPromoting(true);

    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: adminKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify admin key.');

      const successMsg = 'Admin authorization verified! You now have Superadmin privileges.';
      setAdminMessage(successMsg);
      toast.success(successMsg);
      setAdminKey('');
      if (profile) setProfile({ ...profile, role: 'admin' });
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'Invalid authorization key.';
      setAdminError(msg);
      toast.error(msg);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
          <User className="w-4 h-4 text-[#22c55e]" />
          Account & Banking Credentials
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Manage your personal details, default payout bank details, and security credentials.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="eco-card p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#166534] flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Registered Email (Immutable)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                System Role
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-[#dcfce7] text-[#166534]">
                  {profile?.role || 'user'}
                </span>
                {profile?.role === 'admin' && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    (Full Platform Administrator)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banking Defaults */}
        <div className="eco-card p-6 bg-white space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#166534] flex items-center gap-2">
              <Building className="w-4 h-4" /> Default Bank Payout Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Used to automatically pre-fill your cash redemption requests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Savings Account Number
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Account number"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              {profile?.bank_account_masked && (
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Current Masked: {profile.bank_account_masked}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3 py-2 text-xs uppercase font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile & Banking Info
              </>
            )}
          </button>
        </div>
      </form>

      {/* Change Password Card with Current Password Verification */}
      <div className="eco-card p-6 bg-white space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" /> Security & Password
        </h2>
        <p className="text-xs text-gray-500">
          To update your credentials, enter your existing password to verify your identity, followed by your new password.
        </p>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-3 pr-10 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-3 pr-10 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors disabled:opacity-40"
          >
            {updatingPassword ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying & Updating...
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admin Provisioning Section */}
      {profile?.role !== 'admin' && (
        <div className="eco-card p-6 bg-amber-50/50 border border-amber-200 space-y-3">
          <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            System Administrator Authorization
          </h2>
          <p className="text-xs text-amber-800 leading-relaxed">
            Have a system provisioning secret key? Enter it here to securely activate administrator privileges on this account.
          </p>

          {adminMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-emerald-900">
              {adminMessage}
            </div>
          )}

          {adminError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-xs text-red-900">
              {adminError}
            </div>
          )}

          <form onSubmit={handlePromoteAdmin} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="password"
              placeholder="Enter ADMIN_SECRET_KEY"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!adminKey}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 disabled:opacity-50"
            >
              Verify & Elevate
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
