'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
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
} from 'lucide-react';

export default function SellerInquiriesClient() {
  const { user, getMyInquiries, updateInquiryStatus } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Active inquiry for View / Reply modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySent, setReplySent] = useState(false);

  const allInquiries = getMyInquiries();

  // Status counts for filter chips
  const countNew = allInquiries.filter((i) => i.status === 'new').length;
  const countRead = allInquiries.filter((i) => i.status === 'read').length;
  const countReplied = allInquiries.filter((i) => i.status === 'replied').length;

  // Filter and search logic
  const filteredInquiries = useMemo(() => {
    return allInquiries
      .filter((inq) => {
        const matchesStatus = filterStatus === 'all' || inq.status === filterStatus;
        const matchesSearch =
          inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inq.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inq.propertyTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inq.propertyCity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          inq.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allInquiries, filterStatus, searchQuery]);

  // Pagination math
  const totalItems = filteredInquiries.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentInquiries = filteredInquiries.slice(startIndex, endIndex);

  const handleOpenModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setReplySent(false);
    setReplyMessage('');
    if (inq.status === 'new') {
      updateInquiryStatus(inq.id, 'read');
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInquiry && replyMessage.trim()) {
      updateInquiryStatus(selectedInquiry.id, 'replied');
      setReplySent(true);
      setTimeout(() => {
        setSelectedInquiry(null);
        setReplySent(false);
        setReplyMessage('');
      }, 1200);
    }
  };

  const handleQuickStatusChange = (inqId: string, status: 'new' | 'read' | 'replied') => {
    updateInquiryStatus(inqId, status);
  };

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search sender, email, property title, message..."
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter Buttons */}
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
              All ({allInquiries.length})
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
              New ({countNew})
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
              Read ({countRead})
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
              Replied ({countReplied})
            </button>
          </div>
        </div>

        {/* Active filter summary */}
        {(searchQuery || filterStatus !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredInquiries.length}</strong> matching inquiries
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
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
        {currentInquiries.length === 0 ? (
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
                {currentInquiries.map((inq) => {
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
                              {inq.phone}
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
                        <button
                          type="button"
                          onClick={() => handleOpenModal(inq)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View &amp; Reply</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION TOOLBAR */}
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
                disabled={validCurrentPage <= 1}
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
                      validCurrentPage === pageNum
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
                disabled={validCurrentPage >= totalPages}
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
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Buyer Contact Header */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">{selectedInquiry.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedInquiry.status === 'new'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInquiry.status === 'replied'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Status: {selectedInquiry.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="flex items-center gap-1.5 text-blue-600 hover:underline truncate"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {selectedInquiry.email}
                  </a>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {selectedInquiry.phone}
                  </a>
                </div>
              </div>

              {/* Property Reference */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Property Inquired:
                </span>
                <div className="font-bold text-slate-900 flex items-center justify-between gap-2 p-2.5 rounded bg-slate-50 border border-slate-100">
                  <span className="truncate">{selectedInquiry.propertyTitle}</span>
                  {selectedInquiry.propertySlug && (
                    <Link
                      href={`/property/${selectedInquiry.propertySlug}`}
                      target="_blank"
                      className="text-[#e76f51] hover:underline text-[11px] font-semibold shrink-0 flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Message:
                </span>
                <div className="p-3.5 rounded-md bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Feedback Alert if sent */}
              {replySent && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reply sent to {selectedInquiry.name} successfully! Marked as Replied.</span>
                </div>
              )}

              {/* Quick Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Quick Reply to Buyer:
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Hi ${selectedInquiry.name}, thank you for your inquiry. When are you free for a property tour?`}
                  className="w-full p-3 text-xs sm:text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all resize-none"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={replySent}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

