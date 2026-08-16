'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Layers,
  AlertTriangle,
  Bell,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function AdminCategoriesPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form input fields
  const [name, setName] = useState('');

  // Delete confirmation
  const [deletingCatId, setDeletingCatId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/v1/categories/`);
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      setCategories(data);
    } catch {
      showToast('Failed to load categories.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      name,
      parent: null,
      is_active: true,
      order: 0,
      icon: '',
      description: '',
      image_url: null,
    };

    try {
      if (editingCategory) {
        await axios.patch(`${API_BASE}/v1/categories/${editingCategory.id}/`, payload, { headers });
        showToast(`Category "${name}" updated successfully.`, 'success');
      } else {
        await axios.post(`${API_BASE}/v1/categories/`, payload, { headers });
        showToast(`Category "${name}" created successfully.`, 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      showToast('Failed to save category. Check your inputs.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('d4d_access_token');
    try {
      await axios.delete(`${API_BASE}/v1/categories/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Category deleted successfully.', 'info');
      setDeletingCatId(null);
      fetchCategories();
    } catch {
      showToast('Failed to delete category.', 'error');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#7B61FF] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Loading Categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] dark:text-white">Product Categories</h2>
          <p className="text-xs text-[#8A8A8A] dark:text-slate-400 font-semibold">Manage classification tags for offers & products.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="bg-[#7B61FF] hover:bg-[#6c52ed] text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-sm shadow-[#7B61FF]/10 transition-all uppercase tracking-wider flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="flex bg-white dark:bg-[#181636] p-3 rounded-2xl border border-slate-100 dark:border-[#232049]/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)] items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category by name..."
            className="w-full bg-white dark:bg-[#201D47] border border-slate-200 dark:border-[#2E2A5F] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
          />
        </div>
        <span className="text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider">
          Total: {categories.length} Categories
        </span>
      </div>

      {/* Categories Card Table Wrapper */}
      <div className="bg-white dark:bg-[#181636] rounded-[32px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-100/50 dark:border-[#232049]/40 space-y-4">
        <h3 className="font-extrabold text-sm text-[#1A1A1A] dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-[#2E2A5F] pb-4">
          Categories Directory
        </h3>

        {filteredCategories.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-[#242147]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#2E2A5F] bg-slate-50/50 dark:bg-[#0C0A20]/45 text-[#8A8A8A] dark:text-slate-400 font-extrabold">
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Slug ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2A5F] text-[#1A1A1A] dark:text-white">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/30 dark:hover:bg-[#201D47]/10 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-purple-50 dark:bg-purple-950/40 text-[#7B61FF] dark:text-[#8F82F8] rounded-lg flex items-center justify-center font-bold">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-black">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">{cat.slug}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-[#2C2957] text-slate-500 dark:text-slate-400 hover:text-[#7B61FF] rounded-full transition-all"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCatId(cat.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 text-slate-400 bg-slate-50/50 dark:bg-[#0F0E26]/30 rounded-2xl border border-dashed border-slate-200 dark:border-[#242147]">
            <Layers className="w-12 h-12 text-[#7B61FF]/40 mx-auto" />
            <p className="font-extrabold text-sm text-[#1A1A1A] dark:text-white">No Categories Found</p>
            <p className="text-xs max-w-xs mx-auto">No product categories created yet. Create one to begin.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181636] rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100 dark:border-[#242147] text-[#1A1A1A] dark:text-white">
            <h3 className="font-black text-lg">
              {editingCategory ? 'Edit Category' : 'Create Product Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#8A8A8A] dark:text-slate-400 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electronics, Fruits, Vegetables"
                  className="w-full bg-[#f8f9fd] dark:bg-[#201D47] border border-slate-200 dark:border-[#2E2A5F] rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold py-2.5 rounded-full text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#7B61FF] hover:bg-[#6c52ed] text-white font-extrabold py-2.5 rounded-full text-xs shadow-md shadow-[#7B61FF]/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCatId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181636] rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 dark:border-[#242147] text-[#1A1A1A] dark:text-white">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-black text-base">Delete Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Are you sure you want to delete this category? This action is permanent.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCatId(null)}
                className="w-1/2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold py-2.5 rounded-full text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingCatId)}
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
