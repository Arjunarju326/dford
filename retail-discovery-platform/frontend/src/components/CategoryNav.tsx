'use client';

import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { MockCategory } from '@/lib/mock-data';

interface CategoryNavProps {
  categories: MockCategory[];
  activeCategorySlug?: string;
}

export function CategoryNav({ categories, activeCategorySlug }: CategoryNavProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      <Link
        href="/offers"
        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
          !activeCategorySlug
            ? 'bg-sky-600 text-white shadow-sm'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Tag className="w-3.5 h-3.5" />
        <span>All Offers</span>
      </Link>

      {categories.map((cat) => {
        const isActive = activeCategorySlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`/offers?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
