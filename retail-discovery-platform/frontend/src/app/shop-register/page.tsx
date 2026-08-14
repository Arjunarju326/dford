'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToastStore } from '@/lib/toast-store';
import { Store, Building2, MapPin, Phone, Globe, Mail, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export default function ShopRegistrationPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    owner_name: '',
    email: '',
    phone: '',
    description: '',
    logo_url: '',
    banner_url: '',
    website: '',
    address: '',
    city_name: '',
    postal_code: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('d4d_access_token');
    if (!token) {
      showToast('Please log in before registering a shop.', 'error');
      router.push('/login');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/v1/shop-registration/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLoading(false);
      setIsSuccess(true);
      showToast('Shop registration submitted for Admin approval!', 'success');
    } catch (err: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(err) && err.response?.data) {
        showToast('Registration error: ' + JSON.stringify(err.response.data), 'error');
      } else {
        showToast('Network error. Is the backend server running?', 'error');
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Application Submitted!</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your shop registration for <span className="font-bold text-slate-900">{formData.name}</span> is currently <span className="font-bold text-amber-600">PENDING_APPROVAL</span> by Platform Admin.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-left space-y-2">
          <p className="font-bold text-slate-700">What happens next?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Platform Admin reviews your shop profile and legal details.</li>
            <li>Once APPROVED, your shop status becomes active.</li>
            <li>You can then add branches and upload circular flyers.</li>
          </ul>
        </div>
        <Link
          href="/shop/dashboard"
          className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm"
        >
          Go to Shop Owner Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Register Retail Shop</h1>
        <p className="text-xs text-slate-500">Become an official partner store on D4D Retail Discovery Platform</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shop Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. FreshMart Hypermarket"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Legal Company Name</label>
            <input
              type="text"
              name="legal_name"
              value={formData.legal_name}
              onChange={handleChange}
              placeholder="e.g. FreshMart Retail Trading LLC"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner Name *</label>
            <input
              type="text"
              name="owner_name"
              required
              value={formData.owner_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@freshmart.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Phone *</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+974 4455 6677"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Website URL</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://freshmart.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Logo Image URL</label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shop Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell shoppers about your store offerings, organic produce, and weekly discounts..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Headquarters Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Main Street, West Bay"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
            <input
              type="text"
              name="city_name"
              value={formData.city_name}
              onChange={handleChange}
              placeholder="Doha"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <span>Submit Shop for Admin Approval</span>
          )}
        </button>
      </form>
    </div>
  );
}
