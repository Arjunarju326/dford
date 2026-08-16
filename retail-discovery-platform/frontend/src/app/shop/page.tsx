'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Store,
  Tag,
  TrendingUp,
  Award,
  MoreVertical,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Building2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ShopDashboardPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [shop, setShop] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [flyers, setFlyers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('d4d_access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      try {
        const shopRes = await axios.get(`${API_BASE}/v1/shop/me/`, { headers });
        const currentShop = shopRes.data;
        setShop(currentShop);

        const branchesRes = await axios.get(`${API_BASE}/v1/shop/branches/`, { headers });
        const bData = Array.isArray(branchesRes.data.results) ? branchesRes.data.results : branchesRes.data;
        setBranches(bData);

        const flyersRes = await axios.get(`${API_BASE}/v1/flyers/`);
        const fData: any[] = Array.isArray(flyersRes.data.results) ? flyersRes.data.results : flyersRes.data;
        
        // Strict filter: only show flyers belonging to current logged in shop
        const myFlyers = fData.filter(
          (f) => f.store === currentShop.id || f.store_name === currentShop.name
        );
        setFlyers(myFlyers);
      } catch (err) {
        // Handle error gracefully
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const filteredFlyers = flyers.filter((f) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ONGOING') return f.status === 'PUBLISHED' || f.status === 'ONGOING';
    if (activeTab === 'UPCOMING') return f.status === 'DRAFT' || f.status === 'UPCOMING';
    if (activeTab === 'COMPLETED') return f.status === 'EXPIRED' || f.status === 'COMPLETED';
    return true;
  });

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
      case 'ONGOING':
        return (
          <span className="text-[#10B981] font-extrabold text-[11px] px-3 py-1 bg-emerald-50 rounded-full uppercase">
            Active
          </span>
        );
      case 'EXPIRED':
      case 'COMPLETED':
        return (
          <span className="text-slate-500 font-extrabold text-[11px] px-3 py-1 bg-slate-100 rounded-full uppercase">
            Expired
          </span>
        );
      case 'DRAFT':
      case 'UPCOMING':
        return (
          <span className="text-amber-600 font-extrabold text-[11px] px-3 py-1 bg-amber-50 rounded-full uppercase">
            Upcoming
          </span>
        );
      default:
        return (
          <span className="text-[#10B981] font-extrabold text-[11px] px-3 py-1 bg-emerald-50 rounded-full uppercase">
            Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Row 1 — 4 Gradient Stat Cards with strictly shop-owned metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat Card 1 — Outlets Count */}
        <div className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white p-6 rounded-[24px] shadow-[0_10px_25px_rgba(16,185,129,0.25)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-90">Total Store Outlets</span>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <span className="text-3xl font-black block tracking-tight">{branches.length || 1} Outlets</span>
            <div className="flex items-center justify-between text-[10px] opacity-90 pt-2 border-t border-white/20">
              <span>Configured Branches</span>
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{shop?.name || 'Store'}</span>
            </div>
          </div>
        </div>

        {/* Stat Card 2 — Offers Count */}
        <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white p-6 rounded-[24px] shadow-[0_10px_25px_rgba(59,130,246,0.25)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-90">Total Offers & Flyers</span>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Tag className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <span className="text-3xl font-black block tracking-tight">{flyers.length} Circulars</span>
            <div className="flex items-center justify-between text-[10px] opacity-90 pt-2 border-t border-white/20">
              <span>Published Circulars</span>
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{flyers.length > 0 ? 'Active' : '0 Published'}</span>
            </div>
          </div>
        </div>

        {/* Stat Card 3 — Total Redemptions */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white p-6 rounded-[24px] shadow-[0_10px_25px_rgba(139,92,246,0.25)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-90">Offer Status</span>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <span className="text-3xl font-black block tracking-tight">{flyers.length}</span>
            <div className="space-y-1 text-[10px] opacity-90 pt-2 border-t border-white/20">
              <div className="flex justify-between">
                <span>Active Published</span>
                <span className="font-extrabold">{flyers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Outlets Linked</span>
                <span className="font-extrabold">{branches.length || 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 4 — Subscription Plan */}
        <div className="bg-gradient-to-br from-[#F97316] to-[#EF4444] text-white p-6 rounded-[24px] shadow-[0_10px_25px_rgba(249,115,22,0.25)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-90">Plan</span>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-2xl font-black block tracking-tight">Partner Pro</span>
              <span className="text-[10px] font-bold text-white/90 block mt-0.5">
                Active Retail Store
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-90 pt-2 border-t border-white/20">
              <span>Status</span>
              <span className="font-extrabold uppercase">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 — Two-Column Split (Offers Panel + Redemption Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (wider): Offers List Card strictly for this store */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#1F2937]">{shop?.name || 'Store'} Offers & Circulars</h3>
              <p className="text-[10px] text-slate-400">Strictly displaying flyers published by your business.</p>
            </div>
            <button
              onClick={() => router.push('/shop/flyers')}
              className="text-xs text-[#10B981] font-bold hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Offer</span>
            </button>
          </div>

          {/* Underline Tabs */}
          <div className="flex items-center space-x-6 border-b border-slate-100 text-xs font-bold">
            {(['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 transition-all relative ${
                  activeTab === tab
                    ? 'text-[#10B981] font-black'
                    : 'text-slate-400 hover:text-[#1F2937]'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Offer Rows */}
          {filteredFlyers.length > 0 ? (
            <div className="space-y-4">
              {filteredFlyers.map((flyer) => (
                <div
                  key={flyer.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100/60"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {flyer.cover_image_url ? (
                      <img
                        src={flyer.cover_image_url}
                        alt={flyer.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#10B981] flex items-center justify-center font-bold shrink-0 border border-purple-100">
                        <Tag className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <h4 className="font-bold text-xs text-[#1F2937] truncate leading-tight">{flyer.title}</h4>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{flyer.category_name || shop?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs text-slate-500 font-semibold shrink-0">
                    <span className="text-[11px]">{new Date(flyer.start_date).toLocaleDateString()}</span>
                    {getStatusPill(flyer.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Tag className="w-10 h-10 text-[#10B981]/40 mx-auto" />
              <p className="font-extrabold text-xs text-[#1F2937]">No Circulars Uploaded for {shop?.name || 'this Store'}</p>
              <p className="text-[10px] max-w-xs mx-auto">Click "+ Create Offer" above to upload your first weekly deal circular.</p>
            </div>
          )}
        </div>

        {/* Right: Shopper Views Chart */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1F2937]">Shopper Engagement</h3>
            <span className="text-[10px] text-[#10B981] font-bold flex items-center">
              Show: Monthly <ChevronDown className="w-3 h-3 ml-0.5" />
            </span>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="w-full h-48 relative pt-2">
            <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="300" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

              <path
                d="M 0 120 Q 50 140 100 80 T 200 60 T 250 40 L 250 140 L 0 140 Z"
                fill="url(#areaGradient)"
              />

              <path
                d="M 0 120 Q 50 140 100 80 T 200 60 T 250 40 T 300 90"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle cx="250" cy="40" r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
              <g transform="translate(230, 10)">
                <rect width="40" height="20" rx="10" fill="#10B981" />
                <text x="20" y="14" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{flyers.length * 150 + 120}</text>
              </g>
            </svg>
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-extrabold pt-2">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
