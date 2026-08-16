'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Tag,
  Users,
  Megaphone,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useToastStore((state) => state.showToast);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const token = localStorage.getItem('d4d_access_token');
    const userStr = localStorage.getItem('d4d_user');
    const savedTheme = localStorage.getItem('d4d_admin_theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      setThemeMode(savedTheme);
    }

    if (!token || !userStr) {
      showToast('Authentication required. Please log in.', 'error');
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.user_type !== 'admin' && !user.is_staff && !user.is_superuser) {
        showToast('Unauthorized access. Admin privileges required.', 'error');
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      setIsLoaded(true);
    } catch (e) {
      localStorage.removeItem('d4d_access_token');
      localStorage.removeItem('d4d_user');
      router.push('/login');
    }
  }, [router]);

  const toggleTheme = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    localStorage.setItem('d4d_admin_theme', mode);
  };

  const handleLogout = () => {
    localStorage.removeItem('d4d_access_token');
    localStorage.removeItem('d4d_refresh_token');
    localStorage.removeItem('d4d_user');
    showToast('Logged out of Admin Portal.', 'info');
    router.push('/');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      name: 'Shops Directory',
      href: '/admin/shops',
      icon: Building2,
      active: pathname === '/admin/shops',
    },
    {
      name: 'Manage Categories',
      href: '/admin/categories',
      icon: Tag,
      active: pathname === '/admin/categories',
    },
    {
      name: 'User Moderation',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
    },
    {
      name: 'Announcements',
      href: '/admin/announcements',
      icon: Megaphone,
      active: pathname === '/admin/announcements',
    },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#E8E2F7] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#7B61FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#7B61FF] font-extrabold tracking-wider uppercase">Verifying Authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={themeMode === 'dark' ? 'dark' : ''}>
      <div className="bg-[#E8E2F7] dark:bg-[#0B0A1C] min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans transition-colors duration-300">
        {/* Outer framing card container */}
        <div className="bg-white dark:bg-[#181636] w-full max-w-7xl rounded-[32px] shadow-[0_20px_50px_rgba(123,97,255,0.08)] overflow-hidden flex flex-col lg:flex-row min-h-[85vh] md:min-h-[90vh] border border-white dark:border-[#242147] transition-colors duration-300">
          
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#14122E] border-r border-slate-100 dark:border-[#242147] shrink-0 p-6 justify-between transition-colors duration-300">
            <div className="space-y-8">
              {/* Branding Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-[#7B61FF] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-md shadow-[#7B61FF]/20 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-extrabold text-[#1A1A1A] dark:text-white text-base tracking-tight leading-none">D4D Hub</h1>
                  <span className="text-[9px] font-black text-[#7B61FF] uppercase tracking-widest mt-1 block">ADMIN CONSOLE</span>
                </div>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-5 py-3.5 transition-all text-xs font-bold ${
                        item.active
                          ? 'bg-[#7B61FF] text-white shadow-lg shadow-[#7B61FF]/20 rounded-full'
                          : 'text-[#8A8A8A] dark:text-slate-400 hover:text-[#1A1A1A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#201D47] rounded-full'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${item.active ? 'text-white' : 'text-[#8A8A8A] dark:text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer (User details + Mode Toggle) */}
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-[#242147]">
              {/* User Profile Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-[#201D47] text-[#7B61FF] flex items-center justify-center text-xs font-black shrink-0 border border-purple-200 dark:border-[#38336D]">
                    {currentUser?.username?.substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-[#1A1A1A] dark:text-white truncate leading-tight">{currentUser?.username || 'admin'}</p>
                    <p className="text-[9px] text-[#8A8A8A] dark:text-slate-400 font-medium mt-0.5">Doha, QA</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Mode Toggle Pill */}
              <div className="bg-slate-100 dark:bg-[#201D47] p-1 rounded-full flex items-center space-x-1 w-full justify-between border border-slate-200/50 dark:border-[#2E2A5F]">
                <button
                  onClick={() => toggleTheme('light')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    themeMode === 'light'
                      ? 'bg-white text-[#1A1A1A] shadow-sm'
                      : 'text-[#8A8A8A] dark:text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-full text-[10px] font-black transition-all ${
                    themeMode === 'dark'
                      ? 'bg-[#7B61FF] text-white shadow-sm'
                      : 'text-[#8A8A8A] dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Header / Drawer */}
          <div className="lg:hidden w-full flex flex-col min-h-screen">
            <header className="bg-white dark:bg-[#14122E] border-b border-slate-100 dark:border-[#242147] px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#7B61FF] to-[#8B5CF6] rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-[#1A1A1A] dark:text-white">D4D Admin</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-[#1A1A1A] dark:text-white hover:bg-slate-50 dark:hover:bg-[#201D47] rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </header>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
              <div className="bg-white dark:bg-[#14122E] border-b border-slate-100 dark:border-[#242147] px-4 py-4 space-y-3 absolute top-14 left-0 w-full z-50 shadow-xl">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-full text-xs font-bold transition-all ${
                        item.active
                          ? 'bg-[#7B61FF] text-white'
                          : 'text-[#8A8A8A] dark:text-slate-400 hover:text-[#1A1A1A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#201D47]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <div className="h-px bg-slate-100 dark:bg-[#242147] my-2"></div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-[#201D47] text-[#7B61FF] flex items-center justify-center text-xs font-bold">
                      {currentUser?.username?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">{currentUser?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 text-xs text-red-500 font-extrabold px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 transition-all"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Area (Mobile) */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0F0E26] p-4 transition-colors duration-300">
              {children}
            </main>
          </div>

          {/* Main Content Area (Desktop) */}
          <main className="hidden lg:block flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0F0E26] p-8 max-h-screen transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
