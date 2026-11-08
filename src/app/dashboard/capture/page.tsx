'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Coins,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Info,
} from 'lucide-react';
import { formatCoins } from '@/lib/utils';
import { ActivityCategory, AIAnalysisResult } from '@/types';
import confetti from 'canvas-confetti';

export default function CaptureActivityPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('waste-recycling');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    success: boolean;
    activity: any;
    aiResult: AIAnalysisResult;
    isAutoApproved: boolean;
    coinsAwarded: number;
    isDuplicate: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('activity_categories')
        .select('*')
        .eq('is_active', true)
        .order('base_coins', { ascending: false });
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please capture or choose a photograph of your environmental activity.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('categorySlug', selectedCategorySlug);
      formData.append('title', title);
      formData.append('description', description);

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze and record activity.');
      }

      setAnalysisResult(data);

      if (data.isAutoApproved) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#166534', '#86efac', '#eab308'],
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error uploading submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setTitle('');
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedCategory = categories.find((c) => c.slug === selectedCategorySlug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
          <Camera className="w-4 h-4 text-[#22c55e]" />
          Verified Stewardship Action
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2717]">
          Capture Environmental Habit
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Upload photographic proof of your eco action. Our AI Vision Engine identifies features and verifies against platform rules in real time.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Incomplete</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Analysis Result Banner / Modal */}
      {analysisResult ? (
        <div className="eco-card p-6 sm:p-8 bg-white space-y-6 animate-fade-in border-2 border-[#86efac]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  analysisResult.isAutoApproved
                    ? 'bg-emerald-100 text-emerald-700'
                    : analysisResult.aiResult.isSuspicious
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {analysisResult.isAutoApproved ? (
                  <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
                ) : analysisResult.aiResult.isSuspicious ? (
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    analysisResult.isAutoApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : analysisResult.aiResult.isSuspicious
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {analysisResult.isAutoApproved
                    ? 'Instant Auto-Approved'
                    : analysisResult.aiResult.isSuspicious
                    ? 'Flagged for Admin Inspection'
                    : 'Under Admin Review'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {analysisResult.activity.title}
                </h3>
              </div>
            </div>

            {analysisResult.isAutoApproved && (
              <div className="text-left sm:text-right bg-[#dcfce7] p-3 rounded-xl border border-[#86efac]">
                <span className="text-[10px] text-gray-600 font-medium block">Awarded</span>
                <span className="text-xl font-extrabold text-[#166534]">
                  +{analysisResult.coinsAwarded} Leaf Coins
                </span>
              </div>
            )}
          </div>

          {/* AI Vision Breakdown Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  AI Vision Assessment
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {analysisResult.aiResult.detectedActivity}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {analysisResult.aiResult.description}
                </p>
              </div>

              {/* Confidence Score Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-gray-500">Confidence Score</span>
                  <span className="font-bold text-[#166534]">
                    {(analysisResult.aiResult.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#166534] rounded-full transition-all duration-500"
                    style={{
                      width: `${analysisResult.aiResult.confidenceScore * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Detected Objects Tags */}
              <div>
                <h5 className="text-[11px] font-semibold text-gray-500 mb-1.5">
                  Detected Environmental Markers:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.aiResult.detectedObjects.map((obj, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#F0F6F0] text-[#166534] border border-[#E3EBE3]"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo preview in result */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Submitted Photographic Evidence
              </h4>
              <div className="h-48 w-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                <img
                  src={analysisResult.activity.image_url}
                  alt="Submission"
                  className="w-full h-full object-cover"
                />
              </div>
              {analysisResult.aiResult.isSuspicious && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <p className="font-semibold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Note to Citizen:
                  </p>
                  <p className="mt-0.5">
                    {analysisResult.aiResult.suspicionReason ||
                      'Requires standard verification check by administrator prior to coin release.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Capture Another Habit
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard/activities"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-[#F0F6F0] text-[#166534] text-xs font-semibold hover:bg-[#dcfce7]"
              >
                View in History
              </Link>
              <Link
                href="/dashboard/wallet"
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532d] shadow-sm"
              >
                Go to Wallet
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Capture Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div className="eco-card p-6 bg-white space-y-4">
            <label className="block text-sm font-bold text-[#0e2717]">
              1. Choose Action Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-[#166534] bg-[#dcfce7]/40 ring-2 ring-[#166534]/20'
                        : 'border-[#E3EBE3] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900">{cat.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#dcfce7] text-[#166534]">
                        +{cat.base_coins} LC
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Capture / Upload Box */}
          <div className="eco-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-[#0e2717]">
                2. Capture or Upload Photograph
              </label>
              <span className="text-xs text-gray-500">JPG, PNG, WEBP (Max 10MB)</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E3EBE3] hover:border-[#86efac] rounded-2xl p-8 text-center cursor-pointer bg-[#F7FAF7]/60 hover:bg-[#F0F6F0] transition-colors space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] text-[#166534] flex items-center justify-center mx-auto shadow-sm">
                  <Camera className="w-7 h-7 text-[#166534]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Click to Open Camera or Choose Image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Take a clear, well-lit photo showing active environmental stewardship.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3EBE3] text-xs font-medium text-gray-600 shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  Select File
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#E3EBE3] bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="w-full max-h-80 object-cover"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur shadow"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div className="eco-card p-6 bg-white space-y-4">
            <label className="block text-sm font-bold text-[#0e2717]">
              3. Details (Optional)
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`E.g., ${selectedCategory?.name || 'Recycling sorted bottles'}`}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the location, volume, or collaborative effort..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Estimated reward:</span>{' '}
              {formatCoins(selectedCategory?.base_coins ?? 50)} upon verification
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532d] shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#86efac]" />
                  Submit for Verification
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
