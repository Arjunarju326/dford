import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-base">
                D4D
              </div>
              <span className="font-bold text-white text-lg tracking-tight">RetailDeals</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your location-aware retail discovery platform for finding local store promotions, active flyers, and product comparison deals.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/offers" className="hover:text-white transition-colors">Trending Offers</Link></li>
              <li><Link href="/flyers" className="hover:text-white transition-colors">Digital Flyers</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Retail Stores</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Account & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/account/favorites" className="hover:text-white transition-colors">Saved Offers</Link></li>
              <li><Link href="/account/lists" className="hover:text-white transition-colors">Shopping List</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">User Login</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} D4D Retail Discovery Platform. All rights reserved. Discovery & Search tool only.</p>
        </div>
      </div>
    </footer>
  );
}
