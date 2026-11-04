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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Send,
  X,
  RotateCcw,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function SellerInquiriesClient() {
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  // Backend pagination state
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

  // Active inquiry for View / Reply modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch inquiries from backend API
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
      console.error('Failed to fetch seller inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch, filterStatus, currentPage, pageSize]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Listen for background updates
  useEffect(() => {
    const handleUpdated = () => {
      fetchInquiries();
    };
    window.addEventListener('inquiry:updated', handleUpdated);
    return () => window.removeEventListener('inquiry:updated', handleUpdated);
  }, [fetchInquiries]);

  const handleOpenModal = async (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setReplySent(false);
    setReplyMessage('');
    setActionFeedback(null);

    // If new, mark as read on the backend
    if (inq.status === 'new') {
      try {
        const updateRes = await inquiryService.updateInquiryStatus(inq.id, 'read');
        if (updateRes.success && updateRes.inquiry) {
          setSelectedInquiry(updateRes.inquiry);
          setInquiries((prev) =>
            prev.map((item) => (item.id === inq.id ? { ...item, status: 'read' } : item))
          );
          setStatusCounts((prev) => ({
            ...prev,
            new: Math.max(0, prev.new - 1),
            read: prev.read + 1,
            unread: Math.max(0, prev.unread - 1),
          }));
        }
      } catch (err) {
        console.warn('Failed to mark inquiry as read:', err);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim() || replySubmitting) return;

    setReplySubmitting(true);
    setActionFeedback(null);

    try {
      const res = await inquiryService.updateInquiryStatus(
        selectedInquiry.id,
        'replied',
        replyMessage.trim()
      );

      if (res.success && res.inquiry) {
        setReplySent(true);
        setActionFeedback('Reply sent to buyer successfully!');
        setSelectedInquiry(res.inquiry);
        setInquiries((prev) =>
          prev.map((item) => (item.id === selectedInquiry.id ? res.inquiry! : item))
        );
        setStatusCounts((prev) => ({
          ...prev,
          replied: prev.replied + 1,
          read: selectedInquiry.status === 'read' ? Math.max(0, prev.read - 1) : prev.read,
          new: selectedInquiry.status === 'new' ? Math.max(0, prev.new - 1) : prev.new,
        }));

        setTimeout(() => {
          setSelectedInquiry(null);
          setReplySent(false);
          setReplyMessage('');
          setActionFeedback(null);
        }, 1500);
      } else {
        setActionFeedback(res.message || 'Failed to send reply');
      }
    } catch (err: any) {
      setActionFeedback(err?.message || 'Error occurred while submitting reply.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleQuickStatusChange = async (inqId: string, status: 'new' | 'read' | 'replied') => {
    try {
      const res = await inquiryService.updateInquiryStatus(inqId, status);
      if (res.success) {
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (inqId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await inquiryService.deleteInquiry(inqId);
      if (res.success) {
        if (selectedInquiry?.id === inqId) {
          setSelectedInquiry(null);
        }
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Received Inquiries
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Table format list of prospective buyers asking questions or scheduling property site visits.
          </p>
        </div>

        <Link
          href="/seller/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start md:self-center cursor-pointer"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search buyer name, email, property, message..."
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter Buttons with Dynamic Counts from Backend */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('new');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'new'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              New ({statusCounts.new})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('read');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'read'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Read ({statusCounts.read})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('replied');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'replied'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Replied ({statusCounts.replied})
            </button>
          </div>
        </div>

        {/* Active filter summary */}
        {(debouncedSearch || filterStatus !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{totalItems}</strong> matching inquiries from backend
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
      </div>

      {/* INQUIRIES TABLE CONTAINER */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#e76f51] animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading inquiries from server...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No inquiries found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No buyer inquiries match your current search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Buyer / Sender</th>
                  <th className="py-3.5 px-3">Property</th>
                  <th className="py-3.5 px-3">Message Snippet</th>
                  <th className="py-3.5 px-3">Received At</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inquiries.map((inq) => {
                  const dateFormatted = new Date(inq.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const timeFormatted = new Date(inq.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => handleOpenModal(inq)}
                    >
                      {/* Buyer Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#fef0eb] text-[#e76f51] font-bold text-xs flex items-center justify-center shrink-0 border border-[#e76f51]/20">
                            {inq.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                              {inq.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {inq.email}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {inq.phone || 'No phone provided'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          {inq.propertyCoverImage && (
                            <div className="relative w-11 h-11 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <Image
                                src={inq.propertyCoverImage}
                                alt="Property"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 line-clamp-1 block text-xs group-hover:text-[#e76f51] transition-colors">
                              {inq.propertyTitle}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {inq.propertyCity || 'Prime Location'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Message Excerpt */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed italic">
                          &quot;{inq.message}&quot;
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{dateFormatted}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {timeFormatted}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={inq.status}
                            onChange={(e) => handleQuickStatusChange(inq.id, e.target.value as 'new' | 'read' | 'replied')}
                            aria-label="Change inquiry status"
                            className={`text-[10px] font-bold rounded-md px-2 py-1 border transition-colors cursor-pointer ${
                              inq.status === 'new'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : inq.status === 'read'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="new">● New</option>
                            <option value="read">● Read</option>
                            <option value="replied">✓ Replied</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(inq)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View &amp; Reply</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(inq.id)}
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
        )}

        {/* BACKEND PAGINATION TOOLBAR */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            {/* Showing details and Page Size Selector */}
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

      {/* VIEW & REPLY MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-orange-100 text-[#e76f51]">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-slate-900">Inquiry Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Sender Details Card */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Buyer Information
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedInquiry.status === 'new'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInquiry.status === 'read'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedInquiry.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fef0eb] text-[#e76f51] font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedInquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedInquiry.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {selectedInquiry.email}
                      </span>
                      {selectedInquiry.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {selectedInquiry.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center gap-3">
                {selectedInquiry.propertyCoverImage && (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-200 shrink-0">
                    <Image
                      src={selectedInquiry.propertyCoverImage}
                      alt="Property"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Property Inquired
                  </span>
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {selectedInquiry.propertyTitle}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {selectedInquiry.propertyCity || 'Prime Location'}
                  </span>
                </div>
                <Link
                  href={`/property/${selectedInquiry.propertySlug || selectedInquiry.propertyId}`}
                  target="_blank"
                  className="p-1.5 rounded-md text-slate-400 hover:text-[#e76f51] hover:bg-white transition-colors"
                  title="View Property Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Message from Buyer */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Inquiry Message:
                </label>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
                  &quot;{selectedInquiry.message}&quot;
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  Received {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Existing Reply if already replied */}
              {selectedInquiry.replyMessage && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md text-xs text-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Previous Reply Sent:
                    </span>
                    {selectedInquiry.repliedAt && (
                      <span className="text-[10px] font-normal text-emerald-700">
                        {new Date(selectedInquiry.repliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line text-slate-700">{selectedInquiry.replyMessage}</p>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedInquiry.replyMessage ? 'Send Updated Reply:' : 'Direct Reply to Buyer:'}
                  </label>
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Write your response to ${selectedInquiry.name} (e.g. site visit schedule, brochure details)...`}
                    className="w-full p-2.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 font-medium"
                    required
                  />
                </div>

                {actionFeedback && (
                  <p
                    className={`text-xs font-semibold ${
                      replySent ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {actionFeedback}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(null)}
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={replySubmitting || !replyMessage.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {replySubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
