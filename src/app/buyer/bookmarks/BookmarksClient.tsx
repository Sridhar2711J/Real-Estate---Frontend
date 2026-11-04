'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import { Property } from '@/types';
import PropertyCard from '@/components/property/PropertyCard';
import {
  Heart,
  Trash2,
  ArrowUpDown,
  Compass,
} from 'lucide-react';

export default function BookmarksClient() {
  const { savedPropertyIds, toggleSaveProperty, bookmarks, bookmarkCount } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  useEffect(() => {
    let isMounted = true;
    async function loadProperties() {
      try {
        const res = await propertyService.getProperties({ all: true });
        if (isMounted && res && res.success && Array.isArray(res.properties)) {
          setProperties(res.properties);
        }
      } catch (err) {
        console.error('Failed to load bookmarks properties:', err);
      }
    }
    loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  // Combine properties from AuthContext bookmarks and fetched properties
  const contextProperties = Array.isArray(bookmarks)
    ? (bookmarks.map((b: any) => b.property).filter(Boolean) as Property[])
    : [];
  const propertyMap = new Map<string, Property>();
  contextProperties.forEach((p) => propertyMap.set(p.id, p));
  (Array.isArray(properties) ? properties : []).forEach((p) => propertyMap.set(p.id, p));
  const safeProperties = Array.from(propertyMap.values());
  const safeSavedIds = Array.isArray(savedPropertyIds) ? savedPropertyIds : [];

  // Filter properties matching savedPropertyIds
  const savedProperties = safeProperties.filter((prop) => safeSavedIds.includes(prop.id));

  // Filter by property type
  const filteredProperties = savedProperties.filter((prop) => {
    if (selectedType === 'all') return true;
    return prop.propertyType.toLowerCase() === selectedType.toLowerCase();
  });

  // Sort
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all saved properties from your bookmarks?')) {
      savedPropertyIds.forEach((id) => toggleSaveProperty(id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-rose-50 text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bookmark
            </h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-rose-50 text-rose-600 border border-rose-200/60">
              {savedProperties.length} Saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Properties and residences you have bookmarked for comparison and quick access.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {savedProperties.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}

          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Compass className="w-4 h-4" />
            Explore More
          </Link>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      {savedProperties.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Property Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: 'All Types', value: 'all' },
              { label: 'Apartments', value: 'apartment' },
              { label: 'Villas', value: 'villa' },
              { label: 'Houses', value: 'house' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === tab.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'price-asc' | 'price-desc')}
              className="h-10 px-3.5 text-sm font-medium bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {sortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-lg bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">No bookmarked properties yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Keep track of homes, modern apartments, and villas you like by clicking the bookmark heart button on any listing!
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Compass className="w-4 h-4" />
            Discover Properties to Bookmark
          </Link>
        </div>
      )}
    </div>
  );
}

