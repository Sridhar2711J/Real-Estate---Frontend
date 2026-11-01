'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Inquiry } from '@/types';
import { formatPrice } from '@/lib/propertyUtils';
import {
  MessageSquare,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  Building2,
  Mail,
  Phone,
  ArrowUpRight,
  Inbox,
  X,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function BuyerInquiriesClient() {
  const { user, getMyInquiries, properties } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const allInquiries = getMyInquiries();

  // If user is buyer, show inquiries sent by user or matching user's email;
  // If no user or demo, show all available inquiries for preview
  const relevantInquiries = allInquiries.filter((inq) => {
    if (!user) return true;
    if (user.role === 'buyer') {
      return (
        inq.senderId === user.id ||
        inq.email.toLowerCase() === user.email.toLowerCase() ||
        inq.senderId === 'user-priya-002'
      );
    }
    // If seller, show all my property inquiries
    return true;
  });

  const displayList = relevantInquiries.length > 0 ? relevantInquiries : allInquiries;

  // Filter counts
  const countAll = displayList.length;
  const countNew = displayList.filter((i) => i.status === 'new').length;
  const countRead = displayList.filter((i) => i.status === 'read').length;
  const countReplied = displayList.filter((i) => i.status === 'replied').length;

  const filteredInquiries = displayList.filter((inq) => {
    const matchesFilter = filterStatus === 'all' || inq.status === filterStatus;
    const matchesSearch =
      inq.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.propertyCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.replyMessage && inq.replyMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getPropertyInfo = (propertyId: string) => {
    return properties.find((p) => p.id === propertyId);
  };

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
            Track inquiries, viewing requests, and responses for properties you are interested in.
          </p>
        </div>

        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all self-start md:self-center shadow-xs"
        >
          <Building2 className="w-4 h-4" />
          Browse Properties
        </Link>
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
            className="w-full h-10 pl-10 pr-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter Buttons with Dynamic Counts */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md self-start sm:self-center overflow-x-auto">
          {[
            { label: 'All', value: 'all', count: countAll },
            { label: 'New / Sent', value: 'new', count: countNew },
            { label: 'Seen', value: 'read', count: countRead },
            { label: 'Replied', value: 'replied', count: countReplied },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value as 'all' | 'new' | 'read' | 'replied')}
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

      {/* Inquiries List */}
      {filteredInquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => {
            const prop = getPropertyInfo(inq.propertyId);
            const cover =
              inq.propertyCoverImage ||
              prop?.coverImage ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
            const title = inq.propertyTitle || prop?.title || 'Property Inquiry';
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
                    src={cover}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 208px"
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 capitalize">
                    {inq.propertyCity || prop?.city || 'India'}
                  </div>

                  {prop?.price && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-[10px] font-extrabold text-white">
                      {formatPrice(prop.price)}
                    </div>
                  )}
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
                        <span className="truncate">{title}</span>
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

                    {/* REPLY MESSAGE OPTION - Highlighted Response Card */}
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
                          The property owner has reviewed and responded to your inquiry. Check your email ({inq.email}) for direct tour coordination details!
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

                    <div className="flex items-center gap-3">
                      {/* View Conversation Modal Trigger */}
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/80">
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
    </div>
  );
}
