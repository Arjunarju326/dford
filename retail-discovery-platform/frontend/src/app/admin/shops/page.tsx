'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import { Store, CheckCircle, XCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

interface PendingShop {
  id: number;
  name: string;
  legal_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  created_at: string;
}

export default function AdminPendingShopsPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [pendingShops, setPendingShops] = useState<PendingShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingShopId, setRejectingShopId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingShops = async () => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      const res = await axios.get(`${API_BASE}/v1/admin/shops/pending/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data.results)) {
        setPendingShops(res.data.results);
      } else if (Array.isArray(res.data)) {
        setPendingShops(res.data);
      }
    } catch {
      showToast('Failed to load pending shops. Are you logged in as Admin?', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingShops();
  }, []);

  const handleApprove = async (id: number, name: string) => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.post(
        `${API_BASE}/v1/admin/shops/${id}/approve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Shop "${name}" approved successfully!`, 'success');
      fetchPendingShops();
    } catch {
      showToast(`Failed to approve shop "${name}".`, 'error');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingShopId || !rejectionReason.trim()) return;

    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.post(
        `${API_BASE}/v1/admin/shops/${rejectingShopId}/reject/`,
        { rejection_reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Shop rejected.', 'info');
      setRejectingShopId(null);
      setRejectionReason('');
      fetchPendingShops();
    } catch {
      showToast('Failed to reject shop.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Shop Approval Queue</h1>
          <p className="text-xs text-slate-500">Review pending retail shop applications before granting active status</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
        </div>
      ) : pendingShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingShops.map((shop) => (
            <div key={shop.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{shop.name}</h3>
                  <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>PENDING_APPROVAL</span>
                  </span>
                </div>
                {shop.legal_name && (
                  <p className="text-xs text-slate-500">Legal Name: {shop.legal_name}</p>
                )}
                <div className="text-xs text-slate-600 space-y-1 pt-2">
                  <p><span className="font-bold">Owner:</span> {shop.owner_name}</p>
                  <p><span className="font-bold">Email:</span> {shop.email}</p>
                  <p><span className="font-bold">Phone:</span> {shop.phone}</p>
                  {shop.address && <p><span className="font-bold">Address:</span> {shop.address}</p>}
                </div>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleApprove(shop.id, shop.name)}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Shop</span>
                </button>
                <button
                  onClick={() => setRejectingShopId(shop.id)}
                  className="w-1/2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-red-200 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Pending Applications</h3>
          <p className="text-xs text-slate-500">All registered shop applications have been reviewed.</p>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingShopId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Reject Shop Registration</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide feedback explaining why the application was rejected..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingShopId(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs"
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
