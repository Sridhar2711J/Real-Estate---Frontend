'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { inquiryService } from '@/services/inquiryService';
import { Inquiry } from '@/types';
import {
  MessageSquare,
  Search,
  Calendar,
  Clock,
  Building2,
  Mail,
  Phone,
  ArrowUpRight,
  Inbox,
  X,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutList,
  Table as TableIcon,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function BuyerInquiriesClient() {
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Backend Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  // Backend Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Status counts from backend
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    new: 0,
    read: 0,
    replied: 0,
    unread: 0,
  });

  // Selected Inquiry Modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Search debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load inquiries from backend
  const fetchInquiries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await inquiryService.getInquiries({
        search: debouncedSearch,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        page: currentPage,
        limit: pageSize,
      });

      if (res && res.success) {
        setInquiries(res.inquiries || []);
        if (res.pagination) {
          setTotalItems(res.pagination.total);
          setTotalPages(res.pagination.totalPages || 1);
        }
        if (res.counts) {
          setStatusCounts(res.counts);
        }
      }
    } catch (err: any) {
      console.error('Failed to load buyer inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch, filterStatus, currentPage, pageSize]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Listen for inquiry updates
  useEffect(() => {
    const handleUpdated = () => {
      fetchInquiries();
    };
    window.addEventListener('inquiry:updated', handleUpdated);
    return () => window.removeEventListener('inquiry:updated', handleUpdated);
  }, [fetchInquiries]);

  const handleDeleteConfirm = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await inquiryService.deleteInquiry(inquiryToDelete.id);
      if (res.success) {
        if (selectedInquiry?.id === inquiryToDelete.id) {
          setSelectedInquiry(null);
        }
        setInquiryToDelete(null);
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Inquiries
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track inquiries, viewing requests, and direct seller responses with real-time updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Cards View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-md flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Building2 className="w-4 h-4" />
            Browse Properties
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search property title, city, or message..."
            className="w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter Buttons with Dynamic Counts from Backend */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md self-start sm:self-center overflow-x-auto">
          {[
            { label: 'All', value: 'all', count: statusCounts.all },
            { label: 'Pending', value: 'new', count: statusCounts.new },
            { label: 'Seen', value: 'read', count: statusCounts.read },
            { label: 'Replied', value: 'replied', count: statusCounts.replied },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilterStatus(tab.value as 'all' | 'new' | 'read' | 'replied');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === tab.value
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    tab.value === 'replied' && tab.count > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : filterStatus === tab.value
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Summary */}
      {(debouncedSearch || filterStatus !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-900">{totalItems}</strong> matching inquiries
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setDebouncedSearch('');
              setFilterStatus('all');
              setCurrentPage(1);
            }}
            className="inline-flex items-center gap-1 text-[#e76f51] hover:underline font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-lg p-20 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#e76f51] animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading your inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-lg bg-orange-50 text-[#e76f51] mx-auto flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">No inquiries found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            You haven&apos;t sent any property inquiries matching your search or filters yet.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Building2 className="w-4 h-4" />
            Find Your Dream Home
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-3">Your Inquiry Message</th>
                  <th className="py-3.5 px-3">Seller Reply</th>
                  <th className="py-3.5 px-3">Date Sent</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inquiries.map((inq) => {
                  const dateStr = new Date(inq.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInquiry(inq)}
                    >
                      {/* Property */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          {inq.propertyCoverImage && (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <Image
                                src={inq.propertyCoverImage}
                                alt="Property"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 line-clamp-1 block text-xs group-hover:text-[#e76f51] transition-colors">
                              {inq.propertyTitle}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {inq.propertyCity || 'India'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Your Message */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed italic">
                          &quot;{inq.message}&quot;
                        </p>
                      </td>

                      {/* Reply Received */}
                      <td className="py-3.5 px-3 max-w-xs">
                        {inq.replyMessage ? (
                          <div className="p-2 rounded bg-emerald-50 border border-emerald-200/70 text-emerald-900 text-xs line-clamp-2">
                            <span className="font-bold block text-[10px] text-emerald-800">
                              Reply:
                            </span>
                            &quot;{inq.replyMessage}&quot;
                          </div>
                        ) : inq.status === 'replied' ? (
                          <span className="text-emerald-700 text-xs font-semibold">
                            ✓ Replied by Owner
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Awaiting response</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{dateStr}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {inq.status === 'replied' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Replied
                          </span>
                        ) : inq.status === 'read' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            Seen
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inq)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <Link
                            href={`/property/${inq.propertySlug || inq.propertyId}`}
                            target="_blank"
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Open Property Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setInquiryToDelete(inq)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Inquiry"
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

          {/* BACKEND PAGINATION BAR */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{' '}
                <strong className="text-slate-900">{endIndex}</strong> of{' '}
                <strong className="text-slate-900">{totalItems}</strong> inquiries
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Inquiries per page"
                  className="h-7 px-2 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-[#e76f51] cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

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
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const dateStr = new Date(inq.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const hasReply = Boolean(inq.replyMessage || inq.status === 'replied');

            return (
              <div
                key={inq.id}
                className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5"
              >
                {/* Thumbnail Image */}
                <div className="relative w-full md:w-52 h-40 md:h-auto rounded-md overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={
                      inq.propertyCoverImage ||
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={inq.propertyTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 208px"
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 capitalize">
                    {inq.propertyCity || 'India'}
                  </div>
                </div>

                {/* Details Column */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Top Row: Title & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <Link
                        href={`/property/${inq.propertySlug || inq.propertyId}`}
                        className="font-bold text-slate-900 text-sm sm:text-base hover:text-[#e76f51] transition-colors truncate group flex items-center gap-1.5"
                      >
                        <span className="truncate">{inq.propertyTitle}</span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#e76f51] shrink-0" />
                      </Link>

                      {/* Status Badges */}
                      <div className="shrink-0">
                        {inq.status === 'replied' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Agent Replied
                          </span>
                        ) : inq.status === 'read' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            Seen by Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Sent / Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Buyer's Sent Message */}
                    <div className="p-3 bg-slate-50/80 rounded-md border border-slate-100 text-xs text-slate-700 leading-relaxed mb-3">
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                        Your Inquiry Message:
                      </p>
                      &quot;{inq.message}&quot;
                    </div>

                    {/* Reply Highlight */}
                    {inq.replyMessage ? (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-md text-xs text-slate-800 leading-relaxed mb-3 shadow-2xs animate-in fade-in">
                        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-emerald-200/50">
                          <span className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            Owner / Agent Response:
                          </span>
                          {inq.repliedAt && (
                            <span className="text-[10px] text-emerald-700 font-medium">
                              {new Date(inq.repliedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 font-medium whitespace-pre-line">
                          &quot;{inq.replyMessage}&quot;
                        </p>
                      </div>
                    ) : inq.status === 'replied' ? (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-md text-xs text-slate-800 leading-relaxed mb-3">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px] uppercase tracking-wider mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Owner Has Replied:
                        </div>
                        <p className="text-slate-700 italic">
                          The property owner has reviewed and responded to your inquiry. Check your email for details!
                        </p>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-slate-50/50 rounded-md border border-dashed border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5 mb-3">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Awaiting owner response. Sellers usually respond within 24 hours.</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      {inq.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {inq.phone}
                        </span>
                      )}
                      {inq.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {inq.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(inq)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          hasReply
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {hasReply ? 'View Reply Details' : 'View Inquiry'}
                      </button>

                      <Link
                        href={`/property/${inq.propertySlug || inq.propertyId}`}
                        className="font-bold text-[#e76f51] hover:text-[#d85e40] inline-flex items-center gap-1 transition-colors"
                      >
                        Property <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setInquiryToDelete(inq)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Cards Pagination Bar */}
          <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>
              Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{' '}
              <strong className="text-slate-900">{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalItems}</strong> inquiries
            </span>

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
        </div>
      )}

      {/* DETAIL / REPLY MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Inquiry &amp; Owner Response
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Property Snapshot */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-md overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src={
                      selectedInquiry.propertyCoverImage ||
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={selectedInquiry.propertyTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {selectedInquiry.propertyTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {selectedInquiry.propertyCity}
                  </p>
                  <Link
                    href={`/property/${selectedInquiry.propertySlug || selectedInquiry.propertyId}`}
                    target="_blank"
                    className="text-[11px] font-bold text-[#e76f51] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                  >
                    View Listing <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3">
                {/* 1. Buyer sent message */}
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">Your Message:</span>
                    <span className="text-slate-400">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    &quot;{selectedInquiry.message}&quot;
                  </p>
                </div>

                {/* 2. Owner reply message */}
                {selectedInquiry.replyMessage ? (
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Owner / Agent Reply:
                      </span>
                      {selectedInquiry.repliedAt && (
                        <span className="text-emerald-700 text-[10px]">
                          {new Date(selectedInquiry.repliedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                      &quot;{selectedInquiry.replyMessage}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center space-y-1">
                    <Clock className="w-5 h-5 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Awaiting Owner Reply</p>
                    <p className="text-[11px] text-slate-400">
                      The seller will reply directly to your inquiry here and via email.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setInquiryToDelete(selectedInquiry)}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Delete Inquiry?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to remove your inquiry for <strong className="text-slate-900">&quot;{inquiryToDelete.propertyTitle}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInquiryToDelete(null)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Inquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
