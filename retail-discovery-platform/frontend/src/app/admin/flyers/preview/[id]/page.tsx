'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FlyerViewer } from '@/components/FlyerViewer';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminFlyerPreviewPage() {
  const params = useParams();
  const flyerId = params?.id as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Link
          href="/admin/flyers/upload"
          className="text-xs font-bold text-slate-500 hover:text-[#10B981] flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Another Flyer</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs font-extrabold text-[#10B981]">
          <CheckCircle2 className="w-4 h-4" />
          <span>Extracted Coordinates QA Mode</span>
        </div>
      </div>

      {flyerId && <FlyerViewer flyerId={flyerId} debugBoxes={true} />}
    </div>
  );
}
