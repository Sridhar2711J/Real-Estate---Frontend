'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  Home as HomeIcon,
  Building,
  Briefcase,
  Building2,
  Search as SearchIcon
} from 'lucide-react';

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<'sale' | 'rent'>('sale');
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Houses');
  const [cityFilter, setCityFilter] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (query) {
      params.set('searchQuery', query);
    }
    if (cityFilter) {
      params.set('city', cityFilter);
    }
    if (selectedType) {
      const typeMap: Record<string, string> = {
        Houses: 'house',
        Apartment: 'apartment',
        Office: 'commercial',
        Villa: 'villa'
      };
      if (typeMap[selectedType]) {
        params.set('propertyType', typeMap[selectedType]);
      }
    }

    router.push(`/properties?${params.toString()}`);
  };

  const handleCategoryClick = (catName: string) => {
    setSelectedType(catName);
    const typeMap: Record<string, string> = {
      Houses: 'house',
      Apartment: 'apartment',
      Office: 'commercial',
      Villa: 'villa'
    };
    router.push(`/properties?propertyType=${typeMap[catName] || 'apartment'}`);
  };

  return (
    <div className="w-full max-w-xl">
      {/* Top Mini Tabs: For Sale (active with black underline) / For Rent */}
      <div className="flex items-center gap-6 mb-3 px-1 text-xs sm:text-sm font-bold text-slate-800">
        <button
          type="button"
          onClick={() => setTab('sale')}
          className={`pb-1 transition-all ${
            tab === 'sale'
              ? 'text-[#111827] border-b-2 border-[#111827]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          For Sale
        </button>

        <button
          type="button"
          onClick={() => setTab('rent')}
          className={`pb-1 transition-all ${
            tab === 'rent'
              ? 'text-[#111827] border-b-2 border-[#111827]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          For Rent
        </button>
      </div>

      {/* Main Search Input Pill Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="bg-white rounded-xl p-2 pl-4 sm:pl-5 shadow-md shadow-slate-900/5 border border-slate-200/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Text Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter an address, neighborhoods, city or zip code"
            className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none py-2"
          />

          {/* Controls: Filter Icon + Coral Search Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Coral Search Button matching Humero */}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-[#e76f51]/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <SearchIcon className="w-4 h-4 sm:hidden" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Category Pills below Search Input matching image: Houses, Apartment, Office, Villa */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs font-semibold text-slate-700 px-1">
        <button
          type="button"
          onClick={() => handleCategoryClick('Houses')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors ${
            selectedType === 'Houses' ? 'text-[#111827] font-bold' : ''
          }`}
        >
          <HomeIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Houses</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategoryClick('Apartment')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors ${
            selectedType === 'Apartment' ? 'text-[#111827] font-bold' : ''
          }`}
        >
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>Apartment</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategoryClick('Office')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors ${
            selectedType === 'Office' ? 'text-[#111827] font-bold' : ''
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>Office</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategoryClick('Villa')}
          className={`flex items-center gap-1.5 hover:text-slate-950 transition-colors ${
            selectedType === 'Villa' ? 'text-[#111827] font-bold' : ''
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Villa</span>
        </button>
      </div>
    </div>
  );
}
