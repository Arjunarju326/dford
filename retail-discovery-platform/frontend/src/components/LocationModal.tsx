'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';
import { useLocationStore } from '@/lib/location-store';
import { POPULAR_CITIES } from '@/lib/api-locations';

export function LocationModal() {
  const { city, isModalOpen, closeModal, setLocation } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  if (!isModalOpen) return null;

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.state_name && c.state_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocation('Kochi', 'Nearby Branch', pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve GPS location. Please pick your city manually.');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Your Location</h3>
              <p className="text-xs text-slate-500">Offers and flyers will be filtered for your area</p>
            </div>
          </div>

          <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Auto Detect Button & Search */}
        <div className="p-4 space-y-3 bg-slate-50 border-b border-slate-100">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS Coordinates...' : 'Use My Current Location (GPS)'}</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city or region..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Cities List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Popular Cities</span>
          <div className="grid grid-cols-2 gap-2">
            {filteredCities.map((c) => {
              const isSelected = city.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setLocation(c.name, c.state_name)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-sm block leading-tight">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.state_name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
