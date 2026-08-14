'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Clock } from 'lucide-react';
import { MockOffer } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

interface OfferCardProps {
  offer: MockOffer;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden">
      {/* Image & Discount Badge */}
      <div className="relative aspect-video sm:aspect-square bg-slate-100 overflow-hidden">
        <img
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md">
          {offer.discountPercentage}% OFF
        </div>

        {/* Favorite action */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-white transition-all shadow-sm">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Store badge */}
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={offer.storeLogo}
            alt={offer.storeName}
            className="w-5 h-5 rounded-full object-cover border border-slate-200"
          />
          <span className="text-xs font-semibold text-slate-600 truncate">{offer.storeName}</span>
        </div>

        {/* Title */}
        <Link href={`/offers/${offer.slug}`} className="group-hover:text-sky-600 transition-colors mb-3">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
            {offer.title}
          </h3>
        </Link>

        {/* Pricing & Expiry */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-black text-slate-900">{formatPrice(offer.offerPrice)}</span>
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatPrice(offer.originalPrice)}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Valid till {new Date(offer.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
