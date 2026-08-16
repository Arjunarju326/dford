'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Clean, dedicated screen for admin and shop dashboard
  const isDashboardRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/shop');

  if (isDashboardRoute) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
