'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Tag,
  Plus,
  Calendar,
  Building2,
  Image as ImageIcon,
  Loader2,
  CheckSquare,
  Square,
  Globe,
  Trash2,
  Upload,
  Sparkles,
  Edit2,
  DollarSign,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Branch {
  id: number;
  name: string;
  address: string;
}

interface Category {
  id: number;
  name: string;
}

interface ExtractedItem {
  id?: string;
  product_name: string;
  offer_price: string;
  original_price: string;
  store_branch: string | number;
}

interface Flyer {
  id: number;
  title: string;
  description: string;
  cover_image_url: string;
  start_date: string;
  end_date: string;
  branches?: number[];
  store?: number;
  store_name?: string;
  category_name?: string;
  status: string;
}

export default function ShopFlyersPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnalyzingFlyer, setIsAnalyzingFlyer] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  
  // Extracted items list
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);

  // Delete state
  const [deletingFlyerId, setDeletingFlyerId] = useState<number | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let currentShop: any = null;

    try {
      const shopRes = await axios.get(`${API_BASE}/v1/shop/me/`, { headers });
      currentShop = shopRes.data;
      setShop(currentShop);
    } catch {
      const userStr = localStorage.getItem('d4d_user');
      let uname = 'My Store';
      if (userStr) {
        try { uname = JSON.parse(userStr).username; } catch {}
      }
      currentShop = { id: null, name: uname };
      setShop(currentShop);
    }

    try {
      const branchesRes = await axios.get(`${API_BASE}/v1/shop/branches/`, { headers });
      const bData = Array.isArray(branchesRes.data.results) ? branchesRes.data.results : branchesRes.data;
      setBranches(bData);
    } catch {
      setBranches([]);
    }

    try {
      const catRes = await axios.get(`${API_BASE}/v1/categories/`);
      const cData = Array.isArray(catRes.data.results) ? catRes.data.results : catRes.data;
      setCategories(cData);
    } catch {
      setCategories([]);
    }

    try {
      const flyersRes = await axios.get(`${API_BASE}/v1/flyers/`);
      const fData: Flyer[] = Array.isArray(flyersRes.data.results) ? flyersRes.data.results : flyersRes.data;
      
      if (currentShop && currentShop.id) {
        const myFlyers = fData.filter(
          (f) => f.store === currentShop.id || f.store_name === currentShop.name
        );
        setFlyers(myFlyers);
      } else {
        setFlyers(fData);
      }
    } catch {
      setFlyers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setCoverImageUrl('');
    setOnlineUrl('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setSelectedBranchIds(branches.map((b) => b.id));
    setExtractedItems([]);
    setIsModalOpen(true);
  };

  const handleBranchToggle = (branchId: number) => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]
    );
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setIsAnalyzingFlyer(true);

    const formData = new FormData();
    formData.append('files', file);
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('store_name', shop?.name || 'Retail Outlet');
    if (startDate) formData.append('valid_from', startDate);
    if (endDate) formData.append('valid_to', endDate);

    try {
      const token = localStorage.getItem('d4d_access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${API_BASE}/v1/flyers/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.id) {
        setCoverImageUrl(res.data.cover_image_url || res.data.image_url);
        showToast('Flyer uploaded & analyzed with Gemini 2.0 Flash!', 'success');

        // Fetch real extracted items for preview and editing
        try {
          const pageRes = await axios.get(`${API_BASE}/v1/flyers/${res.data.id}/pages/1`);
          if (pageRes.data && Array.isArray(pageRes.data.flyer_items)) {
            const realItems: ExtractedItem[] = pageRes.data.flyer_items.map((item: any) => ({
              id: String(item.id),
              product_name: item.name,
              offer_price: item.offer_price !== null ? String(item.offer_price) : '',
              original_price: item.mrp !== null ? String(item.mrp) : '',
              store_branch: branches[0]?.id || '',
            }));
            setExtractedItems(realItems);
            showToast(`Extracted ${realItems.length} real deal items with Gemini AI!`, 'info');
          }
        } catch {
          // Fallback if page query fails
        }
      }
    } catch {
      showToast('Flyer analysis failed.', 'error');
    } finally {
      setIsUploadingImage(false);
      setIsAnalyzingFlyer(false);
    }
  };

  const handleAddItemRow = () => {
    setExtractedItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        product_name: 'New Promotional Item',
        offer_price: '9.99',
        original_price: '15.00',
        store_branch: branches[0]?.id || '',
      },
    ]);
  };

  const handleUpdateItemRow = (index: number, field: keyof ExtractedItem, value: string) => {
    setExtractedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteItemRow = (index: number) => {
    setExtractedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coverImageUrl) {
      showToast('Please provide a title and upload a cover image.', 'error');
      return;
    }

    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    // Format extracted items for payload
    const formattedItems = extractedItems.map((item) => ({
      product_name: item.product_name,
      offer_price: parseFloat(item.offer_price) || 0.0,
      original_price: parseFloat(item.original_price) || 0.0,
      store_branch: item.store_branch ? parseInt(String(item.store_branch)) : null,
    }));

    const payload = {
      store: shop?.id,
      category: categoryId ? parseInt(categoryId) : null,
      title,
      description,
      cover_image_url: coverImageUrl,
      online_shopping_url: onlineUrl,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      branches: selectedBranchIds,
      items: formattedItems,
    };

    try {
      await axios.post(`${API_BASE}/v1/flyers/`, payload, { headers });
      showToast(`Flyer "${title}" & ${formattedItems.length} items published successfully!`, 'success');
      setIsModalOpen(false);
      fetchData();
    } catch {
      showToast('Failed to publish flyer.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.delete(`${API_BASE}/v1/flyers/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Flyer deleted.', 'info');
      setDeletingFlyerId(null);
      fetchData();
    } catch {
      showToast('Failed to delete flyer.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#10B981] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Loading Store Circulars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F2937]">{shop?.name || 'Store'} Offers & Flyers</h2>
          <p className="text-xs text-[#9CA3AF] font-semibold">Publish weekly deal circulars by category and assign items across your outlets.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-sm shadow-[#10B981]/20 transition-all uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Upload New Flyer</span>
        </button>
      </div>

      {/* Flyers Grid */}
      {flyers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flyers.map((flyer) => (
            <div
              key={flyer.id}
              className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between space-y-4 hover:border-[#10B981]/40 transition-all group"
            >
              <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                {flyer.cover_image_url ? (
                  <img src={flyer.cover_image_url} alt={flyer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                {flyer.category_name && (
                  <span className="absolute top-3 left-3 bg-[#1F2937]/80 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    {flyer.category_name}
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-md">
                  Published
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-[#1F2937] leading-snug line-clamp-2">{flyer.title}</h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Valid: {new Date(flyer.start_date).toLocaleDateString()} - {new Date(flyer.end_date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-[#10B981] font-bold">
                  <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Shared across {flyer.branches?.length || branches.length || 1} branches</span>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold">ID: #FL-{flyer.id}</span>
                <button
                  onClick={() => setDeletingFlyerId(flyer.id)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-all"
                  title="Delete Flyer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 text-slate-400 bg-white rounded-[24px] border border-dashed border-slate-200">
          <Tag className="w-12 h-12 text-[#10B981]/30 mx-auto" />
          <p className="font-extrabold text-sm text-[#1F2937]">No Store Circulars Uploaded</p>
          <p className="text-xs max-w-xs mx-auto">Upload your weekly promotional flyer circulars to publish discounts across your outlets.</p>
        </div>
      )}

      {/* Upload Flyer Modal with Analysis & Inline Items Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-2xl w-full space-y-5 shadow-xl border border-slate-100 text-[#1F2937] max-h-[92vh] overflow-y-auto">
            <h3 className="font-black text-lg flex items-center space-x-2">
              <span>Upload Promotional Flyer</span>
              <Sparkles className="w-5 h-5 text-[#10B981]" />
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Flyer Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Supermarket Weekly Offers"
                  className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Product Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Image File Upload */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Flyer Cover Image *
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingImage ? 'Compressing & Uploading...' : 'Choose Image File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                  {coverImageUrl && (
                    <img src={coverImageUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                  )}
                </div>
              </div>

              {/* AUTOMATED AI FLYER ANALYSIS & EDITABLE ITEMS PREVIEW */}
              {isAnalyzingFlyer && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-3 text-[#10B981]">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span className="text-xs font-bold">Analyzing flyer image & extracting items and prices...</span>
                </div>
              )}

              {coverImageUrl && !isAnalyzingFlyer && (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#10B981]" />
                      <span className="text-xs font-extrabold text-[#1F2937]">
                        Extracted Deal Items ({extractedItems.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-[10px] bg-[#10B981] text-white font-bold px-3 py-1 rounded-full shadow-sm"
                    >
                      + Add Item Row
                    </button>
                  </div>

                  {extractedItems.length > 0 ? (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {extractedItems.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <div className="sm:col-span-5">
                              <label className="block text-[9px] font-bold text-slate-400">Product Name</label>
                              <input
                                type="text"
                                value={item.product_name}
                                onChange={(e) => handleUpdateItemRow(idx, 'product_name', e.target.value)}
                                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1F2937]"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[9px] font-bold text-slate-400">Offer Price (₹)</label>
                              <input
                                type="text"
                                value={item.offer_price}
                                onChange={(e) => handleUpdateItemRow(idx, 'offer_price', e.target.value)}
                                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#10B981]"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[9px] font-bold text-slate-400">Original Price</label>
                              <input
                                type="text"
                                value={item.original_price}
                                onChange={(e) => handleUpdateItemRow(idx, 'original_price', e.target.value)}
                                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-500 line-through"
                              />
                            </div>

                            <div className="sm:col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteItemRow(idx)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-full"
                                title="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Branch Selection per item */}
                          {branches.length > 0 && (
                            <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                              <span className="text-[9px] font-bold text-slate-400">Outlet Assignment:</span>
                              <select
                                value={String(item.store_branch)}
                                onChange={(e) => handleUpdateItemRow(idx, 'store_branch', e.target.value)}
                                className="bg-[#f8f9fd] border border-slate-200 rounded-md px-2 py-0.5 text-[10px] font-bold text-[#1F2937]"
                              >
                                <option value="">All Outlets</option>
                                {branches.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">No items added yet. Click "+ Add Item Row" above to add products.</p>
                  )}
                </div>
              )}

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              {/* MULTI-BRANCH CHECKBOXES SECTION */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Select Participating Outlets ({selectedBranchIds.length} Ticked)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBranchIds(branches.map((b) => b.id))}
                    className="text-[10px] font-bold text-[#10B981] hover:underline"
                  >
                    Select All
                  </button>
                </div>

                {branches.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {branches.map((branch) => {
                      const isTicked = selectedBranchIds.includes(branch.id);
                      return (
                        <div
                          key={branch.id}
                          onClick={() => handleBranchToggle(branch.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isTicked
                              ? 'bg-emerald-50/60 border-[#10B981] text-[#10B981] font-bold'
                              : 'bg-white border-slate-200 text-slate-600 font-medium'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {isTicked ? (
                              <CheckSquare className="w-4 h-4 text-[#10B981] shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="text-xs truncate">{branch.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 shrink-0">{branch.address || 'Outlet'}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No branch outlets created yet.</p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
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
                  Publish Flyer & Extracted Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFlyerId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-[#1F2937]">
            <h3 className="font-black text-base text-center">Delete Flyer</h3>
            <p className="text-xs text-slate-500 text-center font-semibold">
              Are you sure you want to delete this flyer circular?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFlyerId(null)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-full text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingFlyerId)}
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
