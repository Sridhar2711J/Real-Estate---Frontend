'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import { inquiryService } from '@/services/inquiryService';
import { Property } from '@/types';
import { formatPrice } from '@/lib/propertyUtils';
import {
  Building2,
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function SellerPropertiesClient() {
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiryCountsByProp, setInquiryCountsByProp] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'sold'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'area'>('newest');

  // Server-side Pagination & Stats state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    inactive: 0,
  });
  const [cities, setCities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

  // Delete modal state
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; slug?: string; title: string } | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 whenever search query updates
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Load seller's properties via GET API with server-side filters & pagination
  const fetchSellerProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await propertyService.getMyProperties({
        page: currentPage,
        limit: pageSize,
        searchQuery: debouncedSearch.trim() || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        propertyType: filterType !== 'all' ? filterType : undefined,
        city: filterCity !== 'all' ? filterCity : undefined,
        sort: sortBy,
      });

      if (res && res.success) {
        setProperties(Array.isArray(res.properties) ? res.properties : []);
        if (res.stats) {
          setStats(res.stats);
        }
        if (Array.isArray(res.cities)) {
          setCities(res.cities);
        }
        if (Array.isArray(res.propertyTypes)) {
          setPropertyTypes(res.propertyTypes);
        }
        setTotalItems(typeof res.total === 'number' ? res.total : (res.properties?.length || 0));
        setTotalPages(typeof res.totalPages === 'number' ? res.totalPages : 1);
      }
    } catch (err) {
      console.error('Failed to load seller properties:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filterType, filterCity, filterStatus, sortBy]);

  useEffect(() => {
    fetchSellerProperties();
  }, [fetchSellerProperties]);

  useEffect(() => {
    let isMounted = true;
    inquiryService.getInquiries({ limit: 100 }).then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.inquiries)) {
        const counts: Record<string, number> = {};
        res.inquiries.forEach((inq) => {
          if (inq.propertyId) {
            counts[inq.propertyId] = (counts[inq.propertyId] || 0) + 1;
          }
        });
        setInquiryCountsByProp(counts);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Count inquiries per property
  const getInquiryCount = (propertyId: string) => {
    return inquiryCountsByProp[propertyId] || 0;
  };

  // Direct inline status change via API using slug or id
  const handleInlineStatusChange = async (propertyIdOrSlug: string, newStatus: 'active' | 'inactive' | 'sold') => {
    try {
      await propertyService.updateProperty(propertyIdOrSlug, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyIdOrSlug || p.slug === propertyIdOrSlug
            ? { ...p, status: newStatus }
            : p
        )
      );
      // Update local quick stats
      setStats((prev) => {
        const target = properties.find((p) => p.id === propertyIdOrSlug || p.slug === propertyIdOrSlug);
        const oldStatus = target?.status || 'active';
        if (oldStatus === newStatus) return prev;
        return {
          ...prev,
          [oldStatus]: Math.max(0, (prev[oldStatus as keyof typeof prev] || 1) - 1),
          [newStatus]: (prev[newStatus as keyof typeof prev] || 0) + 1,
        };
      });
    } catch (err) {
      console.error('Failed to update property status:', err);
    }
  };

  // Delete property via API using slug or id
  const handleDeleteConfirm = async () => {
    if (propertyToDelete) {
      try {
        const idOrSlug = propertyToDelete.slug || propertyToDelete.id;
        await propertyService.deleteProperty(idOrSlug);
        await fetchSellerProperties();
      } catch (err) {
        console.error('Failed to delete property:', err);
      }
      setPropertyToDelete(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterType('all');
    setFilterCity('all');
    setFilterStatus('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const isFiltered = Boolean(
    searchQuery ||
    filterType !== 'all' ||
    filterCity !== 'all' ||
    filterStatus !== 'all' ||
    sortBy !== 'newest'
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + properties.length, totalItems);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Listed Properties
            </h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-[#e76f51]/10 text-[#e76f51]">
              {stats.total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Table directory of your listings. Update status directly to Active, Inactive, or Sold Out, or edit full property details.
          </p>
        </div>

        <Link
          href="/seller/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all self-start md:self-center cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Filter Tabs (Server filtered) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('active');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('inactive');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'inactive'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Inactive ({stats.inactive})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('sold');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'sold'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Sold Out ({stats.sold})
            </button>
          </div>
        </div>

        {/* Search, Type, City, and Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, locality..."
              className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Property Type Dropdown (Only available types from backend) */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by property type"
            className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#e76f51] cursor-pointer capitalize"
          >
            <option value="all">All Property Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* City Dropdown */}
          <select
            value={filterCity}
            onChange={(e) => {
              setFilterCity(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by city"
            className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#e76f51] cursor-pointer"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc' | 'area');
              setCurrentPage(1);
            }}
            aria-label="Sort properties"
            className="h-9 px-2.5 text-xs rounded-md border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#e76f51] cursor-pointer"
          >
            <option value="newest">Sort: Newest Added</option>
            <option value="price-asc">Sort: Price Low to High</option>
            <option value="price-desc">Sort: Price High to Low</option>
            <option value="area">Sort: Largest Area (sqft)</option>
          </select>
        </div>

        {/* Reset Filter Button if active */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{totalItems}</strong> matching listings
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#e76f51] hover:underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* PROPERTIES TABLE CONTAINER */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#e76f51] mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading listings...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No properties found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No listings match your current filters. Try resetting the search or filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-3">Type &amp; Locality</th>
                  <th className="py-3.5 px-3">Price &amp; Rate</th>
                  <th className="py-3.5 px-3">Inquiries</th>
                  <th className="py-3.5 px-3">Status Selector</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {properties.map((prop) => {
                  const propSlugOrId = prop.slug || prop.id;
                  const inquiryCount = getInquiryCount(prop.id);
                  const currentStatus = prop.status || 'active';

                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Property Cover and Title (Slug-based link) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {prop.coverImage ? (
                              <Image
                                src={prop.coverImage}
                                alt={prop.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <Link
                              href={`/property/${propSlugOrId}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-[#e76f51] transition-colors truncate block text-xs sm:text-sm"
                            >
                              {prop.title}
                            </Link>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {prop.location}, {prop.city}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {prop.bedrooms} BHK • {prop.bathrooms} Baths • {prop.area} sq.ft
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Property Type and Locality */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {prop.propertyType}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {prop.city}
                        </div>
                      </td>

                      {/* Price & Per Sqft */}
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {formatPrice(prop.price)}
                        </div>
                      </td>

                      {/* Inquiries */}
                      <td className="py-3.5 px-3">
                        <Link
                          href="/seller/inquiries"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                            inquiryCount > 0
                              ? 'bg-orange-50 text-[#e76f51] hover:bg-[#e76f51] hover:text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {inquiryCount} leads
                        </Link>
                      </td>

                      {/* STATUS SELECTOR: ACTIVE, INACTIVE, SOLD OUT (Slug-based API) */}
                      <td className="py-3.5 px-3">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleInlineStatusChange(
                              propSlugOrId,
                              e.target.value as 'active' | 'inactive' | 'sold'
                            )
                          }
                          aria-label="Change property status"
                          className={`text-[11px] font-bold rounded-md px-2.5 py-1 border transition-all cursor-pointer font-sans shadow-2xs ${
                            currentStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : currentStatus === 'inactive'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          <option value="active">● Active (Live)</option>
                          {/* <option value="inactive">○ Inactive (Draft)</option> */}
                          <option value="sold">✕ Sold Out</option>
                        </select>
                      </td>

                      {/* Actions: Edit Link (Slug-based), View (Slug-based), Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Dedicated Edit Page Link using slug */}
                          <Link
                            href={`/seller/properties/${propSlugOrId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-[#e76f51] hover:text-[#e76f51] text-xs font-bold transition-all shadow-2xs"
                            title="Edit Listing Details"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#e76f51]" />
                            <span>Edit</span>
                          </Link>

                          {/* View Listing using slug */}
                          <Link
                            href={`/property/${propSlugOrId}`}
                            target="_blank"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setPropertyToDelete({ id: prop.id, slug: prop.slug, title: prop.title })}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SERVER-SIDE PAGINATION TOOLBAR */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            {/* Showing details and Page Size Selector */}
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{' '}
                <strong className="text-slate-900">{endIndex}</strong> of{' '}
                <strong className="text-slate-900">{totalItems}</strong> properties
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Items per page"
                  className="h-7 px-2 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-[#e76f51] cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    disabled={loading}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#e76f51] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Delete Property Listing?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">&quot;{propertyToDelete.title}&quot;</strong>? This action will remove the listing and all linked inquiries.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
