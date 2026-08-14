'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/api-analytics';

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView('page_view', pathname);
    }
  }, [pathname]);

  return null;
}
