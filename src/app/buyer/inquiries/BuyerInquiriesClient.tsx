'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
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
  Inbox
} from 'lucide-react';

export default function BuyerInquiriesClient() {
  const { user, getMyInquiries, properties } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allInquiries = getMyInquiries();

  // If user is buyer, show inquiries sent by user or matching user's email;
  // If no user or demo, show all available inquiries for preview
  const relevantInquiries = allInquiries.filter((inq) => {
    if (!user) return true;
    if (user.role === 'buyer') {
      return inq.senderId === user.id || inq.email.toLowerCase() === user.email.toLowerCase() || inq.senderId === 'user-priya-002';
    }
    // If seller, show all my property inquiries
    return true;
  });

  const displayList = relevantInquiries.length > 0 ? relevantInquiries : allInquiries;

  const filteredInquiries = displayList.filter((inq) => {
    const matchesFilter = filterStatus === 'all' || inq.status === filterStatus;
    const matchesSearch =
      inq.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.propertyCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message?.toLowerCase().includes(searchQuery.toLowerCase());
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
            placeholder="Search by property title, city, or message..."
            className="w-full h-10 pl-10 pr-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md self-start sm:self-center">
          {[
            { label: 'All', value: 'all' },
            { label: 'New / Sent', value: 'new' },
            { label: 'Seen', value: 'read' },
            { label: 'Replied', value: 'replied' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value as 'all' | 'new' | 'read' | 'replied')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === tab.value
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
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

            return (
              <div
                key={inq.id}
                className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5"
              >
                {/* Thumbnail Image */}
                <div className="relative w-full md:w-48 h-36 md:h-auto rounded-md overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={cover}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 capitalize">
                    {inq.propertyCity || prop?.city || 'India'}
                  </div>
                </div>

                {/* Details */}
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
                      <div>
                        {inq.status === 'replied' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
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

                    {/* Sent Message */}
                    <div className="p-3 bg-slate-50/80 rounded-md border border-slate-100 text-xs text-slate-700 leading-relaxed mb-3">
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                        Inquiry Note:
                      </p>
                      &quot;{inq.message}&quot;
                    </div>
                  </div>

                  {/* Footer Meta */}
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

                    <Link
                      href={`/property/${inq.propertySlug || inq.propertyId}`}
                      className="font-bold text-[#e76f51] hover:text-[#d85e40] inline-flex items-center gap-1 transition-colors"
                    >
                      View Property Details <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
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
    </div>
  );
}

