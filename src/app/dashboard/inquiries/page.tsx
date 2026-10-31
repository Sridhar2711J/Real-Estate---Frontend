'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Building2,
  Filter
} from 'lucide-react';

export default function InquiriesPage() {
  const { getMyInquiries, updateInquiryStatus, properties } = useAuth();
  const myInquiries = getMyInquiries();

  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  const filteredInquiries = myInquiries.filter((inq) => {
    if (statusFilter === 'all') return true;
    return inq.status === statusFilter;
  });

  const getPropertyInfo = (propertyId: string) => {
    return properties.find((p) => p.id === propertyId);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Received Buyer &amp; Tenant Inquiries
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct inquiries submitted from your property listing detail pages.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            {[
              { label: 'All', value: 'all' },
              { label: 'New', value: 'new' },
              { label: 'Read', value: 'read' },
              { label: 'Replied', value: 'replied' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                  statusFilter === tab.value
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
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
              const formattedDate = new Date(inq.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={inq.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all shadow-xs ${
                    inq.status === 'new'
                      ? 'border-purple-200 ring-1 ring-purple-100'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    {/* Sender Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">
                          {inq.name}
                        </h3>
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inq.status === 'new'
                              ? 'bg-purple-100 text-purple-700'
                              : inq.status === 'replied'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <a
                          href={`mailto:${inq.email}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" /> {inq.email}
                        </a>
                        <a
                          href={`tel:${inq.phone}`}
                          className="flex items-center gap-1 text-slate-700 font-medium hover:text-slate-900"
                        >
                          <Phone className="w-3.5 h-3.5" /> {inq.phone}
                        </a>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* Linked Property Badge */}
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200/60 max-w-sm">
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        {inq.propertyCoverImage ? (
                          <Image
                            src={inq.propertyCoverImage}
                            alt="Property"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400 m-2.5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <Link
                          href={`/property/${inq.propertySlug}`}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-1 flex items-center gap-1"
                        >
                          <span>{inq.propertyTitle}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                        <span className="text-[10px] text-slate-500">{inq.propertyCity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="py-3">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      &quot;{inq.message}&quot;
                    </p>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${inq.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold flex items-center gap-1.5 hover:bg-slate-800"
                      >
                        <Phone className="w-3 h-3" /> Call Buyer
                      </a>
                      <a
                        href={`mailto:${inq.email}?subject=Regarding inquiry for ${inq.propertyTitle}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 hover:bg-slate-50"
                      >
                        <Mail className="w-3 h-3" /> Email Reply
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Update Status:</span>
                      {inq.status !== 'read' && (
                        <button
                          onClick={() => updateInquiryStatus(inq.id, 'read')}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 text-[11px]"
                        >
                          Mark as Read
                        </button>
                      )}
                      {inq.status !== 'replied' && (
                        <button
                          onClick={() => updateInquiryStatus(inq.id, 'replied')}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 border border-emerald-200 text-[11px]"
                        >
                          Mark as Replied
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No inquiries found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter === 'all'
                ? 'You do not have any inquiries yet. When interested buyers fill the form on your listings, they will show up here.'
                : `No inquiries with status "${statusFilter}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

