'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Store,
  MapPin,
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  PlusCircle,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ShopBranch {
  id: number;
  name: string;
  address: string;
  city_name: string;
  phone: string;
  is_active: boolean;
}

interface ShopFlyer {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  cover_image_url: string;
}

interface ShopProfile {
  id: number;
  name: string;
  logo_url?: string;
  status: string;
  rejection_reason?: string;
  branches: ShopBranch[];
}

export default function ShopDashboardPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [flyers, setFlyers] = useState<ShopFlyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Branch Form Modal State
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  // Flyer Form Modal State
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [flyerTitle, setFlyerTitle] = useState('');
  const [flyerStartDate, setFlyerStartDate] = useState('');
  const [flyerEndDate, setFlyerEndDate] = useState('');
  const [flyerCoverUrl, setFlyerCoverUrl] = useState('');

  const fetchShopData = async () => {
    const token = localStorage.getItem('d4d_access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/v1/shop/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShop(res.data);

      // Fetch shop flyers
      const flyerRes = await axios.get(`${API_BASE}/v1/shop/flyers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(flyerRes.data.results)) {
        setFlyers(flyerRes.data.results);
      } else if (Array.isArray(flyerRes.data)) {
        setFlyers(flyerRes.data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setShop(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.post(
        `${API_BASE}/v1/shop/branches/`,
        {
          name: branchName,
          address: branchAddress,
          phone: branchPhone,
          city: 1, // Default city ID
          latitude: 25.2854,
          longitude: 51.5310,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Store Branch added successfully!', 'success');
      setShowBranchModal(false);
      setBranchName('');
      setBranchAddress('');
      fetchShopData();
    } catch {
      showToast('Failed to add store branch.', 'error');
    }
  };

  const handleCreateFlyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('d4d_access_token');
    try {
      const res = await axios.post(
        `${API_BASE}/v1/shop/flyers/`,
        {
          title: flyerTitle,
          start_date: flyerStartDate + 'T00:00:00Z',
          end_date: flyerEndDate + 'T23:59:59Z',
          cover_image_url: flyerCoverUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=1200&fit=crop',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Auto-submit flyer for Admin review
      await axios.post(
        `${API_BASE}/v1/shop/flyers/${res.data.id}/submit/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Flyer created and submitted for Admin approval!', 'success');
      setShowFlyerModal(false);
      setFlyerTitle('');
      fetchShopData();
    } catch {
      showToast('Failed to create flyer.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <Store className="w-12 h-12 text-slate-400 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">No Shop Registered Yet</h1>
          <p className="text-xs text-slate-500">Register your retail brand to publish deals & circular flyers</p>
        </div>
        <Link
          href="/shop-register"
          className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm"
        >
          Register Your Retail Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Status Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{shop.name} Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage store branches, deals, and promotional flyers</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {shop.status === 'APPROVED' && (
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>APPROVED & ACTIVE</span>
            </span>
          )}
          {shop.status === 'PENDING_APPROVAL' && (
            <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>PENDING ADMIN APPROVAL</span>
            </span>
          )}
          {shop.status === 'REJECTED' && (
            <span className="bg-red-100 text-red-800 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>APPLICATION REJECTED</span>
            </span>
          )}
        </div>
      </div>

      {/* Alert Banner for Pending/Rejected */}
      {shop.status === 'PENDING_APPROVAL' && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Your shop registration is under Admin review.</p>
            <p className="mt-0.5 text-amber-700">Once approved by Platform Admin, public flyer publishing and branch creation features will unlock automatically.</p>
          </div>
        </div>
      )}

      {shop.status === 'REJECTED' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-start space-x-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Rejection Reason from Admin:</p>
            <p className="mt-0.5 text-red-700">{shop.rejection_reason || 'No specific reason provided.'}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Branches & Flyers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branches Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-sky-500" />
              <h2 className="font-bold text-slate-900 text-lg">Store Branches ({shop.branches?.length || 0})</h2>
            </div>
            {shop.status === 'APPROVED' && (
              <button
                onClick={() => setShowBranchModal(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {shop.branches && shop.branches.length > 0 ? (
              shop.branches.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{b.address}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">📞 {b.phone}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active Branch
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No store branches added yet.</p>
            )}
          </div>
        </div>

        {/* Flyers Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-sky-500" />
              <h2 className="font-bold text-slate-900 text-lg">Circular Flyers ({flyers.length})</h2>
            </div>
            {shop.status === 'APPROVED' && (
              <Link
                href="/shop/flyers/create"
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Flyer Studio</span>
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {flyers.length > 0 ? (
              flyers.map((f) => (
                <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{f.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Valid: {f.start_date.split('T')[0]} to {f.end_date.split('T')[0]}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    f.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {f.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No flyers created yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Add Store Branch & Location</h3>
            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Kadav Mart Ulliyeri Branch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="e.g. Main Road, Ulliyeri"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Maps Location Link 🗺️</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=25.2854,51.5310"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="25.2854"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="51.5310"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  placeholder="+974 4400 1122"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Save Branch Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Flyer Modal */}
      {showFlyerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Upload Promotional Flyer</h3>
            <form onSubmit={handleCreateFlyer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Flyer Title</label>
                <input
                  type="text"
                  required
                  value={flyerTitle}
                  onChange={(e) => setFlyerTitle(e.target.value)}
                  placeholder="e.g. Weekend Mega Savings Flyer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={flyerStartDate}
                    onChange={(e) => setFlyerStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={flyerEndDate}
                    onChange={(e) => setFlyerEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={flyerCoverUrl}
                  onChange={(e) => setFlyerCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFlyerModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Submit Flyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
