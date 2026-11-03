'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/propertyUtils';
import {
  User,
  Mail,
  Phone,
  Save,
  CheckCircle,
  ShieldCheck,
  Building2,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  MapPin,
  Briefcase,
  FileCheck
} from 'lucide-react';

export default function SellerProfileClient() {
  const { user, updateUserProfile, properties, getMyInquiries } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Pune',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+91 98220 12345',
      }));
    }
  }, [user]);

  const safeProperties = Array.isArray(properties) ? properties : [];
  const myProperties = useMemo(() => {
    return safeProperties.filter((p) => !user || p.ownerId === user.id || user.role === 'seller');
  }, [safeProperties, user]);

  const allInquiries = typeof getMyInquiries === 'function' ? getMyInquiries() : [];
  const totalPortfolioValue = myProperties.reduce((sum, p) => sum + (p.price || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      setIsSubmitting(false);
      setSavedSuccess(true);

      setTimeout(() => {
        setSavedSuccess(false);
      }, 3500);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <User className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Seller Profile &amp; Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your verified seller credentials, agency branding, and contact details for incoming buyer leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Seller Partner
          </span>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 ring-2 ring-slate-100">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || 'Seller'}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span>{user?.name?.charAt(0) || 'S'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Seller Partner'}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e76f51]/10 text-[#e76f51]">
                  Seller Account
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Link
              href="/seller/properties/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs font-bold transition-all shadow-xs cursor-pointer w-full sm:w-auto"
            >
              <Building2 className="w-4 h-4" />
              Add Property Listing
            </Link>
          </div>
        </div>

        {savedSuccess && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Seller profile details updated successfully! Changes have been saved.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Contact Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#e76f51]" /> Primary Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Madhusudhan Rao"
                    className="w-full h-10 pl-10 pr-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. info.madhu786@gmail.com"
                    className="w-full h-10 pl-10 pr-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Direct Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98220 12345"
                    className="w-full h-10 pl-10 pr-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Details...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Seller Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

