'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Pencil,
  Building2,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Save,
} from 'lucide-react';

const COMMON_FEATURES = [
  'Modular Kitchen',
  'Italian Marble Flooring',
  'Smart Home Automation',
  'Covered Car Parking',
  'Private Swimming Pool',
  'Hill / Sea Scenic View',
  'Clubhouse & Gym',
  '24/7 Gated Security',
  'High-Speed Elevators',
  'Private Terrace Deck',
  'Power Backup',
  'Solar Water Heating',
];

export default function EditPropertyClient() {
  const router = useRouter();
  const params = useParams();
  
  const propertyId =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : '';

  const { properties, updateProperty, deleteProperty } = useAuth();

  // Locate the target property
  const property = properties.find((p) => p.id === propertyId);

  // Form states
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'sold'>('active');
  const [propertyType, setPropertyType] = useState('apartment');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Populate form when property is found
  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setStatus((property.status as 'active' | 'inactive' | 'sold') || 'active');
      setPropertyType(property.propertyType || 'apartment');
      setCity(property.city || '');
      setLocation(property.location || '');
      setAddress(property.address || '');
      setPrice(String(property.price || ''));
      setArea(String(property.area || ''));
      setBedrooms(String(property.bedrooms || 3));
      setBathrooms(String(property.bathrooms || 3));
      setCoverImage(
        property.coverImage ||
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      );
      setDescription(property.description || '');
      setSelectedFeatures(
        Array.isArray(property.features) && property.features.length > 0
          ? property.features
          : ['Modular Kitchen', 'Covered Car Parking', '24/7 Gated Security']
      );
    }
  }, [property]);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setSaving(true);

    setTimeout(() => {
      updateProperty(property.id, {
        title,
        status,
        propertyType,
        city,
        location,
        address,
        price: Number(price),
        area: Number(area),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        coverImage,
        description,
        features: selectedFeatures,
      });

      setSaving(false);
      setSuccess(true);

      setTimeout(() => {
        router.push('/seller/properties');
      }, 900);
    }, 400);
  };

  const handleDelete = () => {
    if (!property) return;
    deleteProperty(property.id);
    router.push('/seller/properties');
  };

  // Property Not Found state
  if (!property) {
    return (
      <div className="bg-white rounded-lg p-10 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We could not locate property with ID <strong className="text-slate-800">{propertyId}</strong>. It may have been removed or you do not have permission to view it.
        </p>
        <Link
          href="/seller/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <Pencil className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit Property Listing
            </h1>
            <span
              className={`ml-2 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'inactive'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {status === 'active' ? '● Active' : status === 'inactive' ? '○ Inactive' : '✕ Sold Out'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update listing details, pricing, media, specifications, and availability status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href={`/property/${property.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            title="Preview Public Listing"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Page
          </Link>

          <Link
            href="/seller/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {success && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Property changes saved successfully! Redirecting to properties table...</span>
        </div>
      )}

      {/* Main Edit Form */}
      <form
        onSubmit={handleUpdate}
        className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6"
      >
        {/* Section 1: Basic Property Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            1. Basic Property Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3 BHK Luxury High-Rise Apartment in Baner"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Listing Status: Active, Inactive, Sold Out */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Listing Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'sold')}
                className="w-full h-10 px-3 text-sm font-bold rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 cursor-pointer"
              >
                <option value="active">● Active (Public Listing)</option>
                <option value="inactive">○ Inactive (Hidden / Draft)</option>
                <option value="sold">✕ Sold Out</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-10 px-3 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 cursor-pointer"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Luxury Villa</option>
                <option value="penthouse">Penthouse</option>
                <option value="house">Independent House</option>
                <option value="commercial">Commercial Space</option>
                <option value="plot">Plot / Land</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune, Mumbai, Bangalore"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Locality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Neighborhood / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Baner, Bandra West, Whitefield"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Street Address (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. High Street Road, Tower 2, 14th Floor"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Specifications */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            2. Pricing &amp; Specifications
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Price (INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000000"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Built-up Area (sq.ft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="1650"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={10}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={10}
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Media & Photos */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            3. Property Photo &amp; Cover Image
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cover Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
            />
          </div>

          {/* Live Preview */}
          {coverImage && (
            <div className="relative aspect-[21/9] w-full max-h-56 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={coverImage}
                alt="Property preview"
                fill
                className="object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                Live Photo Preview
              </span>
            </div>
          )}
        </div>

        {/* Section 4: Amenities / Features */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            4. Features &amp; Amenities
          </h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_FEATURES.map((feat) => {
              const selected = selectedFeatures.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                    selected
                      ? 'bg-[#e76f51] border-[#e76f51] text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {selected ? '✓ ' : '+ '}
                  {feat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Description */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Property Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description outlining room layouts, balcony views, flooring, vicinity to transit, and handover status..."
            className="w-full p-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all resize-none"
          />
        </div>

        {/* Section 6: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {/* Cancel & Save */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/seller/properties"
              className="px-5 py-2.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Delete Property Listing?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">&quot;{property.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

