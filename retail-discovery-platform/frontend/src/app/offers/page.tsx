import React from 'react';
import { Tag, Filter, SlidersHorizontal } from 'lucide-react';
import { MOCK_OFFERS } from '@/lib/mock-data';
import { OfferCard } from '@/components/OfferCard';

export default function OffersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Tag className="w-6 h-6 text-sky-600" />
            <span>All Active Retail Offers</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified discounts and active promotional items in your location.
          </p>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-center space-x-3 text-xs">
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Category</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort by: Discount</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {MOCK_OFFERS.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
