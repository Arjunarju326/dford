import React from 'react';
import { Store, Filter } from 'lucide-react';
import { MOCK_STORES } from '@/lib/mock-data';
import { StoreCard } from '@/components/StoreCard';

export default function StoresPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Store className="w-6 h-6 text-emerald-500" />
            <span>Retail Stores & Supermarkets</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover verified local store chains, active promotional catalog counts & store branches.
          </p>
        </div>

        <button className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs hover:bg-slate-50 self-start md:self-auto">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {MOCK_STORES.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
