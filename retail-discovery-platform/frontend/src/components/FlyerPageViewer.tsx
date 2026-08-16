'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  ExternalLink,
  Share2,
  Info,
  X,
  Loader2,
  Home,
  Tag,
  Grid,
  MapPin,
  Navigation,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  location_url?: string;
  phone?: string;
}

interface FlyerItem {
  id: number;
  name: string;
  mrp: number | null;
  offer_price: number | null;
  deal_text?: string;
  row_index: number;
  col_index: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  available_branches?: Branch[];
}

interface FlyerMeta {
  id: number;
  title: string;
  store_name: string;
  store_logo_url?: string;
  category: string;
  cover_image_url: string;
  page_count: number;
  valid_from: string;
  valid_to: string;
  days_left: number;
}

interface FlyerPageData {
  id: number;
  flyer_id: number;
  page_number: number;
  image_url: string;
  image_width: number;
  image_height: number;
  flyer_items: FlyerItem[];
}

interface FlyerPageViewerProps {
  flyerId: number | string;
  initialPage?: number;
  debugGrid?: boolean;
}

export function FlyerPageViewer({ flyerId, initialPage = 1, debugGrid = false }: FlyerPageViewerProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDebugGrid, setIsDebugGrid] = useState(debugGrid);

  const [meta, setMeta] = useState<FlyerMeta | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState<number>(initialPage);
  const [pageData, setPageData] = useState<FlyerPageData | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [selectedItem, setSelectedItem] = useState<FlyerItem | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const [renderedDims, setRenderedDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axios.get(`${API_BASE}/v1/flyers/${flyerId}`);
        setMeta(res.data);
      } catch (err) {
        console.error('Failed to load flyer metadata:', err);
      }
    };
    fetchMeta();
  }, [flyerId]);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoadingPage(true);
      setSelectedItem(null);
      try {
        const res = await axios.get(`${API_BASE}/v1/flyers/${flyerId}/pages/${currentPageNum}`);
        setPageData(res.data);
      } catch {
        setPageData(null);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchPage();
  }, [flyerId, currentPageNum]);

  useEffect(() => {
    if (!imageRef.current) return;

    const updateDims = () => {
      if (imageRef.current) {
        setRenderedDims({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    };

    updateDims();

    const observer = new ResizeObserver(() => updateDims());
    observer.observe(imageRef.current);

    window.addEventListener('resize', updateDims);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDims);
    };
  }, [pageData, isLoadingPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalPages = meta?.page_count || 1;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${
        isDarkMode ? 'bg-[#0b0c10] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header Bar */}
      <header
        className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md ${
          isDarkMode ? 'bg-[#12141c]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className={`p-2 rounded-xl flex items-center space-x-1.5 text-xs font-extrabold transition-all ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Home className="w-4 h-4 text-[#10B981]" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="relative max-w-xs hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search offer items..."
              className={`pl-9 pr-3 py-1.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981] ${
                isDarkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-200' : 'bg-slate-100 border border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        <div className="text-center truncate max-w-sm">
          <h2 className="font-extrabold text-sm truncate">{meta?.title || 'Promotional Flyer'}</h2>
          <span className="text-[10px] text-emerald-500 font-bold block">{meta?.store_name || 'Retail Outlet'}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsDebugGrid(!isDebugGrid)}
            className={`p-2 rounded-xl text-xs font-extrabold flex items-center space-x-1 ${
              isDebugGrid ? 'bg-amber-500 text-slate-900 font-black' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}
            title="Toggle QA Grid Overlay"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-all ${
              isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(`Visiting ${meta?.store_name || 'Store'} Online Shop...`);
            }}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-sm flex items-center space-x-1 uppercase tracking-wider"
          >
            <span className="hidden sm:inline">Shop Online</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          {meta?.store_logo_url && (
            <img src={meta.store_logo_url} alt={meta.store_name} className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" />
          )}
        </div>
      </header>

      {/* Main Reader Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative max-w-5xl mx-auto w-full">
        {isLoadingPage ? (
          <div className="py-32 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#10B981] mx-auto" />
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Loading Flyer Page {currentPageNum}...</p>
          </div>
        ) : (
          <div className="relative max-w-3xl flex flex-col items-center">
            <div className="relative inline-block rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
              <img
                ref={imageRef}
                src={pageData?.image_url || meta?.cover_image_url}
                alt={`Page ${currentPageNum}`}
                onLoad={() => {
                  if (imageRef.current) {
                    setRenderedDims({
                      width: imageRef.current.clientWidth,
                      height: imageRef.current.clientHeight,
                    });
                  }
                }}
                className="w-full h-auto block object-contain max-h-[85vh]"
              />

              {/* GRID-ALIGNED INTERACTIVE OVERLAYS */}
              {renderedDims.width > 0 &&
                renderedDims.height > 0 &&
                pageData?.flyer_items?.map((item) => {
                  const left = item.bbox_x * renderedDims.width;
                  const top = item.bbox_y * renderedDims.height;
                  const width = item.bbox_w * renderedDims.width;
                  const height = item.bbox_h * renderedDims.height;

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
                      className={`absolute cursor-pointer transition-all duration-75 group ${
                        isDebugGrid
                          ? 'border-2 border-dashed border-amber-400 bg-amber-400/20'
                          : 'border-2 border-transparent hover:border-dashed hover:border-[#10B981] hover:bg-[#10B981]/15 hover:shadow-lg'
                      }`}
                    >
                      {isDebugGrid && (
                        <span className="absolute top-0 left-0 bg-amber-500 text-slate-900 font-black text-[9px] px-1 rounded shadow">
                          R{item.row_index}:C{item.col_index}
                        </span>
                      )}
                    </div>
                  );
                })}

              {/* Navigation Chevrons */}
              <button
                disabled={currentPageNum <= 1}
                onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full disabled:opacity-20 backdrop-blur-md transition-all shadow-xl"
                title="Previous Page"
              >
                <ChevronLeft className="w-6 h-6 stroke-[3]" />
              </button>

              <button
                disabled={currentPageNum >= totalPages}
                onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full disabled:opacity-20 backdrop-blur-md transition-all shadow-xl"
                title="Next Page"
              >
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md text-white font-extrabold text-xs px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                Page {currentPageNum} / Total {totalPages} Pages
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ITEM OFFER & BRANCHES MODAL */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-2xl border transition-all animate-in fade-in zoom-in-95 ${
              isDarkMode ? 'bg-[#181a24] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#10B981]">
                <Tag className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Product Offer</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-lg leading-tight">{selectedItem.name}</h3>

              <div className="pt-2 flex items-baseline space-x-2">
                <span className="text-xs font-bold text-slate-400">
                  {selectedItem.offer_price !== null ? 'Offer Price:' : 'MRP:'}
                </span>
                <span className="text-3xl font-black text-[#10B981]">
                  {selectedItem.offer_price !== null
                    ? `₹${selectedItem.offer_price}`
                    : selectedItem.mrp !== null
                    ? `₹${selectedItem.mrp}`
                    : 'Special Deal'}
                </span>
                {selectedItem.offer_price !== null && selectedItem.mrp !== null && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    ₹{selectedItem.mrp}
                  </span>
                )}
              </div>

              {selectedItem.deal_text && (
                <p className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-bold inline-block mt-2">
                  {selectedItem.deal_text}
                </p>
              )}
            </div>

            {/* Available Store Branches & Locations */}
            <div className="pt-3 border-t border-slate-700/50 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Available at Store Outlets ({selectedItem.available_branches?.length || 0})</span>
              </span>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {selectedItem.available_branches && selectedItem.available_branches.length > 0 ? (
                  selectedItem.available_branches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs">{branch.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{branch.address}</p>
                      </div>
                      {branch.location_url && (
                        <a
                          href={branch.location_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] font-bold text-[10px] px-2.5 py-1 rounded-lg shrink-0 flex items-center space-x-1"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Map</span>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Available across all participating store outlets.</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold py-3 rounded-full text-xs uppercase tracking-wider shadow-md shadow-[#10B981]/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
