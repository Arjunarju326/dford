'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Layers } from 'lucide-react';
import { MockFlyer } from '@/lib/mock-data';

interface FlyerCardProps {
  flyer: MockFlyer;
}

export function FlyerCard({ flyer }: FlyerCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
      {/* Flyer Cover Image */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <img
          src={flyer.coverImage}
          alt={flyer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Page Count Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5" />
          <span>{flyer.pageCount} Pages</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={flyer.storeLogo}
            alt={flyer.storeName}
            className="w-5 h-5 rounded-full object-cover border border-slate-200"
          />
          <span className="text-xs font-medium text-slate-500">{flyer.storeName}</span>
        </div>

        <Link href={`/flyers/${flyer.slug}`} className="group-hover:text-sky-600 transition-colors mb-3">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
            {flyer.title}
          </h3>
        </Link>

        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>Until {new Date(flyer.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <Link
            href={`/flyers/${flyer.slug}`}
            className="text-sky-600 font-bold hover:underline flex items-center space-x-1"
          >
            <span>Open Flyer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
