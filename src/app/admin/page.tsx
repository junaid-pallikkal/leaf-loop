'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  CheckSquare,
  Clock,
  IndianRupee,
  Coins,
  AlertTriangle,
  Users,
  Gift,
  ArrowRight,
  TrendingUp,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Sliders,
  Loader2,
  X,
  ExternalLink,
  Sparkles,
  Filter,
  ZoomIn,
  RefreshCw,
  AlertCircle,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCoins, formatINR, formatDate, maskBankAccount } from '@/lib/utils';
import { Profile, Activity, ActivityCategory, Reward, Redemption } from '@/types';

export default function AdminOverviewPage() {
  const router = useRouter();
  const supabase = createClient();

  // Authentication & Role
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active View Tab on Dashboard
  const [activeTab, setActiveTab] = useState<
    'overview' | 'submissions' | 'payouts' | 'categories' | 'rewards'
  >('overview');

  // Aggregated Telemetry
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    pendingPayouts: 0,
    pendingPayoutsINR: 0,
    totalUsers: 0,
    totalActivities: 0,
    approvedActivities: 0,
    totalCoinsCirculating: 0,
    totalInrDisbursed: 0,
    totalCategories: 0,
    totalRewards: 0,
  });

  // Data Collections
  const [activities, setActivities] = useState<Activity[]>([]);
  const [payouts, setPayouts] = useState<Redemption[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [payoutFilter, setPayoutFilter] = useState<'requested' | 'processing' | 'paid' | 'rejected' | 'all'>('requested');

  // Modals State
  // 1. Category Modal (Add / Edit)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ActivityCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catBaseCoins, setCatBaseCoins] = useState('50');
  const [catMinConfidence, setCatMinConfidence] = useState('0.70');
  const [catMaxDaily, setCatMaxDaily] = useState('5');
  const [catCo2Offset, setCatCo2Offset] = useState('2.0');
  const [catAutoApprove, setCatAutoApprove] = useState(true);
  const [catSaving, setCatSaving] = useState(false);

  // 2. Reward Modal (Add / Edit)
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [rewardType, setRewardType] = useState<'cash' | 'voucher' | 'gift_card'>('voucher');
  const [rewardCoinCost, setRewardCoinCost] = useState('1000');
  const [rewardValueINR, setRewardValueINR] = useState('10');
  const [rewardQuantity, setRewardQuantity] = useState('50');
  const [rewardTerms, setRewardTerms] = useState('Valid for 12 months. Non-refundable.');
  const [rewardSaving, setRewardSaving] = useState(false);

  // 3. Submission Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activityToReject, setActivityToReject] = useState<Activity | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Blurry or unverified photographic evidence');
  const [customRejectionNotes, setCustomRejectionNotes] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // 4. Payout Disburse Modal (UTR)
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutToProcess, setPayoutToProcess] = useState<Redemption | null>(null);
  const [payoutAction, setPayoutAction] = useState<'paid' | 'processing' | 'rejected'>('paid');
  const [payoutUTR, setPayoutUTR] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutProcessing, setPayoutProcessing] = useState(false);

  // 5. Image Zoom Modal
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  // Initial Load & Auth Check
  useEffect(() => {
    async function checkAuthAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast.error('Unauthorized: Administrator role required.');
        router.push('/dashboard');
        return;
      }

      setCurrentUser(user);
      setAdminProfile(profile);
      await loadDashboardData();
      setLoading(false);
    }

    checkAuthAndLoad();
  }, []);

  // Fetch all live records
  async function loadDashboardData() {
    try {
      setRefreshing(true);

      // 1. Pending & All Submissions
      const { data: actsData, count: actCount } = await supabase
        .from('activities')
        .select('*, category:activity_categories(*), user:profiles(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      const allActivities = (actsData || []) as Activity[];
      setActivities(allActivities);

      const pendingSubCount = allActivities.filter((a) => a.status === 'pending').length;
      const approvedCount = allActivities.filter((a) => a.status === 'approved' || a.status === 'auto_approved').length;

      // 2. Payouts
      const { data: paysData } = await supabase
        .from('redemptions')
        .select('*, user:profiles(*), reward:rewards(*)')
        .eq('type', 'cash')
        .order('created_at', { ascending: false });

      const allPayouts = (paysData || []) as Redemption[];
      setPayouts(allPayouts);

      const pendingPayList = allPayouts.filter(
        (p) => p.status === 'requested' || p.status === 'processing'
      );
      const pendingPayCount = pendingPayList.length;
      const pendingPayINR = pendingPayList.reduce(
        (acc, p) => acc + (Number(p.reward_value_inr) || 0),
        0
      );
      const disbursedINR = allPayouts
        .filter((p) => p.status === 'paid')
        .reduce((acc, p) => acc + (Number(p.reward_value_inr) || 0), 0);

      // 3. Registered Users Count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 4. Total Circulating Coins
      const { data: walletsData } = await supabase
        .from('wallet_accounts')
        .select('available_balance');
      const circulatingCoins = (walletsData || []).reduce(
        (acc, w) => acc + (w.available_balance || 0),
        0
      );

      // 5. Categories
      const { data: catsData } = await supabase
        .from('activity_categories')
        .select('*')
        .order('base_coins', { ascending: false });
      const allCategories = (catsData || []) as ActivityCategory[];
      setCategories(allCategories);

      // 6. Rewards
      const { data: rewsData } = await supabase
        .from('rewards')
        .select('*')
        .order('coin_cost', { ascending: true });
      const allRewards = (rewsData || []) as Reward[];
      setRewards(allRewards);

      setStats({
        pendingSubmissions: pendingSubCount,
        pendingPayouts: pendingPayCount,
        pendingPayoutsINR: pendingPayINR,
        totalUsers: usersCount || 0,
        totalActivities: actCount || allActivities.length,
        approvedActivities: approvedCount,
        totalCoinsCirculating: circulatingCoins,
        totalInrDisbursed: disbursedINR,
        totalCategories: allCategories.length,
        totalRewards: allRewards.length,
      });
    } catch (err: any) {
      toast.error('Failed to load dashboard data: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  }

  // ==========================================
  // 1. SUBMISSION VERIFICATION ACTIONS
  // ==========================================
  const handleQuickApprove = async (act: Activity) => {
    try {
      const { error } = await supabase.rpc('admin_verify_activity', {
        p_activity_id: act.id,
        p_decision: 'approve',
        p_rejection_reason: null,
        p_coin_override: act.category?.base_coins || 50,
        p_admin_notes: 'Quick-approved from Admin Command Center',
      });

      if (error) throw error;

      toast.success(
        `Activity approved! +${act.category?.base_coins || 50} LC credited to ${
          act.user?.full_name || 'Citizen'
        }.`
      );
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to approve activity: ' + err.message);
    }
  };

  const openRejectModal = (act: Activity) => {
    setActivityToReject(act);
    setRejectionReason('Blurry or unverified photographic evidence');
    setCustomRejectionNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityToReject) return;

    setRejecting(true);
    try {
      const fullReason = customRejectionNotes.trim()
        ? `${rejectionReason}: ${customRejectionNotes.trim()}`
        : rejectionReason;

      const { error } = await supabase.rpc('admin_verify_activity', {
        p_activity_id: activityToReject.id,
        p_decision: 'reject',
        p_rejection_reason: fullReason,
        p_coin_override: null,
        p_admin_notes: customRejectionNotes.trim() || null,
      });

      if (error) throw error;

      toast.error(`Activity submission rejected: ${fullReason}`);
      setRejectModalOpen(false);
      setActivityToReject(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to reject activity: ' + err.message);
    } finally {
      setRejecting(false);
    }
  };

  // ==========================================
  // 2. CASH PAYOUT ACTIONS
  // ==========================================
  const openDisburseModal = (p: Redemption, action: 'paid' | 'processing' | 'rejected') => {
    setPayoutToProcess(p);
    setPayoutAction(action);
    setPayoutUTR(p.utr_number || '');
    setPayoutNotes('');
    setPayoutModalOpen(true);
  };

  const handleConfirmPayoutAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutToProcess) return;

    if (payoutAction === 'paid' && !payoutUTR.trim()) {
      toast.error('Please enter a valid Bank UTR / Payment Reference Number.');
      return;
    }

    setPayoutProcessing(true);
    try {
      const { error } = await supabase.rpc('admin_process_cash_payout', {
        p_redemption_id: payoutToProcess.id,
        p_action: payoutAction,
        p_utr_number: payoutUTR.trim() || null,
        p_admin_notes: payoutNotes.trim() || null,
      });

      if (error) throw error;

      if (payoutAction === 'paid') {
        toast.success(
          `Payout of ${formatINR(payoutToProcess.reward_value_inr)} marked as Paid with UTR: ${payoutUTR.trim()}`
        );
      } else if (payoutAction === 'processing') {
        toast.info('Payout status set to Processing.');
      } else {
        toast.error('Payout request rejected. Leaf Coins refunded to citizen wallet.');
      }

      setPayoutModalOpen(false);
      setPayoutToProcess(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to process payout: ' + err.message);
    } finally {
      setPayoutProcessing(false);
    }
  };

  // ==========================================
  // 3. CATEGORY CRUD ACTIONS
  // ==========================================
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
    setCatBaseCoins('50');
    setCatMinConfidence('0.70');
    setCatMaxDaily('5');
    setCatCo2Offset('2.0');
    setCatAutoApprove(true);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: ActivityCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDescription(cat.description);
    setCatBaseCoins(cat.base_coins.toString());
    setCatMinConfidence(cat.min_confidence_score.toString());
    setCatMaxDaily(cat.max_daily_per_user.toString());
    setCatCo2Offset(cat.co2_offset_kg.toString());
    setCatAutoApprove(cat.auto_approve_enabled);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      toast.error('Category name and slug are required.');
      return;
    }

    setCatSaving(true);
    try {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: catDescription.trim(),
        base_coins: parseInt(catBaseCoins, 10) || 50,
        min_confidence_score: parseFloat(catMinConfidence) || 0.7,
        max_daily_per_user: parseInt(catMaxDaily, 10) || 5,
        co2_offset_kg: parseFloat(catCo2Offset) || 2.0,
        auto_approve_enabled: catAutoApprove,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('activity_categories')
          .update(payload)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success(`Category "${payload.name}" updated successfully.`);
      } else {
        const { error } = await supabase.from('activity_categories').insert(payload);
        if (error) throw error;
        toast.success(`New category "${payload.name}" created successfully.`);
      }

      setCategoryModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to save category: ' + err.message);
    } finally {
      setCatSaving(false);
    }
  };

  const toggleCategoryActive = async (cat: ActivityCategory) => {
    try {
      const nextState = !cat.is_active;
      const { error } = await supabase
        .from('activity_categories')
        .update({ is_active: nextState })
        .eq('id', cat.id);
      if (error) throw error;
      toast.success(`Category "${cat.name}" is now ${nextState ? 'Active' : 'Disabled'}.`);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to toggle category: ' + err.message);
    }
  };

  const deleteCategory = async (cat: ActivityCategory) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete category "${cat.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const { error } = await supabase.from('activity_categories').delete().eq('id', cat.id);
      if (error) throw error;
      toast.success(`Category "${cat.name}" removed successfully.`);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to delete category: ' + err.message);
    }
  };

  // ==========================================
  // 4. REWARD CRUD ACTIONS
  // ==========================================
  const openCreateRewardModal = () => {
    setEditingReward(null);
    setRewardTitle('');
    setRewardDescription('');
    setRewardType('voucher');
    setRewardCoinCost('1000');
    setRewardValueINR('10');
    setRewardQuantity('50');
    setRewardTerms('Valid for 12 months. Non-refundable.');
    setRewardModalOpen(true);
  };

  const openEditRewardModal = (reward: Reward) => {
    setEditingReward(reward);
    setRewardTitle(reward.title);
    setRewardDescription(reward.description);
    setRewardType(reward.type);
    setRewardCoinCost(reward.coin_cost.toString());
    setRewardValueINR(reward.reward_value_inr.toString());
    setRewardQuantity(reward.remaining_quantity.toString());
    setRewardTerms(reward.terms_and_conditions || '');
    setRewardModalOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) {
      toast.error('Reward title is required.');
      return;
    }

    setRewardSaving(true);
    try {
      const payload = {
        title: rewardTitle.trim(),
        description: rewardDescription.trim(),
        type: rewardType,
        coin_cost: parseInt(rewardCoinCost, 10) || 1000,
        reward_value_inr: parseFloat(rewardValueINR) || 10,
        total_quantity: parseInt(rewardQuantity, 10) || 50,
        remaining_quantity: parseInt(rewardQuantity, 10) || 50,
        terms_and_conditions: rewardTerms.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editingReward) {
        const { error } = await supabase.from('rewards').update(payload).eq('id', editingReward.id);
        if (error) throw error;
        toast.success(`Reward "${payload.title}" updated successfully.`);
      } else {
        const { error } = await supabase.from('rewards').insert(payload);
        if (error) throw error;
        toast.success(`New reward "${payload.title}" added to store.`);
      }

      setRewardModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to save reward: ' + err.message);
    } finally {
      setRewardSaving(false);
    }
  };

  const toggleRewardActive = async (reward: Reward) => {
    try {
      const nextState = !reward.is_active;
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: nextState })
        .eq('id', reward.id);
      if (error) throw error;
      toast.success(`Reward "${reward.title}" is now ${nextState ? 'Active' : 'Disabled'}.`);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to toggle reward: ' + err.message);
    }
  };

  const deleteReward = async (reward: Reward) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove "${reward.title}"? Associated unredeemed codes will also be removed.`
      )
    ) {
      return;
    }
    try {
      const { error } = await supabase.from('rewards').delete().eq('id', reward.id);
      if (error) throw error;
      toast.success(`Reward "${reward.title}" removed successfully.`);
      loadDashboardData();
    } catch (err: any) {
      toast.error('Failed to delete reward: ' + err.message);
    }
  };

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    const matchesStatus = submissionFilter === 'all' ? true : act.status === submissionFilter;
    const matchesSearch =
      searchQuery === ''
        ? true
        : act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Payouts
  const filteredPayouts = payouts.filter((p) => {
    const matchesStatus = payoutFilter === 'all' ? true : p.status === payoutFilter;
    const matchesSearch =
      searchQuery === ''
        ? true
        : p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.bank_account_masked?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.bank_ifsc?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Categories
  const filteredCategories = categories.filter((c) =>
    searchQuery === ''
      ? true
      : c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Rewards
  const filteredRewards = rewards.filter((r) =>
    searchQuery === ''
      ? true
      : r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#166534]" />
        <p className="text-sm font-semibold text-gray-600">
          Loading Administrator Command Center...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & PRIMARY ACTION CONTROLS */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3EBE3] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] bg-[#dcfce7] px-2.5 py-0.5 rounded-full border border-emerald-300">
              Superadmin Portal
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0e2717] mt-1">
            Administrator Command Center
          </h1>
          <p className="text-xs text-gray-500">
            Real-time verification triage, cash payouts, dynamic categories & rewards management.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateCategoryModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>

          <button
            onClick={openCreateRewardModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Reward
          </button>

          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            title="Refresh All Records"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#166534]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. COMPREHENSIVE TELEMETRY METRIC CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Submissions */}
        <div
          onClick={() => {
            setActiveTab('submissions');
            setSubmissionFilter('pending');
          }}
          className={`eco-card p-4 sm:p-5 bg-white border-l-4 cursor-pointer hover:shadow-md transition-all ${
            stats.pendingSubmissions > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-gray-700">Submissions Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {stats.pendingSubmissions}
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
            <span>Awaiting review</span>
            <span className="text-amber-700 font-semibold flex items-center gap-0.5">
              Triage <ArrowRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Pending Payouts */}
        <div
          onClick={() => {
            setActiveTab('payouts');
            setPayoutFilter('requested');
          }}
          className={`eco-card p-4 sm:p-5 bg-white border-l-4 cursor-pointer hover:shadow-md transition-all ${
            stats.pendingPayouts > 0 ? 'border-l-rose-500' : 'border-l-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-gray-700">Cash Payouts Req</span>
            <IndianRupee className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {formatINR(stats.pendingPayoutsINR)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
            <span>{stats.pendingPayouts} requests</span>
            <span className="text-rose-700 font-semibold flex items-center gap-0.5">
              Disburse <ArrowRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Total Registered Citizens */}
        <div className="eco-card p-4 sm:p-5 bg-white border-l-4 border-l-[#166534]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-gray-700">Registered Citizens</span>
            <Users className="w-4 h-4 text-[#166534]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0e2717]">
            {stats.totalUsers}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {stats.totalActivities} activities logged
          </p>
        </div>

        {/* Leaf Coins in Circulation */}
        <div className="eco-card p-4 sm:p-5 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold text-gray-700">Circulating Coins</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">
            {formatCoins(stats.totalCoinsCirculating)}{' '}
            <span className="text-xs font-semibold text-emerald-600">LC</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {formatINR(stats.totalInrDisbursed)} paid to date
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE DASHBOARD VIEW SELECTOR TABS */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTab('overview');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Overview & Queue
          </button>

          <button
            onClick={() => {
              setActiveTab('submissions');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Submissions Triage</span>
            {stats.pendingSubmissions > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                {stats.pendingSubmissions}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('payouts');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Cash Disbursements</span>
            {stats.pendingPayouts > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-400 text-slate-900">
                {stats.pendingPayouts}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('categories');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('rewards');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Rewards ({rewards.length})</span>
          </button>
        </div>

        {/* Universal Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search in current tab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#166534] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TAB CONTENT PANELS */}
      {/* ======================================================== */}

      {/* -------------------------------------------------------- */}
      {/* TAB A: OVERVIEW & QUEUE SPLIT VIEW                      */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submissions Pending Verification */}
            <div className="eco-card p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Submissions Awaiting Verification
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      AI pre-classified evidence ready for human approval
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('submissions');
                    setSubmissionFilter('pending');
                  }}
                  className="text-xs font-bold text-[#166534] hover:underline"
                >
                  View All ({stats.pendingSubmissions}) →
                </button>
              </div>

              {activities.filter((a) => a.status === 'pending').length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-700">
                    Submissions Queue is Clean!
                  </p>
                  <p className="text-[11px] text-gray-400">
                    All environmental activities have been reviewed and verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities
                    .filter((a) => a.status === 'pending')
                    .slice(0, 4)
                    .map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl border border-gray-200 bg-[#F7FAF7] hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={act.image_url}
                            alt={act.title}
                            onClick={() =>
                              setZoomImage({ url: act.image_url, title: act.title })
                            }
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0 cursor-pointer hover:opacity-90"
                          />
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 line-clamp-1">{act.title}</p>
                            <p className="text-[11px] text-gray-500">
                              {act.user?.full_name || act.user?.email} • {act.category?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                AI: {act.ai_confidence ? `${Math.round(act.ai_confidence * 100)}%` : 'Analyzed'}
                              </span>
                              {act.is_suspicious && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                                  Flagged
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Inline Quick Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleQuickApprove(act)}
                            className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-bold text-[11px] hover:bg-[#14532d] shadow-2xs"
                          >
                            Approve (+{act.category?.base_coins || 50} LC)
                          </button>
                          <button
                            onClick={() => openRejectModal(act)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 font-bold text-[11px] hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Cash Payout Requests Queue */}
            <div className="eco-card p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Pending Cash Payout Requests
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Direct bank transfers awaiting disbursement & UTR confirmation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('payouts');
                    setPayoutFilter('requested');
                  }}
                  className="text-xs font-bold text-[#166534] hover:underline"
                >
                  View All ({stats.pendingPayouts}) →
                </button>
              </div>

              {payouts.filter((p) => p.status === 'requested' || p.status === 'processing').length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-700">
                    No Pending Cash Disbursements
                  </p>
                  <p className="text-[11px] text-gray-400">
                    All citizen bank transfer requests have been cleared.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payouts
                    .filter((p) => p.status === 'requested' || p.status === 'processing')
                    .slice(0, 4)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl border border-gray-200 bg-[#F7FAF7] hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900">
                              {p.user?.full_name || p.user?.email}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                              {p.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-mono">
                            A/C: {p.bank_account_masked} • IFSC: {p.bank_ifsc}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Requested {formatDate(p.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <div className="text-right">
                            <span className="font-black text-emerald-800 text-base">
                              {formatINR(p.reward_value_inr)}
                            </span>
                            <span className="block text-[10px] text-gray-400">
                              {formatCoins(p.coins_spent)} LC
                            </span>
                          </div>

                          <button
                            onClick={() => openDisburseModal(p, 'paid')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 shadow-2xs"
                          >
                            Enter UTR & Pay
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts to Admin Suites */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('categories')}
              className="eco-card p-4 bg-white hover:bg-emerald-50/40 cursor-pointer border border-gray-200 rounded-xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Environmental Categories</h3>
                  <p className="text-[11px] text-gray-500">{categories.length} active categories</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              onClick={() => setActiveTab('rewards')}
              className="eco-card p-4 bg-white hover:bg-emerald-50/40 cursor-pointer border border-gray-200 rounded-xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Rewards Catalog</h3>
                  <p className="text-[11px] text-gray-500">{rewards.length} store items</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            <Link
              href="/admin/settings"
              className="eco-card p-4 bg-white hover:bg-emerald-50/40 cursor-pointer border border-gray-200 rounded-xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Economy & AI Parameters</h3>
                  <p className="text-[11px] text-gray-500">1000 LC = ₹110 • Daily limits</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB B: SUBMISSIONS TRIAGE WITH CHECKING OPTIONS          */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSubmissionFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    submissionFilter === st
                      ? 'bg-[#166534] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st} (
                  {st === 'all'
                    ? activities.length
                    : activities.filter((a) =>
                        st === 'approved'
                          ? a.status === 'approved' || a.status === 'auto_approved'
                          : a.status === st
                      ).length}
                  )
                </button>
              ))}
            </div>

            <Link
              href="/admin/submissions"
              className="text-xs font-bold text-[#166534] hover:underline flex items-center gap-1"
            >
              Open Dedicated Verification Workspace <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-2">
              <CheckSquare className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No submissions found</p>
              <p className="text-xs text-gray-400">
                Try switching the status filter or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={act.image_url}
                        alt={act.title}
                        onClick={() => setZoomImage({ url: act.image_url, title: act.title })}
                        className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      <button
                        onClick={() => setZoomImage({ url: act.image_url, title: act.title })}
                        className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-black"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-gray-900 line-clamp-1">
                          {act.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            act.status === 'approved' || act.status === 'auto_approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-1">
                        {act.description || 'No description provided'}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <span>{act.user?.full_name || act.user?.email}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800">{act.category?.name}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          AI: {act.ai_confidence ? `${Math.round(act.ai_confidence * 100)}%` : 'Gated'}
                        </span>
                        {act.is_suspicious && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Suspicious
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {formatDate(act.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Action Controls */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="text-xs font-bold text-[#166534]">
                      Reward: +{act.category?.base_coins || 50} LC
                    </div>

                    {act.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickApprove(act)}
                          className="px-3 py-1.5 rounded-lg bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(act)}
                          className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">
                        Processed on {formatDate(act.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB C: CASH DISBURSEMENTS WITH CHECKING OPTIONS          */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5">
              {(['requested', 'processing', 'paid', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setPayoutFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    payoutFilter === st
                      ? 'bg-[#166534] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st} (
                  {st === 'all'
                    ? payouts.length
                    : payouts.filter((p) => p.status === st).length}
                  )
                </button>
              ))}
            </div>

            <Link
              href="/admin/payouts"
              className="text-xs font-bold text-[#166534] hover:underline flex items-center gap-1"
            >
              Open Dedicated Payouts Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredPayouts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-2">
              <IndianRupee className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No payout records found</p>
              <p className="text-xs text-gray-400">Try changing the status filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAF7] text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Citizen / User</th>
                      <th className="p-3.5">Bank Information</th>
                      <th className="p-3.5">Amount (INR)</th>
                      <th className="p-3.5">Coins Spent</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Bank UTR Reference</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-gray-900">{p.user?.full_name || 'Citizen'}</p>
                          <p className="text-[11px] text-gray-500">{p.user?.email}</p>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <p className="font-bold text-gray-800">{p.bank_account_masked}</p>
                          <p className="text-gray-500">{p.bank_ifsc}</p>
                        </td>
                        <td className="p-3.5 font-extrabold text-emerald-800 text-sm">
                          {formatINR(p.reward_value_inr)}
                        </td>
                        <td className="p-3.5 font-bold text-gray-700">
                          {formatCoins(p.coins_spent)} LC
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              p.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-gray-600">
                          {p.utr_number ? (
                            <span className="font-bold text-emerald-700">{p.utr_number}</span>
                          ) : (
                            <span className="text-gray-400">Not Disbursed</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {p.status === 'requested' || p.status === 'processing' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openDisburseModal(p, 'paid')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 shadow-2xs"
                              >
                                Disburse (UTR)
                              </button>
                              <button
                                onClick={() => openDisburseModal(p, 'rejected')}
                                className="px-2 py-1 rounded-lg border border-rose-300 text-rose-700 font-bold text-[11px] hover:bg-rose-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-semibold">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB D: CATEGORIES MANAGEMENT (ADD, EDIT, REMOVE)         */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Environmental Activity Categories</h2>
              <p className="text-xs text-gray-500">
                Configure reward rates, AI confidence gating, and carbon offset calculations.
              </p>
            </div>
            <button
              onClick={openCreateCategoryModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add New Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-gray-900">{cat.name}</span>
                    <button
                      onClick={() => toggleCategoryActive(cat)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition-all ${
                        cat.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">{cat.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Base Reward</span>
                      <span className="font-bold text-[#166534]">+{cat.base_coins} LC</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Min Confidence</span>
                      <span className="font-bold text-gray-700">
                        {Math.round(cat.min_confidence_score * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Daily Cap</span>
                      <span className="font-bold text-gray-700">{cat.max_daily_per_user}/day</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">CO2 Impact</span>
                      <span className="font-bold text-emerald-700">{cat.co2_offset_kg} kg/act</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Remove Options */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[10px] font-mono text-gray-400">{cat.slug}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB E: REWARDS CATALOG (ADD, EDIT, REMOVE)               */}
      {/* -------------------------------------------------------- */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Store Rewards & Inventory</h2>
              <p className="text-xs text-gray-500">
                Manage redeemable cash cards, shopping vouchers, and gift certificates.
              </p>
            </div>
            <button
              onClick={openCreateRewardModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add New Reward
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-gray-900">{reward.title}</span>
                    <button
                      onClick={() => toggleRewardActive(reward)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition-all ${
                        reward.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {reward.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">{reward.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Coin Cost</span>
                      <span className="font-black text-amber-700">
                        {formatCoins(reward.coin_cost)} LC
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Real-World Value</span>
                      <span className="font-black text-emerald-800">
                        {formatINR(reward.reward_value_inr)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Stock Available</span>
                      <span className="font-bold text-gray-700">
                        {reward.remaining_quantity} left
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Reward Type</span>
                      <span className="font-bold text-gray-700 uppercase">{reward.type}</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Remove Options */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <Link
                    href={`/admin/rewards`}
                    className="text-[11px] font-bold text-[#166534] hover:underline"
                  >
                    Inventory codes →
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditRewardModal(reward)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                      title="Edit Reward"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReward(reward)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete Reward"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODALS (CATEGORY, REWARD, REJECTION, DISBURSEMENT)    */}
      {/* ======================================================== */}

      {/* MODAL 1: ADD / EDIT CATEGORY */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#166534]" />
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waste Segregation & Composting"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) {
                      setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#166534]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Slug (Unique identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. waste-segregation"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe authentic evidence required..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Base Coins Reward (LC)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={catBaseCoins}
                    onChange={(e) => setCatBaseCoins(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Confidence (0.0 - 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    required
                    value={catMinConfidence}
                    onChange={(e) => setCatMinConfidence(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Daily Per User</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={catMaxDaily}
                    onChange={(e) => setCatMaxDaily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">CO2 Offset (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={catCo2Offset}
                    onChange={(e) => setCatCo2Offset(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoApproveToggle"
                  checked={catAutoApprove}
                  onChange={(e) => setCatAutoApprove(e.target.checked)}
                  className="rounded text-[#166534] focus:ring-[#166534]"
                />
                <label htmlFor="autoApproveToggle" className="text-gray-700 font-semibold cursor-pointer">
                  Auto-approve high confidence submissions exceeding threshold
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSaving}
                  className="px-5 py-2 rounded-xl bg-[#166534] text-white font-bold hover:bg-[#14532d] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {catSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT REWARD */}
      {rewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                {editingReward ? 'Edit Reward Item' : 'Add Store Reward'}
              </h3>
              <button
                onClick={() => setRewardModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Reward Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹50 Amazon Shopping Voucher"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Reward details and redemption guidelines..."
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="voucher">Shopping Voucher</option>
                    <option value="cash">Direct Cash Transfer</option>
                    <option value="gift_card">Gift Card Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={rewardQuantity}
                    onChange={(e) => setRewardQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Coin Cost (LC)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={rewardCoinCost}
                    onChange={(e) => setRewardCoinCost(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Real Value (₹ INR)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={rewardValueINR}
                    onChange={(e) => setRewardValueINR(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Terms & Conditions</label>
                <input
                  type="text"
                  value={rewardTerms}
                  onChange={(e) => setRewardTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRewardModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rewardSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {rewardSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingReward ? 'Update Reward' : 'Save Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT ACTIVITY SUBMISSION */}
      {rejectModalOpen && activityToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject Submission
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <p className="text-gray-600">
                You are rejecting submission <strong className="text-gray-900">"{activityToReject.title}"</strong> submitted by {activityToReject.user?.full_name || activityToReject.user?.email}.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Standard Reason</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
                >
                  <option value="Blurry or unverified photographic evidence">Blurry or unverified photographic evidence</option>
                  <option value="Duplicate or downloaded stock image">Duplicate or downloaded stock image</option>
                  <option value="Category mismatch (does not show environmental action)">Category mismatch (does not show environmental action)</option>
                  <option value="Incomplete recycling / sorting action">Incomplete recycling / sorting action</option>
                  <option value="Other / Policy violation">Other / Policy violation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Additional Guidance for Citizen (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Provide constructive feedback..."
                  value={customRejectionNotes}
                  onChange={(e) => setCustomRejectionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {rejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CASH PAYOUT DISBURSEMENT / UTR */}
      {payoutModalOpen && payoutToProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                {payoutAction === 'paid'
                  ? 'Confirm Cash Disbursement'
                  : payoutAction === 'rejected'
                  ? 'Reject Payout Request'
                  : 'Mark Payout Processing'}
              </h3>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayoutAction} className="space-y-3 text-xs">
              <div className="bg-[#F7FAF7] p-3 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Citizen:</span>
                  <span className="font-bold text-gray-900">{payoutToProcess.user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank Account:</span>
                  <span className="font-mono font-bold text-gray-800">{payoutToProcess.bank_account_masked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IFSC Code:</span>
                  <span className="font-mono font-bold text-gray-800">{payoutToProcess.bank_ifsc}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                  <span className="font-bold text-gray-700">Amount To Disburse:</span>
                  <span className="font-black text-emerald-800 text-sm">{formatINR(payoutToProcess.reward_value_inr)}</span>
                </div>
              </div>

              {payoutAction === 'paid' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Bank UTR / IMPS Transaction Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR1234567890"
                    value={payoutUTR}
                    onChange={(e) => setPayoutUTR(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    This reference will be saved to the ledger and shown on the user's payout receipt.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Internal Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Disbursed via Corporate HDFC netbanking"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutProcessing}
                  className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 disabled:opacity-50 ${
                    payoutAction === 'paid'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : payoutAction === 'rejected'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {payoutProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {payoutAction === 'paid' ? 'Confirm Payment & Disburse' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: IMAGE ZOOM INSPECTOR */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl space-y-2 p-3"
          >
            <div className="flex items-center justify-between px-2 pt-1">
              <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{zoomImage.title}</h4>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomImage.url}
              alt={zoomImage.title}
              className="w-full max-h-[75vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
