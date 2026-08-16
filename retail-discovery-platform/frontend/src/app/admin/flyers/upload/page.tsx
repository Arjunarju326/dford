'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import { Upload, Sparkles, Loader2, FileText, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminFlyerUploadPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [title, setTitle] = useState('');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Supermarket');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) {
        showToast(`File ${f.name} exceeds 10MB limit.`, 'error');
        return;
      }
    }

    setFiles(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      showToast('Please select at least one flyer image page or PDF document.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgressMsg(`Processing ${files.length} page file(s) with Gemini 2.0 Flash VLM...`);

    const formData = new FormData();
    files.forEach((f) => {
      formData.append('files', f);
    });
    formData.append('title', title || files[0].name.replace(/\.[^/.]+$/, ''));
    formData.append('store_name', storeName || 'Retail Outlet');
    formData.append('category', category);

    if (validFrom) formData.append('valid_from', validFrom);
    if (validTo) formData.append('valid_to', validTo);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('d4d_access_token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${API_BASE}/v1/flyers/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.id) {
        showToast(res.data.message || 'Multi-page flyer uploaded & grid aligned successfully!', 'success');
        // Redirect to viewer with debugGrid=true for QA verification
        router.push(`/offers/${res.data.id}?debugGrid=true`);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Multi-page flyer upload & grid extraction failed.';
      showToast(errMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 font-sans">
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 space-y-6 text-slate-900">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black flex items-center space-x-2">
            <span>Multi-Page Retail Flyer Upload</span>
            <Sparkles className="w-5 h-5 text-[#10B981]" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Upload multi-page images or PDF circulars. Gemini 2.0 Flash VLM will extract grid structures and snap cells to uniform row/column bands matching D4D Online.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Store */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Flyer Campaign Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Mega Sale Circular"
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. LuLu Hypermarket"
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          {/* Category & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="Supermarket">Supermarket</option>
                <option value="Electronics">Electronics</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Health & Beauty">Health & Beauty</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Valid From
              </label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Valid Until
              </label>
              <input
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          {/* Multi-file Image or PDF Dropzone */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Flyer Pages (Select Multiple Images or Single PDF) *
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#10B981] transition-all bg-[#f8f9fd]">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="multiFlyerInput"
              />
              <label htmlFor="multiFlyerInput" className="cursor-pointer space-y-3 block">
                <Upload className="w-10 h-10 text-[#10B981] mx-auto" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {files.length > 0
                      ? `${files.length} page file(s) selected`
                      : 'Click to select multi-page images or PDF file'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, WEBP, and PDF documents</span>
                </div>
              </label>
            </div>
          </div>

          {/* Files Selected List */}
          {files.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Selected Upload Files ({files.length})</span>
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#10B981] mx-auto" />
              <div>
                <p className="font-extrabold text-sm text-slate-900">{progressMsg}</p>
                <p className="text-xs text-emerald-700 font-medium">Converting pages, analyzing grid structures & snapping cell bounds...</p>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={files.length === 0}
              className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider shadow-lg shadow-[#10B981]/25 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Upload & Run Grid Extraction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
