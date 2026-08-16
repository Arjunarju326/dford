'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FlyerPageViewer } from '@/components/FlyerPageViewer';

export default function PublicFlyerViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const flyerId = params?.id as string;
  const debugGrid = searchParams?.get('debugGrid') === 'true';

  if (!flyerId) return null;

  return <FlyerPageViewer flyerId={flyerId} initialPage={1} debugGrid={debugGrid} />;
}
