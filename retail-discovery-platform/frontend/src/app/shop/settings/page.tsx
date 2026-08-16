'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Settings,
  Lock,
  User,
  Mail,
  Store,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Key,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ShopSettingsPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);

  // Password Change Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('d4d_user');
    const token = localStorage.getItem('d4d_access_token');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    if (token) {
      axios
        .get(`${API_BASE}/v1/shop/me/`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setShop(res.data))
        .catch(() => {});
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsChangingPassword(true);
    const token = localStorage.getItem('d4d_access_token');

    try {
      await axios.post(
        `${API_BASE}/auth/change-password/`,
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        showToast(err.response.data.error, 'error');
      } else {
        showToast('Failed to update password. Check old password.', 'error');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Row */}
      <div>
        <h2 className="text-xl font-extrabold text-[#1F2937]">Store Account Settings</h2>
        <p className="text-xs text-[#9CA3AF] font-semibold">Manage account credentials, change password, and view store profile details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Change Password Card */}
        <div className="md:col-span-7 bg-white rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1F2937]">Change Store Password</h3>
              <p className="text-[10px] text-slate-400 font-medium">Update your account password for store manager access.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password..."
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold py-3 rounded-full text-xs shadow-md shadow-[#10B981]/20 transition-all uppercase tracking-wider mt-2"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Account Password'}
            </button>
          </form>
        </div>

        {/* Right Column: Account & Store Overview */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Account Profile Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
            <h3 className="font-extrabold text-sm text-[#1F2937] border-b border-slate-100 pb-3">
              Account Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Username</span>
                <span className="font-bold text-[#1F2937]">{currentUser?.username || 'store_user'}</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="font-bold text-[#1F2937]">{currentUser?.email || 'user@example.com'}</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Account Role</span>
                <span className="inline-block bg-emerald-50 text-[#10B981] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full mt-0.5">
                  Store Partner
                </span>
              </div>
            </div>
          </div>

          {/* Store Profile Summary */}
          {shop && (
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
              <h3 className="font-extrabold text-sm text-[#1F2937] border-b border-slate-100 pb-3">
                Registered Store Details
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 overflow-hidden flex items-center justify-center shrink-0 border border-purple-100">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-[#10B981]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1F2937]">{shop.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{shop.email}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 font-medium">
                  <p>HQ Address: {shop.address || 'Doha, Qatar'}</p>
                  <p>Phone: {shop.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
