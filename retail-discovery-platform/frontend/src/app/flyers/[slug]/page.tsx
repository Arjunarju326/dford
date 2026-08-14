'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  ShoppingBag,
  Sparkles,
  X,
  Share2,
  Bookmark,
  Store,
  Navigation,
} from 'lucide-react';
import { fetchFlyerBySlug } from '@/lib/api-flyers';
import { MockFlyer, MockFlyerHotspot, MOCK_OFFERS, MockOffer } from '@/lib/mock-data';
import { useToastStore } from '@/lib/toast-store';

export default function FlyerDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const showToast = useToastStore((state) => state.showToast);

  const [flyer, setFlyer] = useState<MockFlyer | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<MockFlyerHotspot | null>(null);
  const [relatedOffers, setRelatedOffers] = useState<MockOffer[]>([]);

  useEffect(() => {
    if (slug) {
      fetchFlyerBySlug(slug).then((data) => {
        setFlyer(data);
        if (data.hotspots && data.hotspots.length > 0) {
          // pre-select first hotspot or leave unselected
        }
      });
    }
  }, [slug]);

  if (!flyer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
          <div className="h-96 bg-slate-200 rounded-2xl w-full max-w-2xl mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleHotspotClick = (hotspot: MockFlyerHotspot) => {
    setSelectedHotspot(hotspot);
    // Find related items by category
    const related = MOCK_OFFERS.filter(
      (o) => o.category.toLowerCase().includes(hotspot.category.toLowerCase()) || o.title !== hotspot.title
    ).slice(0, 3);
    setRelatedOffers(related);
    showToast(`Extracted Item: ${hotspot.title} - ₹${hotspot.offerPrice}`, 'info');
  };

  const handleOpenGoogleMaps = (lat: number, lng: number, address: string) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
    showToast('Opening Google Maps Directions...', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back & Title Header */}
      <div className="space-y-4 border-b border-slate-200 pb-6">
        <Link
          href="/flyers"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Circular Flyers</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <img
              src={flyer.storeLogo}
              alt={flyer.storeName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
            />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {flyer.title}
              </h1>
              <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1.5 flex-wrap gap-y-1">
                <span className="flex items-center space-x-1 font-semibold text-slate-700">
                  <Store className="w-3.5 h-3.5 text-sky-500" />
                  <span>{flyer.storeName}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Valid: {flyer.validFrom} to {flyer.validUntil}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => showToast('Flyer saved to bookmarks', 'success')}
              className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Save Flyer</span>
            </button>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Flyer link copied to clipboard!', 'success');
                }
              }}
              className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4 text-sky-500" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Poster Viewer & Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Poster Canvas with Hotspots */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl relative border border-slate-800">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between text-slate-300 text-xs mb-4">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-900 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Interactive OCR Mode
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  Click any product item on poster to extract details & prices
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {currentPageIndex + 1} / {flyer.pages.length}
                </span>
                <button
                  disabled={currentPageIndex === flyer.pages.length - 1}
                  onClick={() => setCurrentPageIndex((prev) => Math.min(flyer.pages.length - 1, prev + 1))}
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Poster Canvas Container */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center min-h-[500px]">
              <img
                src={flyer.pages[currentPageIndex] || flyer.coverImage}
                alt={flyer.title}
                className="w-full h-auto object-contain max-h-[800px] rounded-xl"
              />

              {/* Render Hotspot Overlay Bounding Boxes */}
              {flyer.hotspots &&
                flyer.hotspots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => handleHotspotClick(spot)}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`,
                    }}
                    className={`absolute rounded-lg border-2 transition-all group flex flex-col justify-between p-1.5 cursor-pointer ${
                      selectedHotspot?.id === spot.id
                        ? 'border-amber-400 bg-amber-400/25 ring-4 ring-amber-400/40 z-20 scale-[1.02]'
                        : 'border-sky-400/70 bg-sky-500/10 hover:border-amber-400 hover:bg-amber-400/20 z-10'
                    }`}
                    title={`Click to view ${spot.title} - ₹${spot.offerPrice}`}
                  >
                    <span className="bg-slate-900/90 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow self-start group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                      ₹{spot.offerPrice}
                    </span>
                    <span className="bg-sky-600/90 text-white font-bold text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
                      {spot.title}
                    </span>
                  </button>
                ))}
            </div>

            {/* Hint bar below poster */}
            <p className="text-center text-xs text-slate-400 mt-3">
              💡 <span className="font-semibold text-slate-200">Pro Tip:</span> Click on any highlighted box on the flyer to extract item specifications, compare MRP savings, and view related store offers.
            </p>
          </div>

          {/* Store Branches & Google Maps Direction Router */}
          {flyer.branches && flyer.branches.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Store Branches & Navigation</h3>
                    <p className="text-xs text-slate-500">Visit nearby branches to redeem active circular deals</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flyer.branches.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                        <span>{b.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Open Branch
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.address}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">📞 {b.phone}</p>
                    </div>

                    <button
                      onClick={() => handleOpenGoogleMaps(b.latitude, b.longitude, b.address)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions (Google Maps)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Extracted Item Detail Modal & Related Deals */}
        <div className="space-y-6">
          {selectedHotspot ? (
            <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-5 relative animate-fade-in">
              <button
                onClick={() => setSelectedHotspot(null)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>OCR Extracted Item</span>
                </span>
              </div>

              <div className="space-y-3">
                <img
                  src={selectedHotspot.image}
                  alt={selectedHotspot.title}
                  className="w-full h-44 object-cover rounded-2xl border border-slate-100"
                />

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                    {selectedHotspot.title}
                  </h3>
                  {selectedHotspot.unit && (
                    <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                      Quantity: {selectedHotspot.unit}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Flyer Offer Price
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-slate-900">
                        ₹{selectedHotspot.offerPrice}
                      </span>
                      {selectedHotspot.originalPrice && (
                        <span className="text-sm text-slate-400 line-through font-semibold">
                          ₹{selectedHotspot.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedHotspot.originalPrice && (
                    <span className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-sm">
                      SAVE {Math.round(((selectedHotspot.originalPrice - selectedHotspot.offerPrice) / selectedHotspot.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => showToast(`Added ${selectedHotspot.title} to Shopping List!`, 'success')}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to My Shopping List</span>
              </button>

              {/* Related Items Section */}
              {relatedOffers.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-sky-500" />
                    <span>Related Deals You Might Like</span>
                  </h4>

                  <div className="space-y-2">
                    {relatedOffers.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between space-x-3 transition-all"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-lg shrink-0 border"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-extrabold text-sky-600">
                            ₹{item.offerPrice}{' '}
                            <span className="text-[10px] text-slate-400 line-through font-normal">
                              ₹{item.originalPrice}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">No Item Selected</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Click any product item box on the circular poster to extract product specs, price details, and related items.
                </p>
              </div>

              {flyer.hotspots && flyer.hotspots.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Featured Flyer Items ({flyer.hotspots.length})
                  </span>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {flyer.hotspots.map((spot) => (
                      <button
                        key={spot.id}
                        onClick={() => handleHotspotClick(spot)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                      >
                        <span className="truncate pr-2">{spot.title}</span>
                        <span className="font-extrabold text-sky-600 shrink-0">₹{spot.offerPrice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
