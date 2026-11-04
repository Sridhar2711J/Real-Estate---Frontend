'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import { Property } from '@/types';
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
  FileCheck,
  Camera,
  AlertCircle,
} from 'lucide-react';

export default function SellerProfileClient() {
  const { user, updateUserProfile, uploadAvatar } = useAuth();
  const [myProperties, setMyProperties] = useState<Property[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Pune',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Profile updated successfully.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    async function loadSellerProperties() {
      try {
        const res = await propertyService.getMyProperties();
        if (isMounted && res && res.success && Array.isArray(res.properties)) {
          setMyProperties(res.properties);
        }
      } catch (err) {
        console.error('Failed to load seller profile properties:', err);
      }
    }
    loadSellerProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPortfolioValue = myProperties.reduce((sum, p) => sum + (p.price || 0), 0);

  // Handle Profile Avatar Upload (Max 5MB, converts to WebP on backend)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Selected image exceeds the 5MB file size limit.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await uploadAvatar(file);
      if (res && res.success) {
        setSuccessMessage(res.message || 'Profile photo uploaded and converted to WebP successfully.');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(res?.message || 'Failed to upload profile photo.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with upload server.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await updateUserProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
      });

      if (res && res.success) {
        setSuccessMessage(res.message || 'Seller profile details updated successfully!');
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
        }, 4000);
      } else {
        setErrorMessage(res?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error updating profile.');
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Interactive Avatar Upload Box */}
            <div className="relative group/avatar">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 ring-4 ring-slate-100 shadow-sm">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'Seller'}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0) || 'S'}</span>
                )}

                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Camera Action Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#e76f51] hover:bg-[#d85e40] text-white shadow-md transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                title="Upload Profile Picture (Max 5MB • Automatically converted to WebP)"
                aria-label="Upload profile image"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Seller Partner'}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e76f51]/10 text-[#e76f51]">
                  Seller Account
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click camera to change photo • Max 5MB
              </p>
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
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-md bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
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

