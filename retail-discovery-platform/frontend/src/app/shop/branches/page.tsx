'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Globe,
  ExternalLink,
  Map,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  location_url?: string;
  latitude?: number | string;
  longitude?: number | string;
  opening_hours?: string;
  is_active: boolean;
}

export default function ShopBranchesPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 AM - 11:00 PM');
  const [isActive, setIsActive] = useState(true);

  // Delete modal
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);

  const fetchBranches = async () => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      const res = await axios.get(`${API_BASE}/v1/shop/branches/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      setBranches(data);
    } catch {
      showToast('Failed to load shop branches.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openAddModal = () => {
    setEditingBranch(null);
    setName('');
    setAddress('');
    setPhone('');
    setLocationUrl('');
    setOpeningHours('08:00 AM - 11:00 PM');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address || '');
    setPhone(branch.phone || '');
    setLocationUrl(branch.location_url || '');
    setOpeningHours(branch.opening_hours || '08:00 AM - 11:00 PM');
    setIsActive(branch.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      name,
      address,
      phone,
      location_url: locationUrl,
      opening_hours: openingHours,
      is_active: isActive,
    };

    try {
      if (editingBranch) {
        await axios.patch(`${API_BASE}/v1/shop/branches/${editingBranch.id}/`, payload, { headers });
        showToast(`Branch "${name}" updated successfully!`, 'success');
      } else {
        await axios.post(`${API_BASE}/v1/shop/branches/`, payload, { headers });
        showToast(`Branch "${name}" created successfully!`, 'success');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch {
      showToast('Failed to save branch.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.delete(`${API_BASE}/v1/shop/branches/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Branch deleted successfully.', 'info');
      setDeletingBranchId(null);
      fetchBranches();
    } catch {
      showToast('Failed to delete branch.', 'error');
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#10B981] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Loading Outlets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F2937]">Store Branches & Outlets</h2>
          <p className="text-xs text-[#9CA3AF] font-semibold">Manage physical locations, Google Maps links, phone contacts, and operating hours.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-sm shadow-[#10B981]/20 transition-all uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="flex bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search branch by name or phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          Total: {branches.length} Outlets
        </span>
      </div>

      {/* Branches Cards Grid */}
      {filteredBranches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => {
            const mapHref =
              branch.location_url ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name + ' ' + (branch.address || ''))}`;
            return (
              <div
                key={branch.id}
                className="bg-white rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between space-y-4 hover:border-[#10B981]/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#1F2937] leading-tight">{branch.name}</h4>
                        <span className="text-[10px] text-[#10B981] font-bold">Outlet #{branch.id}</span>
                      </div>
                    </div>
                    {branch.is_active ? (
                      <span className="bg-emerald-50 text-[#10B981] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">Active</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">Inactive</span>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{branch.address || 'No street address provided'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.phone || 'No contact phone'}</span>
                    </div>

                    <div className="pt-1">
                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#10B981] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Open Google Maps Location</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(branch)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-[#10B981] rounded-full transition-all"
                    title="Edit Outlet"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingBranchId(branch.id)}
                    className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full transition-all"
                    title="Delete Outlet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 text-slate-400 bg-white rounded-[24px] border border-dashed border-slate-200">
          <Building2 className="w-12 h-12 text-[#10B981]/30 mx-auto" />
          <p className="font-extrabold text-sm text-[#1F2937]">No Outlets Configured</p>
          <p className="text-xs max-w-xs mx-auto">Add your store branches to allow shoppers to find your physical location on Google Maps.</p>
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-100 text-[#1F2937]">
            <h3 className="font-black text-lg">
              {editingBranch ? 'Edit Store Branch' : 'Add Store Branch'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Doha Main Outlet, Al Wakrah Branch"
                  className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+974 4400 1122"
                    className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="08:00 AM - 11:00 PM"
                    className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, building, zone number..."
                  className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              {/* Google Maps Location Link Input */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Google Maps Location Link URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Paste the Google Maps share link for this store location.</p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#10B981] accent-[#10B981] rounded"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-[#1F2937]">
                  Outlet Active & Open for Shoppers
                </label>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-full text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold py-2.5 rounded-full text-xs shadow-md shadow-[#10B981]/20"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBranchId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-[#1F2937]">
            <h3 className="font-black text-base text-center">Delete Branch</h3>
            <p className="text-xs text-slate-500 text-center font-semibold">
              Are you sure you want to delete this branch outlet?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBranchId(null)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-full text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingBranchId)}
                className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 rounded-full text-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
