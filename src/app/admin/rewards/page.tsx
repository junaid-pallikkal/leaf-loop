'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  Gift,
  Plus,
  Coins,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  FileCode,
  Upload,
  Trash2,
  Lock,
} from 'lucide-react';
import { formatCoins, formatINR, formatDate } from '@/lib/utils';
import { Reward, VoucherCode } from '@/types';
import { toast } from 'sonner';

export default function AdminRewardsPage() {
  const supabase = createClient();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: Add / Edit Reward
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'cash' | 'voucher' | 'gift_card'>('voucher');
  const [coinCost, setCoinCost] = useState('1000');
  const [rewardValueInr, setRewardValueInr] = useState('10');
  const [quantity, setQuantity] = useState('100');
  const [terms, setTerms] = useState('');

  // Modal: Voucher Code Inventory
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [selectedVoucherReward, setSelectedVoucherReward] = useState<Reward | null>(null);
  const [voucherCodes, setVoucherCodes] = useState<VoucherCode[]>([]);
  const [newCodesInput, setNewCodesInput] = useState('');
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    setLoading(true);
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .order('coin_cost', { ascending: true });

    if (data) setRewards(data as any);
    setLoading(false);
  }

  const openCreateModal = () => {
    setEditingReward(null);
    setTitle('');
    setDescription('');
    setType('voucher');
    setCoinCost('1000');
    setRewardValueInr('10');
    setQuantity('50');
    setTerms('Valid for 12 months from issuance. Non-refundable.');
    setMessage(null);
    setError(null);
    setRewardModalOpen(true);
  };

  const openEditModal = (r: Reward) => {
    setEditingReward(r);
    setTitle(r.title);
    setDescription(r.description);
    setType(r.type);
    setCoinCost(r.coin_cost.toString());
    setRewardValueInr(r.reward_value_inr.toString());
    setQuantity(r.remaining_quantity.toString());
    setTerms(r.terms_and_conditions || '');
    setMessage(null);
    setError(null);
    setRewardModalOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        coin_cost: parseInt(coinCost, 10),
        reward_value_inr: parseFloat(rewardValueInr),
        total_quantity: parseInt(quantity, 10),
        remaining_quantity: parseInt(quantity, 10),
        terms_and_conditions: terms.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editingReward) {
        const { error: updateError } = await supabase
          .from('rewards')
          .update(payload)
          .eq('id', editingReward.id);

        if (updateError) throw updateError;
        setMessage('Reward updated successfully.');
      } else {
        const { error: insertError } = await supabase.from('rewards').insert(payload);
        if (insertError) throw insertError;
        setMessage('New reward created successfully.');
      }

      loadRewards();
      setTimeout(() => setRewardModalOpen(false), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save reward.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRewardActive = async (reward: Reward) => {
    try {
      const nextActive = !reward.is_active;
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: nextActive })
        .eq('id', reward.id);
      if (error) throw error;
      toast.success(`Reward "${reward.title}" is now ${nextActive ? 'active' : 'inactive'}.`);
      loadRewards();
    } catch (err: any) {
      toast.error('Failed to toggle reward: ' + err.message);
    }
  };

  const deleteReward = async (reward: Reward) => {
    if (!window.confirm(`Are you sure you want to permanently delete reward "${reward.title}"? This will remove all associated voucher codes.`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', reward.id);
      if (error) throw error;
      toast.success(`Reward "${reward.title}" has been deleted.`);
      loadRewards();
    } catch (err: any) {
      toast.error('Failed to delete reward: ' + err.message);
    }
  };

  // Open inventory manager
  const openInventoryModal = async (reward: Reward) => {
    setSelectedVoucherReward(reward);
    setInventoryModalOpen(true);
    setNewCodesInput('');
    setInventoryLoading(true);
    setMessage(null);
    setError(null);

    const { data } = await supabase
      .from('voucher_codes')
      .select('*')
      .eq('reward_id', reward.id)
      .order('created_at', { ascending: false });

    if (data) setVoucherCodes(data as any);
    setInventoryLoading(false);
  };

  // Add bulk voucher codes
  const handleAddVoucherCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucherReward || !newCodesInput.trim()) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const lines = newCodesInput
        .split('\n')
        .map((l) => l.trim().toUpperCase())
        .filter((l) => l.length > 0);

      const rows = lines.map((code) => ({
        reward_id: selectedVoucherReward.id,
        code,
        is_redeemed: false,
      }));

      const { error: insertError } = await supabase
        .from('voucher_codes')
        .insert(rows);

      if (insertError) throw insertError;

      // Update remaining_quantity in rewards table
      const { count } = await supabase
        .from('voucher_codes')
        .select('*', { count: 'exact', head: true })
        .eq('reward_id', selectedVoucherReward.id)
        .eq('is_redeemed', false);

      await supabase
        .from('rewards')
        .update({ remaining_quantity: count ?? 0 })
        .eq('id', selectedVoucherReward.id);

      setMessage(`Added ${lines.length} voucher code(s) into inventory!`);
      setNewCodesInput('');

      // Reload
      const { data } = await supabase
        .from('voucher_codes')
        .select('*')
        .eq('reward_id', selectedVoucherReward.id)
        .order('created_at', { ascending: false });

      if (data) setVoucherCodes(data as any);
      loadRewards();
    } catch (err: any) {
      setError(err.message || 'Failed to add voucher codes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
            Rewards & Voucher Inventory
          </h1>
          <p className="text-xs text-gray-500">
            Create dynamic reward cards, set coin conversion pricing, and load authentic voucher serial codes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Reward Card
        </button>
      </div>

      {/* Rewards Catalog Table */}
      <div className="eco-card bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading rewards...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                <tr>
                  <th className="py-3 px-4">Reward Title / Type</th>
                  <th className="py-3 px-4 text-center">Coin Cost</th>
                  <th className="py-3 px-4 text-center">Value (INR)</th>
                  <th className="py-3 px-4 text-center">Stock Remaining</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{r.title}</span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              r.type === 'cash'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate max-w-sm mt-0.5">
                          {r.description}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#166534]">
                      {formatCoins(r.coin_cost)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-gray-900">
                      {formatINR(r.reward_value_inr)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium">
                      <span
                        className={
                          r.remaining_quantity < 5
                            ? 'text-red-600 font-bold'
                            : 'text-gray-700 font-semibold'
                        }
                      >
                        {r.remaining_quantity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleRewardActive(r)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            r.is_active
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {r.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {r.type !== 'cash' && (
                          <button
                            onClick={() => openInventoryModal(r)}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
                          >
                            Codes ({r.remaining_quantity})
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-gray-500 hover:text-[#166534] hover:bg-[#F0F6F0] rounded-lg"
                          title="Edit Reward"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteReward(r)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Reward"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREATE / EDIT REWARD */}
      {rewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingReward ? 'Edit Reward Card' : 'Create New Reward'}
              </h3>
              <button
                onClick={() => setRewardModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveReward} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Swiggy Food Voucher ₹100"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details and usage terms..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reward Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534] bg-white"
                  >
                    <option value="voucher">Digital Voucher</option>
                    <option value="cash">Direct Bank Cash</option>
                    <option value="gift_card">Gift Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Coin Cost (Leaf Coins)
                  </label>
                  <input
                    type="number"
                    required
                    value={coinCost}
                    onChange={(e) => setCoinCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Value (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={rewardValueInr}
                    onChange={(e) => setRewardValueInr(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <input
                  type="text"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Valid for 1 year, non-transferable..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRewardModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VOUCHER CODES INVENTORY */}
      {inventoryModalOpen && selectedVoucherReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-scale-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Voucher Inventory
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {selectedVoucherReward.title}
                </h3>
              </div>
              <button
                onClick={() => setInventoryModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                {error}
              </div>
            )}

            {/* Add Codes Box */}
            <form onSubmit={handleAddVoucherCodes} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-800">
                Bulk Add Genuine Voucher Codes (1 per line)
              </label>
              <textarea
                rows={3}
                value={newCodesInput}
                onChange={(e) => setNewCodesInput(e.target.value)}
                placeholder="AMZ-PROMO-98214&#10;AMZ-PROMO-98215&#10;AMZ-PROMO-98216"
                className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534] bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newCodesInput.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add to Inventory'}
                </button>
              </div>
            </form>

            {/* Existing Codes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>Existing Inventory ({voucherCodes.length} codes)</span>
                <span>
                  {voucherCodes.filter((c) => !c.is_redeemed).length} unredeemed /{' '}
                  {voucherCodes.filter((c) => c.is_redeemed).length} redeemed
                </span>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl max-h-56 overflow-y-auto">
                {voucherCodes.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No codes added yet. Enter codes above to stock this reward.
                  </div>
                ) : (
                  voucherCodes.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50"
                    >
                      <span className="font-mono font-bold text-gray-800">{c.code}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          c.is_redeemed
                            ? 'bg-gray-100 text-gray-500 line-through'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.is_redeemed ? 'Redeemed' : 'Available'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInventoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
