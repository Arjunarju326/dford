'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Menu, X, Plus, User, Globe } from 'lucide-react';
import { useLocationStore } from '@/lib/location-store';
import { LocationModal } from '@/components/LocationModal';

export function Header() {
  const router = useRouter();
  const { city, openModal } = useLocationStore();

  const [activeTab, setActiveTab] = useState<'offers' | 'products' | 'coupons'>('offers');
  const [activeSubCat, setActiveSubCat] = useState('All Offers');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/offers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-11 h-11 bg-purple-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md tracking-tighter">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-black text-purple-700 text-2xl tracking-tighter leading-none">
                D4D
              </span>
              <span className="text-[10px] font-extrabold text-purple-600 tracking-widest uppercase leading-none mt-0.5">
                ONLINE
              </span>
            </div>
          </Link>

          {/* Center Mode Selector Pills */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-full space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'offers'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-purple-700'
              }`}
            >
              Offers
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-purple-700'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'coupons'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-purple-700'
              }`}
            >
              Coupons
            </button>
          </div>

          {/* Search & Location Group */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg hidden sm:flex items-center bg-slate-100 rounded-full border border-slate-200 p-1 pl-4"
          >
            <button
              type="button"
              onClick={openModal}
              className="flex items-center space-x-1 text-xs font-extrabold text-slate-700 hover:text-purple-700 pr-3 border-r border-slate-300 shrink-0"
            >
              <span>{city.toUpperCase()}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find all shopping flyers in one place"
              className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold px-5 py-2 rounded-full shadow-sm transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>QA EN ▼</span>
            </div>

            <Link
              href="/login"
              className="text-xs font-black text-slate-900 hover:text-purple-700 tracking-wider uppercase"
            >
              LOGIN
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-purple-700 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Sub-Header Bar (Purple background with Category Pills & Add Your Company Button) */}
        <div className="bg-purple-800 text-white px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar py-0.5 text-xs font-semibold">
              {['All Offers', 'Supermarket', 'Back to School', 'Electronics', 'Mobiles'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveSubCat(cat)}
                  className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    activeSubCat === cat
                      ? 'bg-purple-950 text-white font-extrabold shadow-sm'
                      : 'hover:bg-purple-700/60 text-purple-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Link
              href="/shop-register"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-md transition-all shrink-0 flex items-center space-x-1 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add your company</span>
            </Link>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <button
              onClick={openModal}
              className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-bold text-purple-700"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Selected Location: {city}</span>
              </div>
              <span className="underline">Change</span>
            </button>

            <div className="flex flex-col space-y-2 pt-2 text-sm font-bold text-slate-800">
              <Link href="/offers" className="py-2 border-b border-slate-100">Trending Offers</Link>
              <Link href="/flyers" className="py-2 border-b border-slate-100">Catalog Flyers</Link>
              <Link href="/stores" className="py-2 border-b border-slate-100">Browse Stores</Link>
              <Link href="/shop/dashboard" className="py-2 text-purple-700 border-b border-slate-100">Shop Dashboard</Link>
              <Link href="/admin/shops" className="py-2 text-amber-600 border-b border-slate-100">Admin Portal</Link>
              <Link href="/login" className="py-2 text-purple-700">Sign In / Register</Link>
            </div>
          </div>
        )}
      </header>

      <LocationModal />
    </>
  );
}
