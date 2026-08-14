'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export default function LoginPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const portsToTry = Array.from(
      new Set([
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
        'http://localhost:8001/api',
        'http://127.0.0.1:8001/api',
        'http://localhost:8000/api',
      ])
    );

    let lastError: unknown = null;
    let loginSuccess = false;

    for (const baseUrl of portsToTry) {
      try {
        const res = await axios.post(`${baseUrl}/auth/login/`, {
          username,
          password,
        });

        if (res.data && res.data.access) {
          localStorage.setItem('d4d_access_token', res.data.access);
          localStorage.setItem('d4d_refresh_token', res.data.refresh);
          if (res.data.user) {
            localStorage.setItem('d4d_user', JSON.stringify(res.data.user));
          }

          showToast(`Welcome back, ${username}!`, 'success');
          loginSuccess = true;
          router.push('/');
          break;
        }
      } catch (err: unknown) {
        lastError = err;
      }
    }

    if (!loginSuccess) {
      setIsLoading(false);
      if (axios.isAxiosError(lastError) && lastError.response?.data) {
        const data = lastError.response.data;
        if (data.detail) {
          setErrorMsg(data.detail);
        } else {
          setErrorMsg('Invalid username or password.');
        }
      } else {
        setErrorMsg('Invalid username or password.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to save offers, follow stores, and manage lists</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-sky-600" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-sky-600 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
