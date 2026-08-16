import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';
import { ToastContainer } from '@/components/Toast';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

export const metadata: Metadata = {
  title: 'D4D Retail Offers & Flyer Discovery Platform',
  description: 'Discover local store promotions, supermarket flyers, and trending retail deals near you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <AnalyticsProvider />
        <ClientLayout>{children}</ClientLayout>
        <ToastContainer />
      </body>
    </html>
  );
}
