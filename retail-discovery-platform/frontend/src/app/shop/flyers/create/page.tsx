'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  FileText,
  Calendar,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Tag,
  Loader2,
  Eye,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

interface HotspotItem {
  id: string;
  title: string;
  offerPrice: number;
  originalPrice: number;
  unit: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CreateFlyerStudioPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=1200&fit=crop'
  );

  // Extracted Item Hotspots list
  const [items, setItems] = useState<HotspotItem[]>([
    {
      id: 'item-1',
      title: 'Tomato / തക്കാളി',
      offerPrice: 19,
      originalPrice: 35,
      unit: '1 kg',
      category: 'Grocery & Vegetables',
      x: 4,
      y: 17,
      width: 17,
      height: 10,
    },
    {
      id: 'item-2',
      title: 'Onion / സവാള',
      offerPrice: 19,
      originalPrice: 30,
      unit: '1 kg',
      category: 'Grocery & Vegetables',
      x: 23,
      y: 17,
      width: 17,
      height: 10,
    },
    {
      id: 'item-3',
      title: 'Milma Ghee 1kg / മിൽമ നെയ്യ് 1kg',
      offerPrice: 629,
      originalPrice: 720,
      unit: '1 kg',
      category: 'Grocery & Food',
      x: 42,
      y: 64,
      width: 17,
      height: 10,
    },
  ]);

  // Modal State for editing item
  const [editingItem, setEditingItem] = useState<HotspotItem | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>('item-1');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddItem = () => {
    const newItem: HotspotItem = {
      id: `item-${Date.now()}`,
      title: 'New Promotional Product',
      offerPrice: 49,
      originalPrice: 75,
      unit: '1 kg',
      category: 'Grocery',
      x: 30,
      y: 40,
      width: 18,
      height: 12,
    };
    setItems([...items, newItem]);
    setEditingItem(newItem);
    showToast('New product hotspot added! Edit details in modal.', 'info');
  };

  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems(items.map((i) => (i.id === editingItem.id ? editingItem : i)));
    setEditingItem(null);
    showToast('Product item cross-checked & updated!', 'success');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    showToast('Item hotspot removed.', 'info');
  };

  const handlePublishFlyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      showToast('Please fill flyer title, start date, and end date.', 'error');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('d4d_access_token');
    if (!token) {
      showToast('Please log in as shop owner to publish flyers.', 'error');
      router.push('/login');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/v1/shop/flyers/`,
        {
          title,
          description,
          start_date: startDate + 'T00:00:00Z',
          end_date: endDate + 'T23:59:59Z',
          cover_image_url: coverImageUrl,
          items: items.map((it) => ({
            product_name: it.title,
            offer_price: it.offerPrice,
            original_price: it.originalPrice,
            x: it.x,
            y: it.y,
            width: it.width,
            height: it.height,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLoading(false);
      showToast('Flyer published directly to live public platform!', 'success');
      router.push('/shop/dashboard');
    } catch (err: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(err) && err.response?.data) {
        showToast('Publish failed: ' + JSON.stringify(err.response.data), 'error');
      } else {
        showToast('Network error while publishing flyer.', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/shop/dashboard"
            className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-sky-600 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Shop Dashboard</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Interactive Flyer Creator Studio</h1>
          <p className="text-xs text-slate-500">Preview circular poster, cross-check extracted items & prices, and publish directly</p>
        </div>

        <button
          onClick={handlePublishFlyer}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Live...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Flyer Live (Direct)</span>
            </>
          )}
        </button>
      </div>

      {/* Main 2-Column Creator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Poster Canvas Preview & Form Header */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Header Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <FileText className="w-5 h-5 text-sky-500" />
              <span>1. Flyer Circular Details & Validity</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Flyer Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kadav Mart Onam Special Celebration Flyer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Branch / Store *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                >
                  <option value="all">All Store Branches (Chain-wide)</option>
                  <option value="1">Ulliyeri Branch</option>
                  <option value="2">Balussery Branch</option>
                  <option value="3">Doha Main Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Poster Image URL *</label>
                <input
                  type="url"
                  required
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offer Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offer End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Interactive Poster Canvas Preview */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span className="bg-sky-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Live Interactive Poster Canvas</span>
              </span>
              <span className="text-slate-400">Click any hotspot box to inspect details</span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center min-h-[450px]">
              <img
                src={coverImageUrl}
                alt="Flyer Poster Preview"
                className="w-full h-auto object-contain max-h-[700px] rounded-xl"
              />

              {/* Hotspot Box Overlays */}
              {items.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedHotspotId(spot.id)}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    width: `${spot.width}%`,
                    height: `${spot.height}%`,
                  }}
                  className={`absolute rounded-lg border-2 transition-all flex flex-col justify-between p-1 cursor-pointer ${
                    selectedHotspotId === spot.id
                      ? 'border-amber-400 bg-amber-400/30 ring-4 ring-amber-400/50 z-20 scale-[1.02]'
                      : 'border-sky-400/70 bg-sky-500/15 hover:border-amber-400 hover:bg-amber-400/25 z-10'
                  }`}
                >
                  <span className="bg-slate-900/90 text-white font-black text-[9px] px-1 py-0.5 rounded self-start">
                    ₹{spot.offerPrice}
                  </span>
                  <span className="bg-sky-600/90 text-white font-bold text-[8px] px-1 py-0.5 rounded truncate">
                    {spot.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Side-by-Side Item & Price Inspector Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">2. Extracted Items & Prices</h2>
            </div>
            <button
              onClick={handleAddItem}
              className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center space-x-1 border border-sky-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Items Sidebar List */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedHotspotId(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedHotspotId === item.id
                    ? 'border-amber-400 bg-amber-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Unit: {item.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm block">₹{item.offerPrice}</span>
                    {item.originalPrice > item.offerPrice && (
                      <span className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    SAVE {Math.round(((item.originalPrice - item.offerPrice) / item.originalPrice) * 100)}%
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                      }}
                      className="text-sky-600 hover:text-sky-800 font-bold flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Cross-Check / Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-slate-900 text-lg">Cross-Check & Edit Item Details</h3>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.offerPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, offerPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.originalPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit / Quantity</label>
                <input
                  type="text"
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  placeholder="1 kg, 500g, 1L..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Save & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
