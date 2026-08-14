import React from 'react';
import { FileText, Filter } from 'lucide-react';
import { MOCK_FLYERS } from '@/lib/mock-data';
import { FlyerCard } from '@/components/FlyerCard';

export default function FlyersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>Digital Supermarket Flyers & Circulars</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Flip through active weekly catalog brochures from your local retail stores.
          </p>
        </div>

        <button className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs hover:bg-slate-50 self-start md:self-auto">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter by Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {MOCK_FLYERS.map((flyer) => (
          <FlyerCard key={flyer.id} flyer={flyer} />
        ))}
      </div>
    </div>
  );
}
