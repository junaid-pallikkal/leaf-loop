'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  Coins,
  IndianRupee,
  Users,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldCheck,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const [actRes, redRes, profRes, catRes] = await Promise.all([
        supabase.from('activities').select('*, category:activity_categories(name, slug)'),
        supabase.from('redemptions').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('activity_categories').select('*'),
      ]);

      if (actRes.data) setActivities(actRes.data);
      if (redRes.data) setRedemptions(redRes.data);
      if (profRes.data) setProfiles(profRes.data);
      if (catRes.data) setCategories(catRes.data);

      setLoading(false);
    }

    loadData();
  }, []);

  // Compute category distribution
  const categoryChartData = categories.map((cat) => {
    const count = activities.filter((a) => a.category_id === cat.id).length;
    return {
      name: cat.name.split(' ')[0], // short name
      fullName: cat.name,
      count,
    };
  });

  // Compute status distribution
  const approvedCount = activities.filter(
    (a) => a.status === 'approved' || a.status === 'auto_approved'
  ).length;
  const pendingCount = activities.filter((a) => a.status === 'pending').length;
  const rejectedCount = activities.filter((a) => a.status === 'rejected').length;

  const statusPieData = [
    { name: 'Approved', value: approvedCount, color: '#166534' },
    { name: 'Pending Review', value: pendingCount, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
  ];

  // Financial Stats
  const totalPayoutInr = redemptions
    .filter((r) => r.type === 'cash' && r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.reward_value_inr), 0);

  const pendingPayoutInr = redemptions
    .filter((r) => r.type === 'cash' && (r.status === 'requested' || r.status === 'processing'))
    .reduce((sum, r) => sum + Number(r.reward_value_inr), 0);

  // CSV Export: Activities
  const exportActivitiesCSV = () => {
    if (activities.length === 0) return;
    const headers = ['ID', 'Title', 'Category', 'Status', 'Coins Awarded', 'AI Confidence', 'Created At'];
    const rows = activities.map((a) => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.category?.name || '',
      a.status,
      a.coins_awarded,
      a.ai_confidence || '',
      a.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeafLoop_Activities_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export: Financial Payouts
  const exportPayoutsCSV = () => {
    if (redemptions.length === 0) return;
    const headers = ['Receipt ID', 'User ID', 'Type', 'Amount INR', 'Coins Spent', 'Status', 'Bank Account', 'IFSC', 'UTR', 'Date'];
    const rows = redemptions.map((r) => [
      r.receipt_id,
      r.user_id,
      r.type,
      r.reward_value_inr,
      r.coins_spent,
      r.status,
      r.bank_account_masked || '',
      r.bank_ifsc || '',
      r.utr_number || '',
      r.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeafLoop_Financial_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
            Analytics & Financial Reporting
          </h1>
          <p className="text-xs text-gray-500">
            Real database metrics analyzing citizen submission velocity, AI verification rates, and fiscal cash disbursements.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportActivitiesCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3EBE3] text-gray-700 text-xs font-semibold hover:bg-gray-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#166534]" />
            Export Activities CSV
          </button>
          <button
            onClick={exportPayoutsCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Financial Payouts CSV
          </button>
        </div>
      </div>

      {/* High Level Financial & Growth Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="eco-card p-5 bg-white">
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Total Disbursed Cash
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#166534]">
            {formatINR(totalPayoutInr)}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Direct IMPS/NEFT completed</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Pending Cash Queue
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {formatINR(pendingPayoutInr)}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Awaiting bank processing</p>
        </div>

        <div className="eco-card p-5 bg-white">
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Verification Rate
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {activities.length > 0
              ? `${((approvedCount / activities.length) * 100).toFixed(0)}%`
              : '100%'}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">
            {approvedCount} of {activities.length} submissions verified
          </p>
        </div>

        <div className="eco-card p-5 bg-white">
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Community Citizens
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0e2717]">
            {profiles.length}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Registered stewards</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Volume Bar Chart */}
        <div className="eco-card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#166534]" />
            Submissions by Environmental Category
          </h3>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      borderColor: '#E3EBE3',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">Loading chart telemetry...</div>
            )}
          </div>
        </div>

        {/* Verification Status Distribution Pie Chart */}
        <div className="eco-card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#22c55e]" />
            Verification Outcomes Breakdown
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400">No submission records to chart yet.</p>
            ) : mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">Loading chart telemetry...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
