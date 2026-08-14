'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  Store as StoreIcon,
  Tag,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_FLYERS, MOCK_STORES, MockFlyer, MockStore } from '@/lib/mock-data';
import { useLocationStore } from '@/lib/location-store';
import { useToastStore } from '@/lib/toast-store';

export default function HomePage() {
  const { city } = useLocationStore();
  const showToast = useToastStore((state) => state.showToast);

  const [selectedStoreSlug, setSelectedStoreSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'top_pick' | 'latest'>('top_pick');

  // Subcategories for Electronics (matching D4D screenshot)
  const electronicsSubCats = [
    'Mobiles',
    'TV',
    'Kitchen Appliance',
    'Printer',
    'Smart Watch',
    'Computer & Laptop',
    'Tabs',
    'Monitors & Projectors',
    'Large Appliances',
    'Accessories',
    'Small Appliances',
    'Camera',
  ];

  // Retail Store Chain Brands List (matching D4D screenshot logos)
  const retailStoreBrands = [
    {
      id: 'lulu',
      name: 'LuLu Hypermarket',
      slug: 'lulu-hypermarket',
      logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=150&h=150&fit=crop',
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'carrefour',
      name: 'Carrefour',
      slug: 'carrefour',
      logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&h=150&fit=crop',
      color: 'bg-blue-600 text-white',
    },
    {
      id: 'paris',
      name: 'Paris Hypermarket',
      slug: 'paris-hypermarket',
      logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop',
      color: 'bg-amber-600 text-white',
    },
    {
      id: 'almeera',
      name: 'Al Meera',
      slug: 'al-meera',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop',
      color: 'bg-green-700 text-white',
    },
    {
      id: 'safari',
      name: 'Safari Hypermarket',
      slug: 'safari',
      logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&h=150&fit=crop',
      color: 'bg-red-600 text-white',
    },
    {
      id: 'kadav',
      name: 'Kadav Mart Family Shop',
      slug: 'kadav-mart',
      logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&h=150&fit=crop',
      color: 'bg-amber-500 text-slate-900',
    },
    {
      id: 'marza',
      name: 'Marza Hypermarket',
      slug: 'marza',
      logo: 'https://images.unsplash.com/photo-1543168256-418811576931?w=150&h=150&fit=crop',
      color: 'bg-amber-600 text-white',
    },
    {
      id: 'grand',
      name: 'Grand Hypermarket',
      slug: 'grand',
      logo: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=150&h=150&fit=crop',
      color: 'bg-rose-600 text-white',
    },
    {
      id: 'citycentre',
      name: 'City Centre',
      slug: 'city-centre',
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150&h=150&fit=crop',
      color: 'bg-sky-600 text-white',
    },
  ];

  // Filter flyers based on selected store or subcategory
  const filteredFlyers = MOCK_FLYERS.filter((flyer) => {
    if (selectedStoreSlug) {
      return flyer.storeSlug === selectedStoreSlug;
    }
    return true;
  });

  const handleStoreClick = (slug: string, name: string) => {
    if (selectedStoreSlug === slug) {
      setSelectedStoreSlug(null);
      showToast('Cleared store filter.', 'info');
    } else {
      setSelectedStoreSlug(slug);
      showToast(`Showing offers for ${name}`, 'success');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Store Logo Horizontal Carousel Strip */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
            {retailStoreBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleStoreClick(brand.slug, brand.name)}
                className={`flex-shrink-0 p-3 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1.5 w-24 h-24 ${
                  selectedStoreSlug === brand.slug
                    ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-500/20 scale-105 shadow-md'
                    : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50 bg-white'
                }`}
                title={`Filter offers for ${brand.name}`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-800 text-center leading-tight truncate w-full">
                  {brand.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Grid (Categories Sidebar Left + Main Flyer Feed Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column: Categories Vertical Sidebar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
              Categories
            </h2>

            {/* Expandable Category Accordion: Electronics */}
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('Electronics')}
                className="w-full flex items-center justify-between font-bold text-xs text-slate-900 hover:text-purple-700 py-1"
              >
                <span>Electronics</span>
                <span className="text-slate-400">▲</span>
              </button>

              <div className="pl-3 space-y-1.5 border-l-2 border-slate-100 text-xs font-semibold text-slate-600">
                {electronicsSubCats.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSubCategory(sub);
                      showToast(`Filtered by subcategory: ${sub}`, 'info');
                    }}
                    className={`block w-full text-left py-1 px-2 rounded-lg transition-colors ${
                      selectedSubCategory === sub
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'hover:text-purple-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Categories List */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs font-bold text-slate-700">
              {['Grocery & Supermarket', 'Fashion & Apparel', 'Health & Beauty', 'Home & Kitchen', 'Mobiles & Gadgets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubCategory(null);
                  }}
                  className="w-full flex items-center justify-between py-1.5 hover:text-purple-700 transition-colors"
                >
                  <span>{cat}</span>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right 3 Columns: Main Flyer Feed */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedStoreSlug
                    ? `${retailStoreBrands.find((b) => b.slug === selectedStoreSlug)?.name} Offers`
                    : `Qatar - ${city} offers in D4D Online`}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing active promotional flyers and store circular deals
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1 border">
                <button
                  onClick={() => setActiveFilter('top_pick')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    activeFilter === 'top_pick'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-slate-700 hover:text-purple-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Top Pick</span>
                </button>
                <button
                  onClick={() => setActiveFilter('latest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    activeFilter === 'latest'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-slate-700 hover:text-purple-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Latest</span>
                </button>
              </div>
            </div>

            {/* Flyer Grid Cards */}
            {filteredFlyers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlyers.map((flyer) => (
                  <div
                    key={flyer.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group relative"
                  >
                    {/* Yellow "Shop Online" badge top right */}
                    <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-md shadow-md z-10 uppercase tracking-wider">
                      Shop Online
                    </span>

                    {/* Flyer Cover Image */}
                    <Link href={`/flyers/${flyer.slug}`} className="block relative overflow-hidden bg-slate-900 h-80">
                      <img
                        src={flyer.coverImage}
                        alt={flyer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Flyer Footer Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <img
                          src={flyer.storeLogo}
                          alt={flyer.storeName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {flyer.storeName}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                        {flyer.title}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>Valid until {flyer.validUntil}</span>
                        <Link
                          href={`/flyers/${flyer.slug}`}
                          className="font-bold text-purple-700 hover:underline"
                        >
                          Open Flyer →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <StoreIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Flyers Found for Selected Store</h3>
                <button
                  onClick={() => setSelectedStoreSlug(null)}
                  className="text-xs text-purple-700 font-bold underline"
                >
                  Clear store filter to view all circulars
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
