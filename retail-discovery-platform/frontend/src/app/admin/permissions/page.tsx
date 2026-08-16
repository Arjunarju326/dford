'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import { ShieldCheck, UserCheck, ShieldAlert, Key, Store, MapPin, FileText, BarChart3, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface SystemPermission {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
}

interface UserPermissionState {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_superuser: boolean;
  is_staff: boolean;
  permissions: Record<string, boolean>;
}

export default function AdminPermissionsPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [users, setUsers] = useState<UserPermissionState[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [permRes, userRes] = await Promise.all([
        axios.get(`${API_BASE}/v1/permissions/`),
        axios.get(`${API_BASE}/v1/users/permissions/`),
      ]);

      setPermissions(permRes.data);
      setUsers(userRes.data);

      if (userRes.data.length > 0 && !selectedUserId) {
        setSelectedUserId(userRes.data[0].id);
      }
    } catch (err) {
      showToast('Failed to load permission data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleTogglePermission = async (permCode: string, currentGranted: boolean) => {
    if (!selectedUserId) return;
    if (selectedUser?.is_superuser) {
      showToast('Super Admins automatically possess all system permissions.', 'info');
      return;
    }

    const key = `${selectedUserId}-${permCode}`;
    setIsUpdating((prev) => ({ ...prev, [key]: true }));

    const nextState = !currentGranted;

    try {
      await axios.post(`${API_BASE}/v1/users/${selectedUserId}/permissions/`, {
        permission_code: permCode,
        is_granted: nextState,
      });

      // Optimistically update state
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === selectedUserId) {
            return {
              ...u,
              permissions: {
                ...u.permissions,
                [permCode]: nextState,
              },
            };
          }
          return u;
        })
      );

      showToast(`Permission ${nextState ? 'granted' : 'revoked'} successfully!`, 'success');
    } catch (err) {
      showToast('Failed to update permission.', 'error');
    } finally {
      setIsUpdating((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Group permissions by category
  const categoriesMap: Record<string, SystemPermission[]> = {};
  permissions.forEach((p) => {
    if (!categoriesMap[p.category]) categoriesMap[p.category] = [];
    categoriesMap[p.category].push(p);
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'stores':
        return <Store className="w-4 h-4 text-emerald-600" />;
      case 'branches':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'flyers':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[#10B981] mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Access Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">User Permissions & Role Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure shop, branch, flyer upload, and admin privileges for platform users. Super Admins automatically possess all system permissions.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 shrink-0">
          <Sparkles className="w-6 h-6 text-[#10B981]" />
          <div>
            <span className="text-xs font-extrabold text-slate-900 block">Auto Super Admin Policy</span>
            <span className="text-[10px] text-emerald-700 font-bold">is_superuser = True has ALL permissions</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#10B981] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Loading System Permissions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Selector List */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-[#10B981]" />
              <span>Select Platform User ({users.length})</span>
            </h2>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-[#10B981]/10 border-[#10B981] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{u.username}</span>
                      {u.is_superuser ? (
                        <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Super Admin
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          {u.user_type}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{u.email}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className="lg:col-span-2 space-y-6">
            {selectedUser ? (
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 space-y-6">
                
                {/* User Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                      <span>Permissions for: {selectedUser.username}</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">{selectedUser.email}</p>
                  </div>

                  {selectedUser.is_superuser && (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span>Full Access Granted</span>
                    </div>
                  )}
                </div>

                {/* Category Sections */}
                <div className="space-y-6">
                  {Object.entries(categoriesMap).map(([catName, permList]) => (
                    <div key={catName} className="space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                        {getCategoryIcon(catName)}
                        <span>{catName} Permissions</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permList.map((p) => {
                          const isGranted = Boolean(selectedUser.permissions[p.code]);
                          const key = `${selectedUser.id}-${p.code}`;
                          const updating = isUpdating[key];

                          return (
                            <div
                              key={p.id}
                              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                                isGranted
                                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="font-extrabold text-xs block text-slate-900">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium leading-tight block">
                                  {p.description}
                                </span>
                                <span className="text-[9px] font-mono text-emerald-600 block pt-0.5">{p.code}</span>
                              </div>

                              <button
                                type="button"
                                disabled={updating || selectedUser.is_superuser}
                                onClick={() => handleTogglePermission(p.code, isGranted)}
                                className={`shrink-0 p-2 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-all ${
                                  isGranted
                                    ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-sm'
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                }`}
                              >
                                {updating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isGranted ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-3 bg-white rounded-[24px] border border-slate-200">
                <Key className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select a user to inspect permissions</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
