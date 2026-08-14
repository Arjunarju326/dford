'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Tag, FileText } from 'lucide-react';
import { MockStore } from '@/lib/mock-data';

interface StoreCardProps {
  store: MockStore;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
      {/* Banner */}
      <div className="relative h-28 bg-slate-100 overflow-hidden">
        <img
          src={store.banner}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Chip */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
          {store.category}
        </div>
      </div>

      {/* Profile & Info */}
      <div className="p-4 pt-0 relative flex-1 flex flex-col">
        {/* Logo overlapping banner */}
        <div className="-mt-8 mb-3 flex justify-between items-end">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md border border-slate-100 overflow-hidden">
            <img
              src={store.logo}
              alt={store.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-200/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{store.rating}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/stores/${store.slug}`} className="group-hover:text-sky-600 transition-colors mb-1">
          <h3 className="font-bold text-slate-900 text-base leading-tight">
            {store.name}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center space-x-1 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{store.location}</span>
        </div>

        {/* Footer badges */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            <span>{store.activeOffers} Offers</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>{store.activeFlyers} Flyers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
