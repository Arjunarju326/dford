'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  ShieldCheck,
  Store as StoreIcon,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  FileText,
  Users,
  Search,
  ExternalLink,
  Loader2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

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
  owner_username?: string;
  email: string;
  phone: string;
  address: string;
  city?: number;
  status: string;
  rejection_reason?: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingShops, setPendingShops] = useState<ShopItem[]>([]);
  const [allShops, setAllShops] = useState<ShopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'flyers'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal State
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
      // Fetch Stats
      const statsRes = await axios.get(`${API_BASE}/v1/admin/stats/`, { headers });
      setStats(statsRes.data);

      // Fetch Pending Shops
      const pendingRes = await axios.get(`${API_BASE}/v1/admin/shops/pending/`, { headers });
      if (Array.isArray(pendingRes.data.results)) {
        setPendingShops(pendingRes.data.results);
      } else if (Array.isArray(pendingRes.data)) {
        setPendingShops(pendingRes.data);
      }

      // Fetch All Shops
      const allRes = await axios.get(`${API_BASE}/v1/admin/shops/`, { headers });
      if (Array.isArray(allRes.data.results)) {
        setAllShops(allRes.data.results);
      } else if (Array.isArray(allRes.data)) {
        setAllShops(allRes.data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        showToast('Admin authorization required. Please log in as admin (admin / arjuoo).', 'error');
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveShop = async (id: number, name: string) => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.post(
        `${API_BASE}/v1/admin/shops/${id}/approve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Shop "${name}" has been approved & unlocked!`, 'success');
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
      fetchAdminData();
    } catch {
      showToast('Failed to reject shop.', 'error');
    }
  };

  const filteredAllShops = allShops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Control Panel</h1>
            <p className="text-xs text-slate-500">Manage stores, approve registrations, and monitor platform metrics</p>
          </div>
        </div>

        <a
          href="http://localhost:8001/admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all self-start md:self-auto"
        >
          <span>Django Admin Panel</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Shops</span>
          <span className="text-2xl font-black text-slate-900 block">{stats?.total_shops || 0}</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Approved Shops</span>
          <span className="text-2xl font-black text-emerald-800 block">{stats?.approved_shops || 0}</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black text-amber-800 block">{stats?.pending_shops || 0}</span>
        </div>

        <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider block">Rejected Shops</span>
          <span className="text-2xl font-black text-red-800 block">{stats?.rejected_shops || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Branches</span>
          <span className="text-2xl font-black text-slate-900 block">{stats?.total_branches || 0}</span>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">Published Flyers</span>
          <span className="text-2xl font-black text-purple-800 block">{stats?.published_flyers || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Users</span>
          <span className="text-2xl font-black text-slate-900 block">{stats?.total_users || 0}</span>
        </div>
      </div>

      {/* Main Content Area with Navigation Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 transition-all flex items-center space-x-2 border-b-2 ${
              activeTab === 'pending'
                ? 'border-purple-600 text-purple-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Approvals Queue ({pendingShops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 transition-all flex items-center space-x-2 border-b-2 ${
              activeTab === 'all'
                ? 'border-purple-600 text-purple-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <StoreIcon className="w-4 h-4 text-sky-500" />
            <span>All Registered Shops ({allShops.length})</span>
          </button>
        </div>

        {/* Tab 1: Pending Approvals Queue */}
        {activeTab === 'pending' && (
          <div className="p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-lg">Pending Shop Approval Queue</h2>

            {pendingShops.length > 0 ? (
              <div className="space-y-4">
                {pendingShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{shop.name}</h3>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          PENDING APPROVAL
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Owner: <span className="font-semibold text-slate-700">{shop.owner_name}</span> ({shop.email}) | 📞 {shop.phone}
                      </p>
                      <p className="text-xs text-slate-400">
                        📍 {shop.address} | Registered: {shop.created_at.split('T')[0]}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleApproveShop(shop.id, shop.name)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Shop</span>
                      </button>

                      <button
                        onClick={() => setRejectShopId(shop.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No Pending Shop Registrations</p>
                <p className="text-xs text-slate-500">All submitted shop applications have been reviewed!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Registered Shops Directory */}
        {activeTab === 'all' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-bold text-slate-900 text-lg">Registered Shops Directory</h2>

              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shops by name, owner, or email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredAllShops.map((shop) => (
                <div
                  key={shop.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-sm">{shop.name}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          shop.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : shop.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Owner: {shop.owner_name} | {shop.email}</p>
                  </div>

                  {shop.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApproveShop(shop.id, shop.name)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectShopId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Reject Shop Application</h3>
            <form onSubmit={handleRejectShopSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete business documentation provided."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectShopId(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Reject Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
