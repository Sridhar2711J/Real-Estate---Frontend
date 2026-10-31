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

      {/* Main Search Input Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="bg-white rounded-lg p-1.5 pl-4 sm:pl-5 shadow-md shadow-slate-900/5 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 focus-within:border-[#e76f51] focus-within:ring-2 focus-within:ring-[#e76f51]/20 transition-all">
          {/* Text Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter an address, neighborhood, city or zip code"
            className="seamless-input flex-1 h-10 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-transparent px-1 border-none outline-none shadow-none"
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: 'transparent',
            }}
          />

          {/* Controls: Coral Search Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              type="submit"
              className="h-10 px-6 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
