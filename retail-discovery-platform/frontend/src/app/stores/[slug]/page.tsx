import React from 'react';
import { Star, MapPin, Heart, Tag, FileText } from 'lucide-react';
import { MOCK_STORES, MOCK_OFFERS, MOCK_FLYERS, MockStore } from '@/lib/mock-data';
import { OfferCard } from '@/components/OfferCard';
import { FlyerCard } from '@/components/FlyerCard';

export default function StoreDetailPage({ params }: { params: { slug: string } }) {
  const store: MockStore = MOCK_STORES.find((s) => s.slug === params.slug) || MOCK_STORES[0]!;

  return (
    <div className="space-y-8 pb-16">
      {/* Store Cover Header */}
      <div className="relative h-64 bg-slate-900">
        <img src={store.banner} alt={store.name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full flex items-end pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 w-full">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200 overflow-hidden shrink-0">
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-xl" />
            </div>

            <div className="text-white space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-sky-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded">
                  {store.category}
                </span>
                <div className="flex items-center space-x-1 bg-amber-500 text-slate-900 px-2 py-0.5 rounded text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-slate-900" />
                  <span>{store.rating}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black">{store.name}</h1>
              <p className="text-xs text-slate-300 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{store.location} • 3 Active Branches</span>
              </p>
            </div>

            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 backdrop-blur-md self-start sm:self-auto">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Favorite Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs & Lists */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Active Offers Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Tag className="w-5 h-5 text-sky-600" />
            <span>Current Promotions at {store.name}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_OFFERS.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* Digital Flyers Section */}
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>Active Weekly Circulars</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_FLYERS.map((flyer) => (
              <FlyerCard key={flyer.id} flyer={flyer} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
