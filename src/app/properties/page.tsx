'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PropertyCard from '@/components/property/PropertyCard';
import { TOP_CITIES } from '@/data/mockProperties';
import { Property } from '@/types';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 6;

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
  const { properties, savedPropertyIds } = useAuth();

  // Read URL params
  const initialCity = searchParams.get('city') || '';
  const initialListingType = searchParams.get('listingType') || '';
  const initialPropertyType = searchParams.get('propertyType') || '';
  const initialBedrooms = searchParams.get('bedrooms') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialSearchQuery = searchParams.get('searchQuery') || '';
  const initialSavedOnly = searchParams.get('savedOnly') === 'true';
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  // State
  const [city, setCity] = useState(initialCity);
  const [listingType, setListingType] = useState(initialListingType);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [bedrooms, setBedrooms] = useState(initialBedrooms);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [savedOnly, setSavedOnly] = useState(initialSavedOnly);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync page state when URL changes externally
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    if (!isNaN(pageFromUrl) && pageFromUrl >= 1) {
      setCurrentPage(pageFromUrl);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Sync state to URL
  const updateUrl = (overrides: Record<string, string>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (resetPage && !('page' in overrides)) {
      params.delete('page');
      setCurrentPage(1);
    }
    const query = params.toString();
    router.push(query ? `/properties?${query}` : '/properties');
  };

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(targetPage);
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage > 1) {
      params.set('page', String(targetPage));
    } else {
      params.delete('page');
    }
    const query = params.toString();
    router.push(query ? `/properties?${query}` : '/properties');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setCity('');
    setListingType('');
    setPropertyType('');
    setBedrooms('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchQuery('');
    setSavedOnly(false);
    setCurrentPage(1);
    router.push('/properties');
  };

  // Filter & Sort computation
  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeSavedIds = Array.isArray(savedPropertyIds) ? savedPropertyIds : [];

  const filteredProperties = useMemo(() => {
    return safeProperties.filter((p) => {
      if (!p) return false;

      if (savedOnly && !safeSavedIds.includes(p.id)) {
        return false;
      }
      if (city && (p.city || '').toLowerCase() !== city.toLowerCase()) {
        return false;
      }
      if (propertyType && p.propertyType !== propertyType) {
        return false;
      }
      if (bedrooms) {
        const bedNum = parseInt(bedrooms, 10);
        if (bedNum >= 4) {
          if ((p.bedrooms || 0) < 4) return false;
        } else if (p.bedrooms !== bedNum) {
          return false;
        }
      }
      if (minPrice && (p.price || 0) < Number(minPrice)) {
        return false;
      }
      if (maxPrice && (p.price || 0) > Number(maxPrice)) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (p.title || '').toLowerCase().includes(query);
        const matchesLocation = (p.location || '').toLowerCase().includes(query);
        const matchesCity = (p.city || '').toLowerCase().includes(query);
        const matchesDesc = (p.description || '').toLowerCase().includes(query);
        const matchesAddress = (p.address || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesCity && !matchesDesc && !matchesAddress) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sort === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sort === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sort === 'area_desc') return (b.area || 0) - (a.area || 0);
      // Default: newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [
    properties,
    savedPropertyIds,
    savedOnly,
    city,
    listingType,
    propertyType,
    bedrooms,
    minPrice,
    maxPrice,
    searchQuery,
    sort,
  ]);

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

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProperties = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, validCurrentPage]);

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
              : city
              ? `Properties for Sale and Rent in ${city}`
              : 'All Verified Residential & Commercial Listings'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {filteredProperties.length > 0 ? (validCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
            {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredProperties.length)} of {filteredProperties.length} verified{' '}
            {filteredProperties.length === 1 ? 'property' : 'properties'} available with direct contact.
          </p>
        </div>

        {/* Search keyword input and mobile filter trigger */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateUrl({ searchQuery: e.target.value });
              }}
              placeholder="Search by locality, title..."
              className="w-full h-10 pl-10 pr-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  onClick={() => {
                    setListingType(item.value);
                    updateUrl({ listingType: item.value });
                  }}
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

          {/* 2. City Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              City
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                updateUrl({ city: e.target.value });
              }}
              className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all cursor-pointer"
            >
              <option value="">All Cities</option>
              {TOP_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Property Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Property Type
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'All Property Types', value: '' },
                { label: 'Apartment / Flat', value: 'apartment' },
                { label: 'Villa', value: 'villa' },
                { label: 'Independent House', value: 'house' },
                { label: 'Commercial Space', value: 'commercial' },
                { label: 'Plot / Land', value: 'plot' },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-950"
                >
                  <input
                    type="radio"
                    name="propertyType"
                    checked={propertyType === item.value}
                    onChange={() => {
                      setPropertyType(item.value);
                      updateUrl({ propertyType: item.value });
                    }}
                    className="w-3.5 h-3.5 text-[#e76f51] focus:ring-[#e76f51] accent-[#e76f51]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
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
                    const newVal = bedrooms === item.value ? '' : item.value;
                    setBedrooms(newVal);
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
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateUrl({ minPrice: e.target.value });
                }}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateUrl({ maxPrice: e.target.value });
                }}
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
                onChange={(e) => {
                  setSavedOnly(e.target.checked);
                  updateUrl({ savedOnly: e.target.checked ? 'true' : '' });
                }}
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
                {filteredProperties.length} Properties Found
              </span>
              {totalPages > 1 && (
                <span className="text-slate-400 font-medium">
                  • Page {validCurrentPage} of {totalPages}
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
                onChange={(e) => {
                  setSort(e.target.value);
                  updateUrl({ sort: e.target.value });
                }}
                className="h-10 px-3.5 text-sm font-semibold rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Area: Largest Sqft</option>
              </select>
            </div>
          </div>

          {/* Grid of Results */}
          {filteredProperties.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                    Showing <span className="font-semibold text-slate-900">{(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-semibold text-slate-900">
                      {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredProperties.length)}
                    </span>{' '}
                    of <span className="font-semibold text-slate-900">{filteredProperties.length}</span> properties
                  </p>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(validCurrentPage - 1)}
                      disabled={validCurrentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers(validCurrentPage, totalPages).map((p, idx) => {
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
                        const isActive = pageNum === validCurrentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
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
                      onClick={() => handlePageChange(validCurrentPage + 1)}
                      disabled={validCurrentPage === totalPages}
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

