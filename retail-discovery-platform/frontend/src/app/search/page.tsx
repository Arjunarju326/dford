'use client';

import React, { useState } from 'react';
import { Search, Tag, Store, FileText } from 'lucide-react';
import { MOCK_OFFERS, MOCK_STORES, MOCK_FLYERS } from '@/lib/mock-data';
import { OfferCard } from '@/components/OfferCard';
import { StoreCard } from '@/components/StoreCard';
import { FlyerCard } from '@/components/FlyerCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const filteredOffers = query
    ? MOCK_OFFERS.filter((o) => o.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_OFFERS;

  const filteredStores = query
    ? MOCK_STORES.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : MOCK_STORES;

  const filteredFlyers = query
    ? MOCK_FLYERS.filter((f) => f.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_FLYERS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Input Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search TV, Basmati Rice, FreshMart, Olive Oil..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Results Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900">
          {query ? `Search Results for "${query}"` : 'Browse All Deals & Search Items'}
        </h1>
      </div>

      {/* Matching Offers */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
          <Tag className="w-4 h-4 text-sky-500" />
          <span>Matching Promotional Offers ({filteredOffers.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>

      {/* Matching Stores */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
          <Store className="w-4 h-4 text-emerald-500" />
          <span>Matching Stores ({filteredStores.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </div>

      {/* Matching Flyers */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Matching Catalog Flyers ({filteredFlyers.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredFlyers.map((flyer) => (
            <FlyerCard key={flyer.id} flyer={flyer} />
          ))}
        </div>
      </div>
    </div>
  );
}
