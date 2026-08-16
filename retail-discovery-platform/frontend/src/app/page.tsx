'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
  Loader2,
  Calendar,
  Building2,
  Layers,
} from 'lucide-react';
import { useLocationStore } from '@/lib/location-store';
import { useToastStore } from '@/lib/toast-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Store {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Flyer {
  id: number;
  title: string;
  description: string;
  store_name?: string;
  store_logo?: string;
  store_slug?: string;
  category_name?: string;
  category?: number;
  store?: number;
  cover_image_url?: string;
  image_url?: string;
  start_date: string;
  end_date: string;
}

export default function HomePage() {
  const { city } = useLocationStore();
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'top_pick' | 'latest'>('top_pick');

  useEffect(() => {
    const userStr = localStorage.getItem('d4d_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.user_type === 'admin' || user.is_staff || user.is_superuser) {
          router.push('/admin');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const [storesRes, catRes, flyersRes] = await Promise.all([
          axios.get(`${API_BASE}/v1/stores/`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/v1/categories/`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/v1/flyers/`).catch(() => ({ data: [] })),
        ]);

        const sData = Array.isArray(storesRes.data.results)
          ? storesRes.data.results
          : Array.isArray(storesRes.data)
          ? storesRes.data
          : [];
        setStores(sData);

        const cData = Array.isArray(catRes.data.results)
          ? catRes.data.results
          : Array.isArray(catRes.data)
          ? catRes.data
          : [];
        setCategories(cData);

        const fData = Array.isArray(flyersRes.data.results)
          ? flyersRes.data.results
          : Array.isArray(flyersRes.data)
          ? flyersRes.data
          : [];
        setFlyers(fData);
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, []);

  const handleStoreClick = (storeId: number, name: string) => {
    if (selectedStoreId === storeId) {
      setSelectedStoreId(null);
      showToast('Cleared store filter.', 'info');
    } else {
      setSelectedStoreId(storeId);
      showToast(`Showing offers for ${name}`, 'success');
    }
  };

  const handleCategoryClick = (catId: number, name: string) => {
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
      showToast('Cleared category filter.', 'info');
    } else {
      setSelectedCategoryId(catId);
      showToast(`Filtered by ${name}`, 'info');
    }
  };

  const filteredFlyers = flyers.filter((flyer) => {
    if (selectedStoreId && flyer.store !== selectedStoreId) {
      return false;
    }
    if (selectedCategoryId && flyer.category !== selectedCategoryId) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-100 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Real Store Logo Horizontal Carousel Strip */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
            {stores.length > 0 ? (
              stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreClick(store.id, store.name)}
                  className={`flex-shrink-0 p-3 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1.5 w-24 h-24 ${
                    selectedStoreId === store.id
                      ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-500/20 scale-105 shadow-md'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50 bg-white'
                  }`}
                  title={`Filter offers for ${store.name}`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border shrink-0">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-purple-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 text-center leading-tight truncate w-full">
                    {store.name}
                  </span>
                </button>
              ))
            ) : (
              <div className="flex items-center space-x-2 text-xs text-slate-400 p-2 font-semibold">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>No registered shops available yet. Register a store to feature your brand!</span>
              </div>
            )}
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Dynamic Real Categories Sidebar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Categories</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </h2>

            <div className="space-y-1 text-xs font-bold text-slate-700">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full text-left py-2 px-3 rounded-xl transition-all ${
                  selectedCategoryId === null
                    ? 'bg-purple-700 text-white font-black shadow-md'
                    : 'hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id, cat.name)}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategoryId === cat.id
                      ? 'bg-purple-700 text-white font-black shadow-md'
                      : 'hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Right 3 Columns: Real Published Flyers Feed */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedStoreId
                    ? `${stores.find((s) => s.id === selectedStoreId)?.name} Promotional Offers`
                    : `${city} Offers on D4D Online`}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Discover active retail flyers, supermarket promotions, and deal circulars
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  onClick={() => setActiveFilter('top_pick')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeFilter === 'top_pick'
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔥 Top Picks
                </button>
                <button
                  onClick={() => setActiveFilter('latest')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeFilter === 'latest'
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🕒 Latest
                </button>
              </div>
            </div>

            {/* Real Published Flyers Grid */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
                <p className="text-xs font-extrabold uppercase tracking-wider">Loading Active Store Circulars...</p>
              </div>
            ) : filteredFlyers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlyers.map((flyer) => (
                  <div
                    key={flyer.id}
                    onClick={() => router.push(`/flyers/view/${flyer.id}`)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Cover Image */}
                    <div className="h-56 w-full bg-slate-100 relative overflow-hidden">
                      {flyer.cover_image_url || flyer.image_url ? (
                        <img
                          src={flyer.cover_image_url || flyer.image_url}
                          alt={flyer.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Tag className="w-10 h-10" />
                        </div>
                      )}
                      {flyer.category_name && (
                        <span className="absolute top-3 left-3 bg-purple-900/80 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md">
                          {flyer.category_name}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                        {flyer.store_name || 'Retail Outlet'}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                        {flyer.title}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          Valid: {new Date(flyer.start_date).toLocaleDateString()} - {new Date(flyer.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-700">View Interactive Flyer ➔</span>
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <StoreIcon className="w-12 h-12 text-purple-300 mx-auto" />
                <p className="font-extrabold text-sm text-slate-900">No Published Flyers Found</p>
                <p className="text-xs max-w-xs mx-auto">
                  {selectedStoreId || selectedCategoryId
                    ? 'No promotional circulars match your selected filters. Try clearing the store or category filter.'
                    : 'No store circulars have been published yet. Register a store and upload a flyer!'}
                </p>
                {(selectedStoreId || selectedCategoryId) && (
                  <button
                    onClick={() => {
                      setSelectedStoreId(null);
                      setSelectedCategoryId(null);
                    }}
                    className="text-xs font-bold text-purple-700 hover:underline pt-2 inline-block"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
