'use client';

import React from 'react';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-center justify-between space-x-3 transition-all animate-slide-up ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : toast.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-sky-600 text-white border-sky-700'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-200 shrink-0" />}
            <span>{toast.message}</span>
          </div>

          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
