import React from 'react';
import Link from 'next/link';
import { Clock, Heart, ShoppingBag, Share2 } from 'lucide-react';
import { MOCK_OFFERS, MockOffer } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import { OfferCard } from '@/components/OfferCard';

export default function OfferDetailPage({ params }: { params: { slug: string } }) {
  const offer: MockOffer = MOCK_OFFERS.find((o) => o.slug === params.slug) || MOCK_OFFERS[0]!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <span>/</span>
        <Link href="/offers" className="hover:text-slate-900">Offers</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{offer.title}</span>
      </nav>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Image */}
        <div className="lg:col-span-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[350px]">
          <img
            src={offer.image}
            alt={offer.title}
            className="max-h-96 w-full object-contain rounded-xl"
          />
        </div>

        {/* Right Col: Offer Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Store badge */}
          <div className="flex items-center justify-between">
            <Link
              href={`/stores/${offer.storeSlug}`}
              className="flex items-center space-x-2.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <img
                src={offer.storeLogo}
                alt={offer.storeName}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-bold text-slate-800">{offer.storeName}</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {offer.title}
          </h1>

          {/* Pricing Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Promotional Price</span>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-3xl font-black text-slate-900">{formatPrice(offer.offerPrice)}</span>
                <span className="text-sm text-slate-400 line-through font-medium">
                  {formatPrice(offer.originalPrice)}
                </span>
              </div>
            </div>

            <div className="bg-red-600 text-white font-black text-sm px-3 py-1.5 rounded-lg shadow-sm">
              Save {offer.discountPercentage}%
            </div>
          </div>

          {/* Validity & Terms */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Offer Valid Until: {new Date(offer.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <p className="text-slate-500 leading-relaxed pt-2">
              Offer available at participating branches while stocks last. Standard store terms and conditions apply. Please confirm prices in-store.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-sm shadow-md transition-all">
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping List</span>
            </button>

            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center space-x-2 text-sm transition-all">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Save Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Offers */}
      <div className="pt-12 border-t border-slate-200 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Similar Promotional Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_OFFERS.slice(0, 4).map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
        </div>
      </div>
    </div>
  );
}
