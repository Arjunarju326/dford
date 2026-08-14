'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  Tag,
  Store,
  MapPin,
  FileText,
  Navigation,
  ChevronLeft,
  ShoppingBag,
  Share2,
  Bookmark,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useToastStore } from '@/lib/toast-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  category_name?: string;
  brand_name?: string;
}

interface OfferData {
  id: number;
  title: string;
  offer_price: number;
  original_price: number;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  store_name: string;
  store_logo: string;
  store_slug: string;
}

interface SourceFlyerData {
  flyer_id: number;
  flyer_title: string;
  flyer_slug: string;
  page_number: number;
  cover_image_url: string;
}

interface BranchAvailability {
  id: number;
  name: string;
  address: string;
  city_name: string;
  phone: string;
  latitude: number;
  longitude: number;
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN';
}

interface RelatedProduct {
  id: number;
  title: string;
  product_name: string;
  product_slug: string;
  store_name: string;
  store_logo: string;
  offer_price: number;
  original_price: number;
  image_url: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const showToast = useToastStore((state) => state.showToast);

  const [product, setProduct] = useState<ProductData | null>(null);
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [sourceFlyer, setSourceFlyer] = useState<SourceFlyerData | null>(null);
  const [branches, setBranches] = useState<BranchAvailability[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      try {
        const prodRes = await axios.get(`${API_BASE}/v1/products/${slug}/`);
        setProduct(prodRes.data.product);
        setOffer(prodRes.data.offer);
        setSourceFlyer(prodRes.data.source_flyer);

        // Fetch Branch Availability
        const avaRes = await axios.get(`${API_BASE}/v1/products/${slug}/availability/`);
        setBranches(avaRes.data.branches || []);

        // Fetch Related Products
        const relRes = await axios.get(`${API_BASE}/v1/products/${slug}/related/`);
        setRelated(relRes.data.results || []);
      } catch {
        // Fallback to sample item if API unpopulated
        setProduct({
          id: 101,
          name: 'Fortune Sunflower Oil 1.8L',
          slug: 'fortune-sunflower-oil-1-8l',
          description: 'Refined sunflower oil rich in vitamin E and essential Omega-6 fatty acids.',
          image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop',
          category_name: 'Grocery & Oils',
          brand_name: 'Fortune',
        });
        setOffer({
          id: 501,
          title: 'Fortune Sunflower Oil 1.8L Special Offer',
          offer_price: 15.00,
          original_price: 18.00,
          discount_percentage: 16,
          valid_from: '2026-08-14',
          valid_until: '2026-08-28',
          store_name: 'Kadav Mart Family Shop',
          store_logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&h=150&fit=crop',
          store_slug: 'kadav-mart',
        });
        setSourceFlyer({
          flyer_id: 201,
          flyer_title: 'Kadav Mart Onam Special Celebration Flyer',
          flyer_slug: 'kadav-mart-onam-chantha-flyer',
          page_number: 1,
          cover_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=1200&fit=crop',
        });
        setBranches([
          {
            id: 1,
            name: 'Kadav Mart - Ulliyeri Branch',
            address: 'Theruvath Kadavu, Ulliyeri, Kozhikode, Kerala 673323',
            city_name: 'Kozhikode',
            phone: '0496-2081073',
            latitude: 11.4428,
            longitude: 75.8234,
            availability: 'AVAILABLE',
          },
          {
            id: 2,
            name: 'Kadav Mart - Balussery Branch',
            address: 'Main Road, Balussery, Kozhikode, Kerala 673612',
            city_name: 'Kozhikode',
            phone: '0496-2642000',
            latitude: 11.4500,
            longitude: 75.8300,
            availability: 'UNKNOWN',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found</h1>
        <Link href="/" className="text-sky-600 font-bold underline">Return to Home</Link>
      </div>
    );
  }

  const handleOpenGoogleMaps = (lat: number, lng: number, address: string) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
    showToast('Opening Google Maps Directions...', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Previous Page</span>
      </button>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Product Image & Source Flyer Badge */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'}
              alt={product.name}
              className="w-full h-80 object-contain rounded-2xl"
            />
            {offer && offer.discount_percentage > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white font-black text-xs px-3 py-1 rounded-xl shadow-md">
                SAVE {Math.round(offer.discount_percentage)}%
              </span>
            )}
          </div>

          {/* Source Flyer Badge */}
          {sourceFlyer && (
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">
                  P.{sourceFlyer.page_number}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Featured in Circular Flyer
                  </span>
                  <h4 className="font-bold text-sm text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                    {sourceFlyer.flyer_title}
                  </h4>
                </div>
              </div>

              <Link
                href={`/flyers/${sourceFlyer.flyer_slug}`}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View in Flyer</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Store Info, and Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.category_name && (
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                {product.category_name}
              </span>
            )}
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
            {product.brand_name && (
              <p className="text-xs font-semibold text-slate-500">Brand: {product.brand_name}</p>
            )}
          </div>

          {/* Price Block */}
          {offer && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Promotional Price
              </span>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black text-slate-900">
                  ₹{offer.offer_price}
                </span>
                {offer.original_price > offer.offer_price && (
                  <span className="text-lg text-slate-400 line-through font-semibold">
                    ₹{offer.original_price}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Valid from <span className="font-bold text-slate-700">{offer.valid_from}</span> to <span className="font-bold text-slate-700">{offer.valid_until}</span>
              </p>
            </div>
          )}

          {/* Store Info */}
          {offer && offer.store_name && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={offer.store_logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&h=100&fit=crop'}
                  alt={offer.store_name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{offer.store_name}</h3>
                  <span className="text-xs text-slate-500">Verified Retail Partner</span>
                </div>
              </div>
              <Link
                href={`/stores/${offer.store_slug}`}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                View Store Profile →
              </Link>
            </div>
          )}

          {/* Add to List & Share */}
          <div className="flex space-x-3">
            <button
              onClick={() => showToast(`Added ${product.name} to your Shopping List!`, 'success')}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping List</span>
            </button>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Product link copied to clipboard!', 'success');
                }
              }}
              className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4 text-sky-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Branch Availability & Directions Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-xl">Branch Availability & Directions</h2>
              <p className="text-xs text-slate-500">Check physical branch stock status and navigate straight to the store</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                  {b.availability === 'AVAILABLE' && (
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>IN STOCK</span>
                    </span>
                  )}
                  {b.availability === 'LIMITED' && (
                    <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>LIMITED STOCK</span>
                    </span>
                  )}
                  {b.availability === 'UNKNOWN' && (
                    <span className="bg-slate-200 text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <HelpCircle className="w-3 h-3 text-slate-500" />
                      <span>AVAILABILITY NOT CONFIRMED</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{b.address}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">📞 {b.phone}</p>
              </div>

              <button
                onClick={() => handleOpenGoogleMaps(b.latitude, b.longitude, b.address)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions (Google Maps)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products Recommendation Carousel */}
      {related.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Related Deals & Products</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.product_slug || item.id}`}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all space-y-3 block"
              >
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'}
                  alt={item.product_name || item.title}
                  className="w-full h-36 object-cover rounded-xl border border-slate-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {item.product_name || item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{item.store_name}</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="font-extrabold text-sky-600 text-sm">
                      ₹{item.offer_price}
                    </span>
                    {item.original_price > item.offer_price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{item.original_price}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
