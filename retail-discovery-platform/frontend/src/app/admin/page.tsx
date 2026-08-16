'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Building2,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  Paperclip,
  Calendar,
  Bell,
  Mail,
  Flame,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AdminStats {
  total_shops: number;
  approved_shops: number;
  pending_shops: number;
  rejected_shops: number;
  total_branches: number;
  total_flyers: number;
  published_flyers: number;
  total_users: number;
}

interface ShopItem {
  id: number;
  name: string;
  legal_name?: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city?: number;
  city_name?: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  description?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingShops, setPendingShops] = useState<ShopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selection state
  const [selectedShop, setSelectedShop] = useState<ShopItem | null>(null);

  // Reject Modal States
  const [rejectShopId, setRejectShopId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAdminData = async () => {
    const token = localStorage.getItem('d4d_access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const statsRes = await axios.get(`${API_BASE}/v1/admin/stats/`, { headers });
      setStats(statsRes.data);

      const pendingRes = await axios.get(`${API_BASE}/v1/admin/shops/pending/`, { headers });
      const shopsData = Array.isArray(pendingRes.data.results) ? pendingRes.data.results : pendingRes.data;
      setPendingShops(shopsData);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        showToast('Admin authorization required.', 'error');
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (pendingShops.length > 0 && !selectedShop) {
      setSelectedShop(pendingShops[0]);
    }
  }, [pendingShops]);

  const handleApproveShop = async (id: number, name: string) => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.post(
        `${API_BASE}/v1/admin/shops/${id}/approve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Shop "${name}" has been approved!`, 'success');
      setSelectedShop(null);
      fetchAdminData();
    } catch {
      showToast(`Failed to approve shop "${name}".`, 'error');
    }
  };

  const handleRejectShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectShopId || !rejectionReason.trim()) return;

    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.post(
        `${API_BASE}/v1/admin/shops/${rejectShopId}/reject/`,
        { rejection_reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Shop registration rejected.', 'info');
      setRejectShopId(null);
      setRejectionReason('');
      setSelectedShop(null);
      fetchAdminData();
    } catch {
      showToast('Failed to reject shop.', 'error');
    }
  };

  const filteredShops = pendingShops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#7B61FF] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Loading Moderation Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Navbar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] dark:text-white">Welcome back, Admin!</h2>
          <p className="text-xs text-[#8A8A8A] dark:text-slate-400 font-semibold">You have {pendingShops.length} pending moderation tasks in queue.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors relative">
            <Bell className="w-4 h-4" />
            {pendingShops.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7B61FF] rounded-full"></span>
            )}
          </button>
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/admin/announcements')}
            className="bg-[#7B61FF] hover:bg-[#6c52ed] text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-sm shadow-[#7B61FF]/10 transition-all uppercase tracking-wider"
          >
            Create Announcement
          </button>
        </div>
      </div>

      {/* Row 1 — 3 Stat Cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#181636] p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/50 dark:border-[#232049]/40 flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider">Needs Action</span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#1A1A1A] dark:text-white block">{pendingShops.length} Requests</span>
              <span className="text-[10px] text-[#8A8A8A] dark:text-slate-400 font-semibold mt-0.5 block">Store registrations</span>
            </div>
            <span className="inline-flex items-center text-[9px] bg-red-50 dark:bg-red-500/10 text-red-500 font-black px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              <span>12.5% vs last month</span>
            </span>
          </div>
          <div className="w-20 h-10 opacity-60">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path d="M5,35 Q20,15 35,25 T65,10 T95,30" stroke="#7B61FF" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#181636] p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/50 dark:border-[#232049]/40 flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-[#7B61FF] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider">Approved Stores</span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#1A1A1A] dark:text-white block">{stats?.approved_shops || 0} Shops</span>
              <span className="text-[10px] text-[#8A8A8A] dark:text-slate-400 font-semibold mt-0.5 block">Active registered brands</span>
            </div>
            <span className="inline-flex items-center text-[9px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              <span>Active Partner</span>
            </span>
          </div>
          <div className="w-20 h-10 opacity-60">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <rect x="5" y="25" width="8" height="15" rx="1.5" fill="#E8E2F7" />
              <rect x="18" y="15" width="8" height="25" rx="1.5" fill="#E8E2F7" />
              <rect x="31" y="20" width="8" height="20" rx="1.5" fill="#E8E2F7" />
              <rect x="44" y="8" width="8" height="32" rx="1.5" fill="#7B61FF" />
              <rect x="57" y="18" width="8" height="22" rx="1.5" fill="#7B61FF" />
              <rect x="70" y="5" width="8" height="35" rx="1.5" fill="#7B61FF" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#181636] p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/50 dark:border-[#232049]/40 flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider">Circular Deals</span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#1A1A1A] dark:text-white block">{stats?.published_flyers || 0} Flyers</span>
              <span className="text-[10px] text-[#8A8A8A] dark:text-slate-400 font-semibold mt-0.5 block">Directly published circulars</span>
            </div>
            <span className="inline-flex items-center text-[9px] bg-purple-50 dark:bg-purple-500/10 text-[#7B61FF] font-black px-2 py-0.5 rounded-full">
              <span>Auto-Publish Active</span>
            </span>
          </div>
          <div className="w-20 h-10 opacity-60">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path d="M5,25 L25,10 L50,30 L75,15 L95,5" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2 — Main Moderation Workspace Card structure */}
      <div className="bg-white dark:bg-[#181636] rounded-[32px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-100/50 dark:border-[#232049]/40 space-y-6">
        
        {/* Workspace Title & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#2E2A5F] pb-5">
          <h3 className="font-extrabold text-sm text-[#1A1A1A] dark:text-white uppercase tracking-wider">
            Registration Moderation Queue
          </h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request by shop/owner..."
              className="w-full bg-slate-50 dark:bg-[#201D47] border border-slate-200 dark:border-[#2E2A5F] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
            />
          </div>
        </div>

        {/* Split Screen Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Pending List */}
          <div className="lg:col-span-5 space-y-3.5 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredShops.length > 0 ? (
              filteredShops.map((shop) => {
                const isSelected = selectedShop?.id === shop.id;
                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShop(shop)}
                    className={`p-4.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#E8E2F7]/40 dark:bg-[#3B379B] border-[#7B61FF] dark:border-[#4A3AFF] shadow-sm'
                        : 'bg-white dark:bg-[#0F0E26]/50 border-slate-100 dark:border-[#242147] hover:bg-slate-50/50 dark:hover:bg-[#201D47]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#201D47] border border-purple-100 dark:border-[#2E2A5F] overflow-hidden flex items-center justify-center shrink-0">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-extrabold text-xs text-[#1A1A1A] dark:text-white truncate leading-tight">{shop.name}</h4>
                        <p className="text-[10px] text-[#8A8A8A] dark:text-slate-400 truncate mt-0.5">Owner: {shop.owner_name}</p>
                        <p className="text-[9px] text-[#7B61FF] font-bold mt-0.5">Code: #SH-{shop.id}</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                      Pending
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-3 text-[#8A8A8A] dark:text-slate-400 bg-slate-50/50 dark:bg-[#0F0E26]/30 rounded-2xl border border-dashed border-slate-200 dark:border-[#242147]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-extrabold text-xs text-[#1A1A1A] dark:text-white">Queue Clean & Approved</p>
                <p className="text-[10px] max-w-xs mx-auto">No retail store registration requests waiting in queue.</p>
              </div>
            )}
          </div>

          {/* Right Column: Details Panel */}
          <div className="lg:col-span-7">
            {selectedShop ? (
              <div className="bg-slate-50/50 dark:bg-[#24224C] rounded-3xl border border-slate-100 dark:border-[#37336B] p-6 space-y-6">
                
                {/* Details Header */}
                <div className="flex items-start justify-between border-b border-slate-200/60 dark:border-[#2E2A5F] pb-5">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Shop Application Details</span>
                    <h3 className="text-lg font-black text-[#1A1A1A] dark:text-white mt-1"># SH-{selectedShop.id}</h3>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">Status: Under Review</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-[#2C2957] border border-slate-200/50 dark:border-[#3B376F] p-2 rounded-xl shadow-sm">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                        {selectedShop.logo_url ? (
                          <img src={selectedShop.logo_url} alt={selectedShop.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="text-xs font-black text-[#1A1A1A] dark:text-white truncate max-w-[120px]">{selectedShop.name}</span>
                    </div>
                  </div>
                </div>

                {/* Info Blocks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-[#2C2957] border border-slate-100 dark:border-[#38336D] rounded-2xl space-y-1">
                    <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Contact Email</span>
                    <p className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">{selectedShop.email}</p>
                    <span className="text-[9px] text-[#10B981] font-bold inline-block mt-0.5">Verified</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#2C2957] border border-slate-100 dark:border-[#38336D] rounded-2xl space-y-1">
                    <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                    <p className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate">{selectedShop.phone}</p>
                    <span className="text-[9px] text-[#10B981] font-bold inline-block mt-0.5">Mobile Verified</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#2C2957] border border-slate-100 dark:border-[#38336D] rounded-2xl space-y-1">
                    <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Website URL</span>
                    {selectedShop.website ? (
                      <a href={selectedShop.website} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#7B61FF] dark:text-purple-300 hover:underline truncate block">
                        {selectedShop.website}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-[#8A8A8A] dark:text-slate-400">None Provided</p>
                    )}
                    <span className="text-[9px] text-slate-400 inline-block mt-0.5">Domain</span>
                  </div>
                </div>

                {/* HQ Address Row */}
                <div className="bg-white dark:bg-[#1B193B] p-5 rounded-2xl border border-slate-100 dark:border-[#2B2759] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Applicant Owner</span>
                    <p className="text-xs font-bold text-[#1A1A1A] dark:text-white mt-1">{selectedShop.owner_name}</p>
                    <p className="text-[10px] text-[#8A8A8A] dark:text-slate-400">HQ: {selectedShop.address || 'Street address'}</p>
                  </div>
                  {selectedShop.city_name && (
                    <div className="text-right">
                      <span className="text-[9px] font-extrabold text-[#7B61FF] dark:text-[#8F82F8] uppercase tracking-wider block">Target City</span>
                      <p className="text-xs font-extrabold text-[#1A1A1A] dark:text-white mt-1">{selectedShop.city_name}</p>
                    </div>
                  )}
                </div>

                {/* Description details */}
                {selectedShop.description && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Brand Statement</span>
                    <p className="text-xs text-[#1A1A1A] dark:text-slate-300 leading-relaxed bg-white dark:bg-[#2C2957] border border-slate-100 dark:border-[#38336D] p-4 rounded-2xl">
                      {selectedShop.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-5 border-t border-slate-200/60 dark:border-[#2E2A5F] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-2.5 bg-white dark:bg-[#2C2957] border border-slate-200 dark:border-[#3B376F] rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" title="Audit docs">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-white dark:bg-[#2C2957] border border-slate-200 dark:border-[#3B376F] rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" title="Calendar check">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRejectShopId(selectedShop.id)}
                      className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-extrabold px-5 py-2.5 rounded-full text-xs transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveShop(selectedShop.id, selectedShop.name)}
                      className="bg-[#7B61FF] dark:bg-[#4A3AFF] hover:bg-[#6c52ed] dark:hover:bg-[#3B2EE0] text-white font-extrabold px-6 py-2.5 rounded-full text-xs transition-all shadow-md shadow-[#7B61FF]/10"
                    >
                      Approve & Publish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-[#24224C] rounded-3xl border border-slate-100 dark:border-[#37336B] p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100/50 dark:bg-[#1B193B] border border-purple-200 dark:border-[#2B2759] flex items-center justify-center mx-auto text-[#7B61FF] dark:text-[#8F82F8]">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-[#1A1A1A] dark:text-white text-base">Select Pending Request</h3>
                  <p className="text-xs text-[#8A8A8A] dark:text-slate-400 max-w-sm mx-auto">
                    Click on any pending shop registration application from the left queue to moderate its details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Shop Modal */}
      {rejectShopId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181636] rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100 dark:border-[#242147] text-[#1A1A1A] dark:text-white">
            <h3 className="font-black text-lg">Reject Shop Application</h3>
            <form onSubmit={handleRejectShopSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the registration request is rejected..."
                  className="w-full bg-[#f8f9fd] dark:bg-[#201D47] border border-slate-200 dark:border-[#2E2A5F] rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectShopId(null);
                    setRejectionReason('');
                  }}
                  className="w-1/2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold py-2.5 rounded-full text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 rounded-full text-xs transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
