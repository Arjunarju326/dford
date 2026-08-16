'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Tag,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useToastStore((state) => state.showToast);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('d4d_access_token');
    const userStr = localStorage.getItem('d4d_user');

    if (!token || !userStr) {
      showToast('Authentication required. Please log in.', 'error');
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setIsLoaded(true);
    } catch (e) {
      localStorage.removeItem('d4d_access_token');
      localStorage.removeItem('d4d_user');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('d4d_access_token');
    localStorage.removeItem('d4d_refresh_token');
    localStorage.removeItem('d4d_user');
    showToast('Logged out of Shop Manager Portal.', 'info');
    router.push('/');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/shop',
      icon: LayoutDashboard,
      active: pathname === '/shop',
    },
    {
      name: 'Offers & Flyers',
      href: '/shop/flyers',
      icon: Tag,
      active: pathname === '/shop/flyers',
    },
    {
      name: 'Branches & Outlets',
      href: '/shop/branches',
      icon: Building2,
      active: pathname === '/shop/branches',
    },
    {
      name: 'Account Settings',
      href: '/shop/settings',
      icon: Settings,
      active: pathname === '/shop/settings',
    },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#10B981] font-extrabold tracking-wider uppercase">Loading Partner Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      {/* Main framing container */}
      <div className="bg-white w-full max-w-7xl rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row min-h-[88vh]">
        
        {/* Left Sidebar (Desktop fixed 230px) */}
        <aside className="hidden lg:flex flex-col w-[230px] bg-white border-r border-slate-100 shrink-0 p-6 justify-between">
          <div className="space-y-6">
            {/* Branding Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-md shadow-[#10B981]/20 shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-[#1F2937] text-base tracking-tight leading-none">D4D Partner</h1>
                <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest mt-1 block">STORE MANAGER</span>
              </div>
            </div>

            {/* Sidebar Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            {/* Nav Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 text-xs font-bold transition-all rounded-xl relative ${
                      item.active
                        ? 'bg-emerald-50 text-[#10B981] font-black'
                        : 'text-slate-500 hover:text-[#1F2937] hover:bg-slate-50'
                    }`}
                  >
                    {item.active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#10B981] rounded-r-full"></span>
                    )}
                    <Icon className={`w-4.5 h-4.5 ${item.active ? 'text-[#10B981]' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Controls */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => showToast('Support line: support@d4d.com', 'info')}
              className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-[#1F2937] w-full text-left rounded-xl hover:bg-slate-50 transition-all"
            >
              <HelpCircle className="w-4.5 h-4.5 text-slate-400" />
              <span>Support</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 w-full text-left rounded-xl transition-all"
            >
              <LogOut className="w-4.5 h-4.5 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden w-full flex flex-col">
          <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-sm text-[#1F2937]">Store Portal</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-[#1F2937] hover:bg-slate-50 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {isMobileMenuOpen && (
            <div className="bg-white border-b border-slate-100 px-4 py-4 space-y-2 absolute top-14 left-0 w-full z-50 shadow-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold ${
                      item.active ? 'bg-emerald-50 text-[#10B981]' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937]">{currentUser?.username}</span>
                <button onClick={handleLogout} className="text-xs text-red-500 font-bold">Logout</button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F7F8FA]">
          {/* Top Bar Header */}
          <header className="bg-white border-b border-slate-100/80 px-8 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937] flex items-center space-x-2">
                <span>Good Morning, {currentUser?.first_name || currentUser?.username || 'Partner'}!</span>
                <span className="text-lg">👋</span>
              </h2>
              <p className="text-[11px] text-[#9CA3AF] font-medium">Welcome to your store management console.</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search offers or branches..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F2937] flex items-center justify-center relative transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rounded-full"></span>
              </button>

              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#10B981]/10 text-[#10B981] font-black text-xs flex items-center justify-center border border-[#10B981]/20">
                  {currentUser?.username?.substring(0, 2).toUpperCase() || 'ST'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#1F2937] leading-tight">{currentUser?.username}</p>
                  <p className="text-[9px] text-[#9CA3AF] font-medium">Store Owner</p>
                </div>
              </div>
            </div>
          </header>

          {/* Body Content */}
          <main className="p-6 sm:p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
