import React from 'react';
import { Heart } from 'lucide-react';
import { MOCK_OFFERS } from '@/lib/mock-data';
import { OfferCard } from '@/components/OfferCard';

export default function SavedOffersPage() {
  const savedOffers = MOCK_OFFERS.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <span>My Saved Retail Offers</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Bookmarked promotions and price discounts for easy access.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {savedOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
