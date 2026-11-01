'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/propertyUtils';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  PlusCircle,
  Clock,
  ChevronRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export default function SellerDashboardClient() {
  const { user, properties, getMyInquiries } = useAuth();

  const myProperties = useMemo(() => {
    return properties.filter((p) => !user || p.ownerId === user.id || user.role === 'seller');
  }, [properties, user]);

  const allInquiries = getMyInquiries();
  const unreadInquiries = allInquiries.filter((inq) => inq.status === 'new').length;
  const soldPropertiesCount = myProperties.filter((p) => p.status === 'sold').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Seller Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-800">{user?.name || 'Seller Partner'}</strong>! Here is your listing activity and lead summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/seller/properties/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards Grid: 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Property */}
        <Link
          href="/seller/properties"
          className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs hover:border-[#e76f51]/40 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Properties
            </span>
            <span className="p-2 rounded-md bg-orange-50 text-[#e76f51] group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{myProperties.length}</span>
            <span className="text-xs text-slate-500 font-semibold">
              Listings
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Manage listings directory →</p>
        </Link>

        {/* Card 2: Sold Out Property */}
        <Link
          href="/seller/properties"
          className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs hover:border-rose-400/40 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sold Out Properties
            </span>
            <span className="p-2 rounded-md bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{soldPropertiesCount}</span>
            <span className="text-xs text-rose-600 font-semibold">
              Closed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Completed property deals →</p>
        </Link>

        {/* Card 3: Inquiries */}
        <Link
          href="/seller/inquiries"
          className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs hover:border-blue-400/40 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inquiries
            </span>
            <span className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{allInquiries.length}</span>
            {unreadInquiries > 0 ? (
              <span className="text-xs font-bold text-white bg-[#e76f51] px-2 py-0.5 rounded-md">
                {unreadInquiries} new
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500">All reviewed</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Review buyer messages →</p>
        </Link>
      </div>

      {/* TWO COLUMN INFORMATIONAL SECTION: PROPERTIES & INQUIRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Column 1: Listed Properties Overview (Information Only - No Actions) */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
                  <Building2 className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">Listed Properties</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e76f51]/10 text-[#e76f51]">
                  {myProperties.length} Total
                </span>
              </div>
              <Link
                href="/seller/properties"
                className="text-xs font-bold text-[#e76f51] hover:text-[#d85e40] flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myProperties.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">No properties listed yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myProperties.slice(0, 5).map((prop) => {
                  const status = prop.status || 'active';
                  return (
                    <div key={prop.id} className="py-3.5 first:pt-2 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <Image
                            src={prop.coverImage}
                            alt={prop.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {prop.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {prop.location}, {prop.city}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {prop.bedrooms} BHK • {prop.area} sq.ft
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {formatPrice(prop.price)}
                        </div>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : status === 'inactive'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}
                        >
                          {status === 'active' ? '● Active' : status === 'inactive' ? '○ Inactive' : '✕ Sold'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/seller/properties"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 py-1 transition-colors"
            >
              Manage all {myProperties.length} properties in directory →
            </Link>
          </div>
        </div>

        {/* Column 2: Recent Inquiries Overview (Information Only - No Actions) */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">Recent Inquiries</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                  {allInquiries.length} Total
                </span>
              </div>
              <Link
                href="/seller/inquiries"
                className="text-xs font-bold text-[#e76f51] hover:text-[#d85e40] flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {allInquiries.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">No buyer inquiries received yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allInquiries.slice(0, 5).map((inq) => (
                  <div key={inq.id} className="py-3.5 first:pt-2 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-xs text-slate-900 truncate">{inq.name}</span>
                        <span className="text-[11px] text-slate-400 truncate">• {inq.phone}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          inq.status === 'new'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : inq.status === 'replied'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inq.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium truncate">
                      {inq.propertyTitle}
                    </p>

                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                      &quot;{inq.message}&quot;
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="truncate">{inq.email}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/seller/inquiries"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 py-1 transition-colors"
            >
              Manage all {allInquiries.length} inquiries in table →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
