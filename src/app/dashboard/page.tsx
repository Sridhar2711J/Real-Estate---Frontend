'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/propertyUtils';
import {
  Building2,
  MessageSquare,
  Heart,
  PlusCircle,
  Eye,
  Trash2,
  CheckCircle,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function DashboardPage() {
  const {
    user,
    properties,
    savedPropertyIds,
    getMyProperties,
    getMyInquiries,
    updateProperty,
    deleteProperty
  } = useAuth();

  const myProperties = getMyProperties();
  const myInquiries = getMyInquiries();
  const unreadInquiries = myInquiries.filter((i) => i.status === 'new').length;

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete listing "${title}"?`)) {
      deleteProperty(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl relative overflow-hidden shrink-0">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                user?.name.charAt(0) || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back, {user?.name || 'Partner'}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  {user?.role === 'seller' ? 'Seller' : 'Buyer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user?.email} • Verified Humero. Member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/inquiries"
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Inquiries</span>
              {unreadInquiries > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {unreadInquiries}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/properties/new"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#e76f51] text-white hover:bg-[#d65a3d] transition-colors shadow-md shadow-[#e76f51]/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Post New Property</span>
            </Link>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">My Listings</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{myProperties.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active properties published
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inquiries</span>
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{myInquiries.length}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {unreadInquiries} new awaiting reply
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bookmarked</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{savedPropertyIds.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Properties in wishlist</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Verified
            </div>
            <p className="text-[11px] text-slate-400 mt-1">KYC &amp; Phone Verified</p>
          </div>
        </div>

        {/* My Properties Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">My Property Listings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage your active posts, toggle sold status, or view live listing.</p>
            </div>

            <Link
              href="/dashboard/properties/new"
              className="text-xs font-bold text-[#e76f51] hover:text-[#d65a3d] flex items-center gap-1"
            >
              + Post Another
            </Link>
          </div>

          {myProperties.length > 0 ? (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {myProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-[280px]">
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={prop.coverImage}
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <Link
                        href={`/property/${prop.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {prop.title}
                      </Link>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{prop.location}, {prop.city}</span>
                        <span>•</span>
                        <span>{prop.bedrooms} BHK</span>
                        <span>•</span>
                        <span className="capitalize">{prop.propertyType}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {formatPrice(prop.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* View Button */}
                    <Link
                      href={`/property/${prop.id}`}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(prop.id, prop.title)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No properties posted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Post your residential or commercial property in just a few minutes to start receiving buyer inquiries.
              </p>
              <Link
                href="/dashboard/properties/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Post Your First Property
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

