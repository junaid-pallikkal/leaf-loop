import React from 'react';
import Link from 'next/link';
import { Leaf, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-[#E3EBE3] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#166534] flex items-center justify-center mx-auto">
          <Leaf className="w-8 h-8 text-[#22c55e]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534] bg-[#dcfce7] px-2.5 py-0.5 rounded-full">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-[#0e2717]">
            This Trail Doesn't Exist
          </h1>
          <p className="text-xs text-gray-500">
            The environmental page or reward you are looking for might have been moved or does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532d] shadow-sm"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
