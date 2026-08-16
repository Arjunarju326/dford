'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import {
  Megaphone,
  Plus,
  Send,
  Loader2,
  Trash2,
  AlertTriangle,
  Calendar,
  User as UserIcon,
  Bell,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by_username: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Delete states
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_BASE}/v1/notifications/announcements/`);
      const data = Array.isArray(res.data.results) ? res.data.results : res.data;
      setAnnouncements(data);
    } catch {
      showToast('Failed to load announcements feed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSending(true);
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(
        `${API_BASE}/v1/notifications/announcements/`,
        { title, content, is_active: true },
        { headers }
      );
      showToast('Announcement broadcasted and notifications sent!', 'success');
      setTitle('');
      setContent('');
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch {
      showToast('Failed to broadcast announcement.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleActive = async (ann: Announcement) => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(
        `${API_BASE}/v1/notifications/announcements/${ann.id}/`,
        { is_active: !ann.is_active },
        { headers }
      );
      showToast('Announcement status updated!', 'success');
      fetchAnnouncements();
    } catch {
      showToast('Failed to toggle status.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('d4d_access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`${API_BASE}/v1/notifications/announcements/${id}/`, { headers });
      showToast('Announcement deleted.', 'info');
      setDeletingId(null);
      fetchAnnouncements();
    } catch {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#7B61FF] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Loading Announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">Broadcast Announcements</h2>
          <p className="text-xs text-[#8A8A8A] font-semibold">Publish portal notifications to all active shopper profiles instantly.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] hover:bg-slate-800 text-white flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#7B61FF] hover:bg-[#6c52ed] text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-sm shadow-[#7B61FF]/10 transition-all uppercase tracking-wider flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Announcements Feed Dashboard */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-100/50 space-y-6">
        <h3 className="font-extrabold text-sm text-[#1A1A1A] uppercase tracking-wider border-b border-slate-100 pb-4">
          Broadcast History
        </h3>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-6 rounded-[24px] border transition-all flex flex-col justify-between space-y-4 ${
                  ann.is_active
                    ? 'bg-white border-[#E8E2F7] shadow-sm shadow-purple-100/30'
                    : 'bg-slate-50 border-slate-100 opacity-75'
                }`}
              >
                {/* Announcement Card Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#7B61FF] uppercase tracking-wider bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-lg flex items-center space-x-1">
                      <Megaphone className="w-3 h-3 text-[#7B61FF]" />
                      <span>Broadcast #{ann.id}</span>
                    </span>
                    <button
                      onClick={() => handleToggleActive(ann)}
                      className={`text-[9px] font-black px-2.5 py-0.5 rounded-full transition-colors ${
                        ann.is_active
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={ann.is_active ? 'Archive Announcement' : 'Reactivate Announcement'}
                    >
                      {ann.is_active ? 'Active' : 'Archived'}
                    </button>
                  </div>
                  <h4 className="font-black text-sm text-[#1A1A1A] pt-1">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">{ann.content}</p>
                </div>

                {/* Announcement Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span>{ann.created_by_username || 'admin'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{ann.created_at ? ann.created_at.split('T')[0] : 'n/a'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeletingId(ann.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors"
                    title="Delete Broadcast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Megaphone className="w-12 h-12 text-[#7B61FF]/40 mx-auto" />
            <p className="font-extrabold text-sm text-[#1A1A1A]">No Announcements Sent</p>
            <p className="text-xs max-w-xs mx-auto">There are no broadcast system announcements yet.</p>
          </div>
        )}
      </div>

      {/* Broadcast Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100 text-[#1A1A1A]">
            <h3 className="font-black text-lg">Broadcast System Announcement</h3>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#8A8A8A] uppercase tracking-wider mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System updates..."
                  className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#8A8A8A] uppercase tracking-wider mb-1">
                  Announcement Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type the message that will be broadcasted..."
                  className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setTitle('');
                    setContent('');
                  }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-full text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-1/2 bg-[#7B61FF] hover:bg-[#6c52ed] text-white font-extrabold py-2.5 rounded-full text-xs transition-colors shadow-md shadow-[#7B61FF]/10 flex items-center justify-center space-x-1.5"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Broadcast Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-[#0f0e26]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-black text-[#1b193b] text-base">Delete Broadcast</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Are you sure you want to delete this broadcast? The announcement card will be permanently deleted.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-full text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
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
