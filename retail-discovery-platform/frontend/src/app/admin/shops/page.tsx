'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Building2,
  Clock,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Bell,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Branch {
  id: number;
  name: string;
  city_name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

interface Shop {
  id: number;
  name: string;
  legal_name?: string;
  owner_name: string;
  owner_username?: string;
  email: string;
  phone: string;
  address: string;
  city_name?: string;
  status: string;
  is_active: boolean;
  logo_url?: string;
  website?: string;
  branches?: Branch[];
}

export default function AdminShopsPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [shops, setShops] = useState<Shop[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedShopId, setExpandedShopId] = useState<number | null>(null);

  // Rejection states
  const [rejectingShopId, setRejectingShopId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchShops = async () => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      const res = await axios.get(`${API_BASE}/v1/admin/shops/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      setShops(data);
    } catch {
      showToast('Failed to load shops.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
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
      fetchShops();
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
      showToast('Shop registration rejected.', 'info');
      setRejectingShopId(null);
      setRejectionReason('');
      fetchShops();
    } catch {
      showToast('Failed to reject shop.', 'error');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedShopId(expandedShopId === id ? null : id);
  };

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return shop.status === filterStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
            Approved
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            <span>Pending</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/30 text-slate-600 dark:text-slate-400 font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#7B61FF] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Loading Shops Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and top icons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] dark:text-white">Shops & Branches</h2>
          <p className="text-xs text-[#8A8A8A] dark:text-slate-400 font-semibold">Manage registered retail partners and branch outlets.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, owner..."
              className="w-full bg-white dark:bg-[#201D47] border border-slate-200 dark:border-[#2E2A5F] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
            />
          </div>
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex bg-white dark:bg-[#181636] p-3 rounded-2xl border border-slate-100 dark:border-[#232049]/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)] items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5">
          {['ALL', 'APPROVED', 'PENDING_APPROVAL', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`font-extrabold text-[10px] px-4 py-2 rounded-full transition-all uppercase tracking-wider ${
                filterStatus === status
                  ? 'bg-[#7B61FF] text-white'
                  : 'text-[#8A8A8A] dark:text-slate-400 hover:text-[#1A1A1A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#201D47]'
              }`}
            >
              {status === 'PENDING_APPROVAL' ? 'PENDING' : status}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider">
          {filteredShops.length} Found
        </span>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#181636] rounded-[32px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-100/50 dark:border-[#232049]/40 space-y-4">
        <h3 className="font-extrabold text-sm text-[#1A1A1A] dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-[#2E2A5F] pb-4">
          Partners List
        </h3>

        {filteredShops.length > 0 ? (
          <div className="space-y-4">
            {filteredShops.map((shop) => {
              const isExpanded = expandedShopId === shop.id;
              return (
                <div
                  key={shop.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-slate-50/50 dark:bg-[#24224C] border-[#7B61FF] dark:border-[#4A3AFF]'
                      : 'bg-white dark:bg-[#0F0E26]/50 border-slate-100 dark:border-[#242147] hover:bg-slate-50/40 dark:hover:bg-[#201D47]/20'
                  }`}
                >
                  {/* Shop Header Row */}
                  <div
                    onClick={() => toggleExpand(shop.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-[#201D47] border border-purple-100 dark:border-[#2E2A5F] overflow-hidden flex items-center justify-center shrink-0">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#7B61FF]" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-black text-sm text-[#1A1A1A] dark:text-white truncate leading-tight">{shop.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-[10px] text-[#8A8A8A] dark:text-slate-400">Owner: {shop.owner_name}</p>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-[#2E2A5F] rounded-full"></span>
                          <p className="text-[10px] text-[#7B61FF] dark:text-[#8F82F8] font-bold">{shop.branches?.length || 0} Outlets</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 self-end sm:self-auto">
                      {getStatusBadge(shop.status)}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-200/60 dark:border-[#2E2A5F] bg-white dark:bg-[#0C0A20]/45 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Owner Credentials</span>
                          <p className="text-xs font-bold text-[#1A1A1A] dark:text-white">{shop.owner_name} ({shop.owner_username || 'n/a'})</p>
                          <div className="flex items-center space-x-1.5 text-[10px] text-[#8A8A8A] dark:text-slate-400 pt-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{shop.email}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Headquarters Address</span>
                          <p className="text-xs font-bold text-[#1A1A1A] dark:text-white">{shop.address || 'Street address'}</p>
                          <div className="flex items-center space-x-1.5 text-[10px] text-[#8A8A8A] dark:text-slate-400 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{shop.city_name || 'Qatar'}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider block">Contact & Digital</span>
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1A1A1A] dark:text-white">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{shop.phone || 'No phone'}</span>
                          </div>
                          {shop.website && (
                            <a
                              href={shop.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-[10px] text-[#7B61FF] dark:text-purple-300 hover:underline pt-1"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="truncate">{shop.website}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Moderation Actions */}
                      {shop.status === 'PENDING_APPROVAL' && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-200">Pending registration approval</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setRejectingShopId(shop.id)}
                              className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/30 font-extrabold px-4 py-2 rounded-full text-[10px] transition-all"
                            >
                              Reject Shop
                            </button>
                            <button
                              onClick={() => handleApprove(shop.id, shop.name)}
                              className="bg-[#7B61FF] hover:bg-[#6c52ed] text-white font-extrabold px-5 py-2 rounded-full text-[10px] transition-all shadow-sm"
                            >
                              Approve Partner
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Branches */}
                      <div className="space-y-3 pt-2">
                        <h5 className="font-extrabold text-xs text-[#1A1A1A] dark:text-slate-300 tracking-wide uppercase flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4 text-[#7B61FF] dark:text-[#8F82F8]" />
                          <span>Branch Outlets ({shop.branches?.length || 0})</span>
                        </h5>

                        {shop.branches && shop.branches.length > 0 ? (
                          <div className="bg-white dark:bg-[#0F0E26]/30 border border-slate-100 dark:border-[#242147] rounded-2xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-[#2E2A5F] bg-slate-50/50 dark:bg-[#0C0A20]/30 text-[#8A8A8A] dark:text-slate-400 font-extrabold">
                                  <th className="p-4">Branch Name</th>
                                  <th className="p-4">City</th>
                                  <th className="p-4">Address</th>
                                  <th className="p-4">Contact Phone</th>
                                  <th className="p-4 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2A5F] text-[#1A1A1A] dark:text-white">
                                {shop.branches.map((branch) => (
                                  <tr key={branch.id} className="hover:bg-slate-50/30 dark:hover:bg-[#201D47]/10 transition-colors">
                                    <td className="p-4 font-bold whitespace-nowrap">{branch.name}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{branch.city_name}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate">{branch.address}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{branch.phone || 'n/a'}</td>
                                    <td className="p-4 text-center">
                                      {branch.is_active ? (
                                        <span className="inline-block bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                                          Active
                                        </span>
                                      ) : (
                                        <span className="inline-block bg-slate-100 dark:bg-slate-500/15 text-slate-500 dark:text-slate-400 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                                          Inactive
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 bg-slate-50/30 dark:bg-[#0F0E26]/20 border border-dashed border-slate-200 dark:border-[#242147] rounded-2xl text-center text-slate-400 text-xs font-semibold">
                            No branches registered for this store.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 text-slate-400 bg-slate-50/50 dark:bg-[#0F0E26]/30 rounded-2xl border border-dashed border-slate-200 dark:border-[#242147]">
            <Building2 className="w-12 h-12 text-[#7B61FF]/40 mx-auto" />
            <p className="font-extrabold text-sm text-[#1A1A1A] dark:text-white">No Shops Found</p>
            <p className="text-xs max-w-xs mx-auto">No shops match the status filters or query.</p>
          </div>
        )}
      </div>

      {/* Reject Shop Modal */}
      {rejectingShopId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181636] rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100 dark:border-[#242147] text-[#1A1A1A] dark:text-white">
            <h3 className="font-black text-lg">Reject Shop Application</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3">
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
                    setRejectingShopId(null);
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
