'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AdminNav from '@/components/admin/AdminNav';
import {
  FolderTree,
  Plus,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Edit2,
  Leaf,
  Sliders,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCoins } from '@/lib/utils';
import { ActivityCategory } from '@/types';

export default function AdminCategoriesPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ActivityCategory | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [baseCoins, setBaseCoins] = useState('50');
  const [minConfidence, setMinConfidence] = useState('0.70');
  const [autoApprove, setAutoApprove] = useState(true);
  const [maxDaily, setMaxDaily] = useState('5');
  const [co2Offset, setCo2Offset] = useState('2.0');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase
      .from('activity_categories')
      .select('*')
      .order('base_coins', { ascending: false });

    if (data) setCategories(data);
    setLoading(false);
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setBaseCoins('50');
    setMinConfidence('0.70');
    setAutoApprove(true);
    setMaxDaily('5');
    setCo2Offset('2.0');
    setMessage(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: ActivityCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setBaseCoins(cat.base_coins.toString());
    setMinConfidence(cat.min_confidence_score.toString());
    setAutoApprove(cat.auto_approve_enabled);
    setMaxDaily(cat.max_daily_per_user.toString());
    setCo2Offset(cat.co2_offset_kg.toString());
    setMessage(null);
    setError(null);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        base_coins: parseInt(baseCoins, 10),
        min_confidence_score: parseFloat(minConfidence),
        auto_approve_enabled: autoApprove,
        max_daily_per_user: parseInt(maxDaily, 10),
        co2_offset_kg: parseFloat(co2Offset),
      };

      if (editingCategory) {
        const { error: updateError } = await supabase
          .from('activity_categories')
          .update(payload)
          .eq('id', editingCategory.id);

        if (updateError) throw updateError;
        setMessage('Category updated successfully.');
        toast.success(`Category "${payload.name}" updated successfully.`);
      } else {
        const { error: insertError } = await supabase
          .from('activity_categories')
          .insert(payload);

        if (insertError) throw insertError;
        setMessage('Category created successfully.');
        toast.success(`New category "${payload.name}" created successfully.`);
      }

      loadCategories();
      setTimeout(() => setModalOpen(false), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
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
      toast.success(`Category "${cat.name}" is now ${nextState ? 'active' : 'inactive'}.`);
      loadCategories();
    } catch (err: any) {
      toast.error('Failed to toggle category status: ' + err.message);
    }
  };

  const deleteCategory = async (cat: ActivityCategory) => {
    if (!window.confirm(`Are you sure you want to permanently delete category "${cat.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('activity_categories')
        .delete()
        .eq('id', cat.id);
      if (error) throw error;
      toast.success(`Category "${cat.name}" has been deleted.`);
      loadCategories();
    } catch (err: any) {
      toast.error('Failed to delete category: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0e2717]">
            Category & AI Rules Engine
          </h1>
          <p className="text-xs text-gray-500">
            Configure action categories, coin reward rates, AI confidence thresholds, and auto-approval policies.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="eco-card bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F6F0] text-xs uppercase font-semibold text-[#166534]">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-center">Base Reward</th>
                  <th className="py-3 px-4 text-center">Min AI Confidence</th>
                  <th className="py-3 px-4 text-center">Auto-Approve</th>
                  <th className="py-3 px-4 text-center">Daily Cap</th>
                  <th className="py-3 px-4 text-center">CO₂ Offset</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F7FAF7]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-gray-900">{cat.name}</span>
                        <p className="text-[11px] text-gray-400 font-mono">{cat.slug}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#166534]">
                      {formatCoins(cat.base_coins)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-gray-800">
                      {(cat.min_confidence_score * 100).toFixed(0)}%
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cat.auto_approve_enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cat.auto_approve_enabled ? 'Enabled' : 'Review Required'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-700">
                      {cat.max_daily_per_user} / day
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-700">
                      {cat.co2_offset_kg} kg
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleCategoryActive(cat)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            cat.is_active
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {cat.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Edit Category"
                          className="p-1.5 text-gray-500 hover:text-[#166534] rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat)}
                          title="Delete Category"
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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

      {/* Modal: Create / Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingCategory ? 'Edit Category & AI Rules' : 'Create Action Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Tree Plantation & Urban Gardening"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Slug (Unique Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="tree-plantation"
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
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
                  placeholder="Guidelines on acceptable actions..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Base Coins (LC)
                  </label>
                  <input
                    type="number"
                    required
                    value={baseCoins}
                    onChange={(e) => setBaseCoins(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Min AI Confidence (0.50 - 0.95)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1.0"
                    required
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Daily Cap per Citizen
                  </label>
                  <input
                    type="number"
                    required
                    value={maxDaily}
                    onChange={(e) => setMaxDaily(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    CO₂ Offset Factor (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={co2Offset}
                    onChange={(e) => setCo2Offset(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              </div>

              {/* Auto approve toggle */}
              <div className="pt-2 flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs font-semibold text-gray-900 block">
                    Automatic Approval Policy
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Approve immediately if AI confidence exceeds threshold without anomalies.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 text-[#166534] rounded focus:ring-[#166534]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
