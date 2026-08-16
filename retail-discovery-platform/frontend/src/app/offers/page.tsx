'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Tag,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  ChevronRight,
  Eye,
  Clock,
} from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Store {
  id: number;
  name: string;
  logo_url?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FlyerListing {
  id: number;
  title: string;
  store_name: string;
  store_logo_url?: string;
  category: string;
  cover_image_url: string;
  page_count: number;
  valid_from: string;
  valid_to: string;
  days_left: number;
}

export default function OffersListingPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flyers, setFlyers] = useState<FlyerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, catRes, flyersRes] = await Promise.all([
          axios.get(`${API_BASE}/v1/stores/`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/v1/categories/`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/v1/flyers`).catch(() => ({ data: [] })),
        ]);

        const sData = Array.isArray(storesRes.data.results) ? storesRes.data.results : storesRes.data;
        setStores(Array.isArray(sData) ? sData : []);

        const cData = Array.isArray(catRes.data.results) ? catRes.data.results : catRes.data;
        setCategories(Array.isArray(cData) ? cData : []);

        const fData = Array.isArray(flyersRes.data) ? flyersRes.data : Array.isArray(flyersRes.data?.results) ? flyersRes.data.results : [];
        setFlyers(fData);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFlyers = flyers.filter((f) => {
    if (selectedCategory && !f.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }
    if (selectedStoreName && !f.store_name.toLowerCase().includes(selectedStoreName.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-100 min-h-screen pb-16 pt-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Retail Offers & Flyer Circulars</h1>
          <p className="text-xs text-slate-500">Discover multi-page discount catalogs, supermarket deals, and promotional circulars.</p>
        </div>

        {/* Store Logo Horizontal Scroll Strip */}
        {stores.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedStoreName('')}
                className={`flex-shrink-0 p-3 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1 w-24 h-24 ${
                  selectedStoreName === ''
                    ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-500/20 scale-105 shadow-md font-bold'
                    : 'border-slate-200 hover:bg-slate-50 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-xs">
                  ALL
                </div>
                <span className="text-[10px] font-bold text-slate-800 text-center truncate w-full">All Stores</span>
              </button>

              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => {
                    if (selectedStoreName === store.name) {
                      setSelectedStoreName('');
                    } else {
                      setSelectedStoreName(store.name);
                    }
                  }}
                  className={`flex-shrink-0 p-3 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1 w-24 h-24 ${
                    selectedStoreName === store.name
                      ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-500/20 scale-105 shadow-md font-bold'
                      : 'border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border shrink-0">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-purple-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 text-center truncate w-full">
                    {store.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs Strip */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all shrink-0 ${
              selectedCategory === ''
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Responsive Grid of Flyer Cards */}
        {isLoading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Loading Promotional Circulars...</p>
          </div>
        ) : filteredFlyers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFlyers.map((flyer) => (
              <div
                key={flyer.id}
                onClick={() => router.push(`/offers/${flyer.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative"
              >
                {/* Cover Image & Badges */}
                <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
                  {flyer.cover_image_url ? (
                    <img
                      src={flyer.cover_image_url}
                      alt={flyer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Tag className="w-10 h-10" />
                    </div>
                  )}

                  {/* +{page_count} Pages Badge */}
                  <span className="absolute top-3 left-3 bg-slate-900/85 text-white font-black text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md shadow-md flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-[#10B981]" />
                    <span>+{flyer.page_count || 1} Pages</span>
                  </span>

                  {/* +{days_left} Days left Badge */}
                  <span className="absolute top-3 right-3 bg-purple-700 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>+{flyer.days_left ?? 7} Days left</span>
                  </span>

                  {/* Hover "View Details" Button Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 backdrop-blur-[2px]">
                    <span className="bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs px-5 py-2.5 rounded-full shadow-lg transform group-hover:scale-105 transition-transform flex items-center space-x-1.5 uppercase tracking-wider">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">
                    {flyer.store_name}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {flyer.title}
                  </h3>
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">{flyer.category || 'Supermarket'}</span>
                  <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-3 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Tag className="w-12 h-12 text-purple-300 mx-auto" />
            <p className="font-extrabold text-sm text-slate-900">No Promotional Circulars Found</p>
            <p className="text-xs max-w-xs mx-auto">No offer catalogs match your selected store or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
