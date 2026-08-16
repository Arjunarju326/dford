'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Users,
  Search,
  Loader2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Mail,
  Bell,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: 'guest' | 'user' | 'content_manager' | 'admin';
  phone_number?: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Counts
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  // Deletion modal
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get(
        `${API_BASE}/v1/admin/users/?page=${page}&search=${encodeURIComponent(searchQuery)}`,
        { headers }
      );
      if (res.data.results) {
        setUsers(res.data.results);
        setCount(res.data.count || res.data.results.length);
      } else {
        const list = Array.isArray(res.data) ? res.data : [];
        setUsers(list);
        setCount(list.length);
      }
    } catch {
      showToast('Failed to load user directory.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(`${API_BASE}/v1/admin/users/${userId}/`, { user_type: newRole }, { headers });
      showToast(`User role updated to "${newRole}" successfully.`, 'success');
      fetchUsers();
    } catch {
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(`${API_BASE}/v1/admin/users/${userId}/`, { is_active: !currentStatus }, { headers });
      showToast('User account status updated!', 'success');
      fetchUsers();
    } catch {
      showToast('Failed to toggle user status.', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`${API_BASE}/v1/admin/users/${userId}/`, { headers });
      showToast('User account deleted successfully.', 'info');
      setDeletingUserId(null);
      fetchUsers();
    } catch {
      showToast('Failed to delete user account.', 'error');
    }
  };

  const getUserBadgeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'content_manager':
        return 'text-sky-600 bg-sky-50 border-sky-100';
      case 'user':
        return 'text-[#7B61FF] bg-purple-50 border-purple-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">User Moderation</h2>
          <p className="text-xs text-[#8A8A8A] font-semibold">Manage registered shopper accounts and platform administrators.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] hover:bg-slate-800 text-white flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="flex bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users by name, email..."
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
          />
        </div>
        <span className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-wider">
          Total: {count} Accounts
        </span>
      </div>

      {/* Users Card Table Wrapper */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-100/50 space-y-4">
        <h3 className="font-extrabold text-sm text-[#1A1A1A] uppercase tracking-wider border-b border-slate-100 pb-4">
          User Directory
        </h3>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#7B61FF] mx-auto" />
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[#8A8A8A] font-extrabold">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Contact Information</th>
                    <th className="p-4">User Role</th>
                    <th className="p-4">Staff Tag</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Joined Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#1A1A1A]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name Card */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-50 text-[#7B61FF] flex items-center justify-center font-black text-xs border border-purple-100">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-[#1A1A1A]">{user.full_name}</p>
                            <p className="text-[10px] text-[#8A8A8A] mt-0.5">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone_number && (
                            <p className="text-[10px] text-slate-400 pl-5 font-bold">{user.phone_number}</p>
                          )}
                        </div>
                      </td>

                      {/* User Type Select */}
                      <td className="p-4">
                        <select
                          value={user.user_type}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`border rounded-full px-3 py-1 text-[10px] font-black uppercase outline-none bg-white cursor-pointer transition-all ${getUserBadgeColor(
                            user.user_type
                          )}`}
                        >
                          <option value="guest">Guest</option>
                          <option value="user">Registered User</option>
                          <option value="content_manager">Content Manager</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      {/* Staff Check */}
                      <td className="p-4 whitespace-nowrap">
                        {user.is_staff || user.is_superuser ? (
                          <span className="inline-flex items-center space-x-1 bg-amber-50 border border-amber-100 text-amber-600 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>STAFF</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-slate-50 border border-slate-100 text-slate-400 font-bold text-[9px] px-2.5 py-0.5 rounded-full">
                            <span>MEMBER</span>
                          </span>
                        )}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className="focus:outline-none"
                          title={user.is_active ? 'Suspend Account' : 'Activate Account'}
                        >
                          {user.is_active ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-500 font-extrabold transition-all">
                              <ToggleRight className="w-7 h-7 text-emerald-500" />
                              <span className="text-[9px] uppercase tracking-wider">Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-slate-400 hover:text-slate-500 font-extrabold transition-all">
                              <ToggleLeft className="w-7 h-7 text-slate-300" />
                              <span className="text-[9px] uppercase tracking-wider">Suspended</span>
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-center font-bold text-slate-500 whitespace-nowrap">
                        {user.created_at ? user.created_at.split('T')[0] : 'n/a'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeletingUserId(user.id)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {count > 20 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] text-slate-400 font-bold">
                  Showing Page {page} of {Math.ceil(count / 20)}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-[#1A1A1A]"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= Math.ceil(count / 20)}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-[#1A1A1A]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Users className="w-12 h-12 text-[#7B61FF]/40 mx-auto" />
            <p className="font-extrabold text-sm text-[#1A1A1A]">No Users Found</p>
            <p className="text-xs max-w-xs mx-auto">No registered user matches your query.</p>
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-black text-base">Delete User Account</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Are you sure you want to permanently delete this user account? All settings and profile data will be destroyed. This cannot be undone.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUserId(null)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-full text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deletingUserId)}
                className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-full text-xs transition-colors"
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
