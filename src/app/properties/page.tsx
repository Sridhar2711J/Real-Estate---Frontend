'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  Check,
} from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 6;

const POPULAR_CITIES = [
  'Pune',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Delhi NCR',
  'Goa',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Chandigarh',
  'Kochi',
];

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { savedPropertyIds } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter parameters from URL searchParams
  const city = searchParams.get('city') || '';
  const listingType = searchParams.get('listingType') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('searchQuery') || '';
  const savedOnly = searchParams.get('savedOnly') === 'true';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  // City searcher & dropdown state
  const [citySearchInput, setCitySearchInput] = useState(city);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Local state for search & price inputs to allow fluid typing before syncing to URL
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Sync city search input when URL changes
  useEffect(() => {
    setCitySearchInput(city);
  }, [city]);

  // Close city dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync local inputs when URL parameters change externally
  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  // Helper to update search params in the URL
  const updateUrl = useCallback(
    (overrides: Record<string, string | number | boolean | null | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(overrides).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'all' && val !== false) {
          params.set(key, String(val));
        } else {
          params.delete(key);
        }
      });

      if (resetPage && !('page' in overrides)) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.push(queryString ? `/properties?${queryString}` : '/properties');
    },
    [router, searchParams]
  );

  // Debounce search input to URL (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearchInput !== searchQuery) {
        updateUrl({ searchQuery: localSearchInput.trim() || undefined });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearchInput, searchQuery, updateUrl]);

  // Debounce budget price inputs to URL (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localMinPrice !== minPrice || localMaxPrice !== maxPrice) {
        updateUrl({
          minPrice: localMinPrice.trim() || undefined,
          maxPrice: localMaxPrice.trim() || undefined,
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localMinPrice, localMaxPrice, minPrice, maxPrice, updateUrl]);

  // Fetch properties from backend based on URL searchParams and pagination
  useEffect(() => {
    let isMounted = true;
    async function fetchProperties() {
      setLoading(true);
      try {
        const queryParams: any = {
          all: true, // ensure all public active properties are returned across sellers
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (city && city !== 'all') queryParams.city = city;
        if (propertyType && propertyType !== 'all') queryParams.propertyType = propertyType;
        if (listingType) queryParams.listingType = listingType;
        if (bedrooms && bedrooms !== 'all') queryParams.bedrooms = bedrooms;
        if (minPrice) queryParams.minPrice = Number(minPrice);
        if (maxPrice) queryParams.maxPrice = Number(maxPrice);
        if (searchQuery) queryParams.searchQuery = searchQuery;
        if (sort) queryParams.sort = sort;

        if (savedOnly) {
          if (Array.isArray(savedPropertyIds) && savedPropertyIds.length > 0) {
            queryParams.ids = savedPropertyIds.join(',');
          } else {
            queryParams.ids = 'none'; // force 0 results
          }
        }

        const res = await propertyService.getProperties(queryParams);
        if (isMounted && res && res.success) {
          setProperties(Array.isArray(res.properties) ? res.properties : []);
          setTotalItems(typeof res.total === 'number' ? res.total : (res.properties?.length || 0));
          setTotalPages(typeof res.totalPages === 'number' ? res.totalPages : 1);
          if (Array.isArray(res.cities)) {
            setCities(res.cities);
          }
          if (Array.isArray(res.propertyTypes)) {
            setPropertyTypes(res.propertyTypes);
          }
        }
      } catch (err) {
        console.error('Failed to load filtered properties catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProperties();
    return () => {
      isMounted = false;
    };
  }, [
    city,
    propertyType,
    listingType,
    bedrooms,
    minPrice,
    maxPrice,
    searchQuery,
    sort,
    savedOnly,
    currentPage,
    savedPropertyIds,
  ]);

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    updateUrl({ page: targetPage > 1 ? String(targetPage) : undefined }, false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setLocalSearchInput('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setCitySearchInput('');
    router.push('/properties');
  };

  // Filtered available cities combining backend unique cities and popular cities
  const filteredCitiesList = useMemo(() => {
    const combined = Array.from(
      new Set([...(cities.length > 0 ? cities : []), ...POPULAR_CITIES])
    );
    const q = citySearchInput.trim().toLowerCase();
    if (!q) return combined;
    return combined.filter((c) => c.toLowerCase().includes(q));
  }, [cities, citySearchInput]);

  // Unique property types from backend (or fallback to defaults if loading)
  const displayPropertyTypes = useMemo(() => {
    if (propertyTypes.length > 0) {
      return propertyTypes;
    }
    return ['apartment', 'villa', 'house', 'commercial', 'plot'];
  }, [propertyTypes]);

  const activeFiltersCount = [
    city,
    listingType,
    propertyType,
    bedrooms,
    minPrice,
    maxPrice,
    searchQuery,
    savedOnly ? 'saved' : '',
  ].filter(Boolean).length;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + properties.length, totalItems);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Properties for Sale &amp; Rent</span>
            {city && (
              <>
                <span>/</span>
                <span className="text-[#e76f51] font-semibold">{city}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {savedOnly
              ? 'Saved Properties'
              : listingType === 'rent'
              ? city
                ? `Properties for Rent in ${city}`
                : 'Verified Properties for Rent'
              : listingType === 'sale'
              ? city
                ? `Properties for Sale in ${city}`
                : 'Verified Properties for Sale'
              : city
              ? `Properties for Sale and Rent in ${city}`
              : 'All Verified Residential & Commercial Listings'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} of {totalItems} verified{' '}
            {totalItems === 1 ? 'property' : 'properties'} available with direct contact.
          </p>
        </div>

        {/* Search keyword input and mobile filter trigger */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={localSearchInput}
              onChange={(e) => setLocalSearchInput(e.target.value)}
              placeholder="Search by locality, title..."
              className="w-full h-10 pl-10 pr-9 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {localSearchInput && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearchInput('');
                  updateUrl({ searchQuery: undefined });
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden h-10 flex items-center gap-1.5 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-md shadow-2xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filters + Right Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-1 bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs h-fit space-y-6`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-sm bg-slate-900 text-white text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* 1. Purpose (Sale vs Rent) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Listing Purpose
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-md">
              {[
                { label: 'All', value: '' },
                { label: 'Buy', value: 'sale' },
                { label: 'Rent', value: 'rent' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => updateUrl({ listingType: item.value })}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    listingType === item.value
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. City Filter (Searcher & Selected Option Based) */}
          <div className="relative" ref={cityDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                City
              </label>
              {city && (
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchInput('');
                    updateUrl({ city: undefined });
                  }}
                  className="text-[11px] text-[#e76f51] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Selected City Pill */}
            {city && (
              <div className="mb-2 p-1.5 px-2.5 rounded-md bg-orange-50 border border-orange-200 text-xs font-bold text-[#e76f51] flex items-center justify-between shadow-2xs">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{city}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchInput('');
                    updateUrl({ city: undefined });
                  }}
                  className="hover:bg-orange-200/60 p-0.5 rounded-full cursor-pointer text-[#e76f51] transition-colors"
                  title="Remove city filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* City Search Input */}
            <div className="relative">
              <input
                type="text"
                value={citySearchInput}
                onChange={(e) => {
                  setCitySearchInput(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Search or select city..."
                className="w-full h-9 pl-8 pr-8 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 font-medium transition-all"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {citySearchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchInput('');
                    if (city) updateUrl({ city: undefined });
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* City Autocomplete Dropdown */}
            {showCityDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                <div className="p-1 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                  <span>Available Cities</span>
                  <span>{filteredCitiesList.length}</span>
                </div>

                {/* Reset to All Cities */}
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchInput('');
                    setShowCityDropdown(false);
                    updateUrl({ city: undefined });
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-50 cursor-pointer ${
                    !city ? 'text-[#e76f51] bg-orange-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>All Cities (Reset)</span>
                  {!city && <Check className="w-3 h-3 text-[#e76f51]" />}
                </button>

                {filteredCitiesList.map((cName) => {
                  const isSelected = city.toLowerCase() === cName.toLowerCase();
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => {
                        setCitySearchInput(cName);
                        setShowCityDropdown(false);
                        updateUrl({ city: cName });
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-orange-50/70 transition-colors flex items-center justify-between border-b border-slate-50 last:border-0 cursor-pointer ${
                        isSelected ? 'bg-orange-50 font-bold text-[#e76f51]' : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#e76f51] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Property Type (Unique Property Types from Backend) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Property Type
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-950">
                <input
                  type="radio"
                  name="propertyType"
                  checked={propertyType === ''}
                  onChange={() => updateUrl({ propertyType: undefined })}
                  className="w-3.5 h-3.5 text-[#e76f51] focus:ring-[#e76f51] accent-[#e76f51]"
                />
                <span className="font-medium">All Property Types</span>
              </label>

              {displayPropertyTypes.map((type) => {
                const formattedName =
                  type.charAt(0).toUpperCase() + type.slice(1);
                const isSelected = propertyType.toLowerCase() === type.toLowerCase();
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-950"
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      checked={isSelected}
                      onChange={() => updateUrl({ propertyType: type })}
                      className="w-3.5 h-3.5 text-[#e76f51] focus:ring-[#e76f51] accent-[#e76f51]"
                    />
                    <span className="capitalize">{formattedName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Bedrooms / BHK */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Bedrooms (BHK)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '1 BHK', value: '1' },
                { label: '2 BHK', value: '2' },
                { label: '3 BHK', value: '3' },
                { label: '4+ BHK', value: '4' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    const newVal = bedrooms === item.value ? undefined : item.value;
                    updateUrl({ bedrooms: newVal });
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    bedrooms === item.value
                      ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Budget Filters */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Budget Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>
          </div>

          {/* 6. Saved Only Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-800 font-semibold">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={(e) => updateUrl({ savedOnly: e.target.checked ? 'true' : undefined })}
                className="w-4 h-4 rounded text-[#e76f51] border-slate-300 focus:ring-[#e76f51] accent-[#e76f51]"
              />
              <span>Saved / Bookmarked Only ({savedPropertyIds.length})</span>
            </label>
          </div>
        </aside>

        {/* RIGHT PROPERTY RESULTS COLUMN */}
        <main className="md:col-span-3 space-y-6">
          {/* Controls Bar: Sort, view and active chips */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Active Filters count summary */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                {totalItems} {totalItems === 1 ? 'Property' : 'Properties'} Found
              </span>
              {totalPages > 1 && (
                <span className="text-slate-400 font-medium">
                  • Page {currentPage} of {totalPages}
                </span>
              )}
              {activeFiltersCount > 0 && (
                <span className="text-slate-400">({activeFiltersCount} filters active)</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateUrl({ sort: e.target.value })}
                className="h-10 px-3.5 text-sm font-semibold rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Area: Largest Sqft</option>
              </select>
            </div>
          </div>

          {/* Grid of Results / Loading / Empty */}
          {loading ? (
            <div className="bg-white rounded-lg p-24 text-center border border-slate-200/80 shadow-xs space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-[#e76f51] mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading verified properties catalog...</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                    Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-slate-900">{endIndex}</span> of{' '}
                    <span className="font-semibold text-slate-900">{totalItems}</span> properties
                  </p>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none"
                            >
                              …
                            </span>
                          );
                        }
                        const pageNum = Number(p);
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            disabled={loading}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                              isActive
                                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                      aria-label="Next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No properties matched your criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your price range, choosing another city, or clearing some of your active filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
