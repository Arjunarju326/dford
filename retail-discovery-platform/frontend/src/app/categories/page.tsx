import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/lib/mock-data';

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-black text-slate-900">Retail Offer Categories</h1>
        <p className="text-sm text-slate-500 mt-1">Browse discounted products by department and retail category.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {MOCK_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400">{cat.itemCount} Active Offers</span>
              </div>
            </div>

            <span className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all text-xl font-bold">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
