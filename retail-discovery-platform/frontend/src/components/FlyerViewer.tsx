'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Tag, X, Sparkles, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FlyerItem {
  id: number;
  name: string;
  offer_price: number | null;
  mrp: number | null;
  deal_text?: string;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
}

interface FlyerMeta {
  id: number;
  title: string;
  store_name: string;
  image_url: string;
  image_width: number;
  image_height: number;
}

interface FlyerViewerProps {
  flyerId: number | string;
  debugBoxes?: boolean;
}

export function FlyerViewer({ flyerId, debugBoxes = false }: FlyerViewerProps) {
  const [flyer, setFlyer] = useState<FlyerMeta | null>(null);
  const [items, setItems] = useState<FlyerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FlyerItem | null>(null);
  const [isDebugEnabled, setIsDebugEnabled] = useState(debugBoxes);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const fetchData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('d4d_access_token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [metaRes, itemsRes] = await Promise.all([
        axios.get(`${API_BASE}/v1/flyers/${flyerId}`, { headers }),
        axios.get(`${API_BASE}/v1/flyers/${flyerId}/items`, { headers }),
      ]);

      setFlyer(metaRes.data);
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
    } catch (err) {
      console.error('Failed to load flyer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [flyerId]);

  // Update rendered dimensions using ResizeObserver
  useEffect(() => {
    if (!imageRef.current) return;

    const updateDimensions = () => {
      if (imageRef.current) {
        setDimensions({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => updateDimensions());
    resizeObserver.observe(imageRef.current);

    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [flyer, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#10B981] mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Loading Interactive Flyer...</p>
        </div>
      </div>
    );
  }

  if (!flyer) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="font-bold text-sm">Flyer not found or unavailable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dev Mode Debug Controls */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm text-xs">
        <div>
          <h3 className="font-extrabold text-[#1F2937] text-sm">{flyer.title}</h3>
          <p className="text-[10px] text-slate-400 font-semibold">{flyer.store_name} • {items.length} Interactive Deal Items</p>
        </div>
        <button
          type="button"
          onClick={() => setIsDebugEnabled(!isDebugEnabled)}
          className={`px-3 py-1.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
            isDebugEnabled
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{isDebugEnabled ? 'Debug Mode: ON' : 'Debug Boxes'}</span>
        </button>
      </div>

      {/* Main Image Viewer Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl mx-auto rounded-[24px] overflow-hidden bg-slate-900 border border-slate-200 shadow-xl select-none"
      >
        <img
          ref={imageRef}
          src={flyer.image_url}
          alt={flyer.title}
          onLoad={() => {
            if (imageRef.current) {
              setDimensions({
                width: imageRef.current.clientWidth,
                height: imageRef.current.clientHeight,
              });
            }
          }}
          className="w-full h-auto block object-contain"
        />

        {/* Absolute Bounding Box Hotspot Overlays */}
        {dimensions.width > 0 &&
          dimensions.height > 0 &&
          items.map((item) => {
            const left = item.bbox_x * dimensions.width;
            const top = item.bbox_y * dimensions.height;
            const width = item.bbox_w * dimensions.width;
            const height = item.bbox_h * dimensions.height;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                className={`absolute cursor-pointer transition-all duration-200 group ${
                  isDebugEnabled
                    ? 'border-2 border-emerald-400 bg-emerald-400/20'
                    : 'border border-transparent hover:border-[#10B981] hover:bg-[#10B981]/25 hover:shadow-lg hover:shadow-[#10B981]/20'
                }`}
                title={`${item.name} - ${item.offer_price ? `$${item.offer_price}` : 'Offer'}`}
              >
                {/* Debug Label */}
                {isDebugEnabled && (
                  <span className="absolute -top-5 left-0 bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                    {item.name} (${item.offer_price ?? 'N/A'})
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* Product Detail Modal (Headless Modal Component showing ONLY Product Name & Offer Price) */}
      {selectedItem && (
        <div className="fixed inset-0 bg-[#0f0e26]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-[#1F2937] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[#10B981]">
              <Tag className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Product Deal</span>
            </div>

            <div className="space-y-2 pt-1">
              <h3 className="font-black text-lg text-[#1F2937] leading-tight">{selectedItem.name}</h3>
              
              <div className="pt-2 flex items-baseline space-x-2">
                <span className="text-xs font-bold text-slate-400">Offer Price:</span>
                <span className="text-2xl font-black text-[#10B981]">
                  {selectedItem.offer_price !== null ? `₹${selectedItem.offer_price}` : 'Deal Offer'}
                </span>
                {selectedItem.mrp && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    ₹{selectedItem.mrp}
                  </span>
                )}
              </div>

              {selectedItem.deal_text && (
                <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold inline-block mt-2">
                  {selectedItem.deal_text}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold py-3 rounded-full text-xs uppercase tracking-wider shadow-md shadow-[#10B981]/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
