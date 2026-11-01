'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  PlusCircle,
  Building2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
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
];

export default function AddPropertyClient() {
  const router = useRouter();
  const { addProperty, user } = useAuth();

  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [city, setCity] = useState('Pune');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('15000000');
  const [area, setArea] = useState('1650');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  );
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Modular Kitchen',
    'Covered Car Parking',
    '24/7 Gated Security',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      addProperty({
        title,
        propertyType,
        city,
        location,
        address,
        price: Number(price),
        area: Number(area),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        coverImage,
        features: selectedFeatures,
        description:
          description ||
          `Stunning modern ${bedrooms} BHK ${propertyType} in prime ${location}, ${city}. Featuring top architectural craftsmanship, spacious layout and verified property documentation.`,
        images: [
          {
            id: `img-${Date.now()}-1`,
            url: coverImage,
            sortOrder: 0,
            caption: 'Main Front View',
          },
        ],
        ownerId: user?.id || 'user-madhu-001',
      });

      setSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        router.push('/seller/properties');
      }, 800);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-50 text-[#e76f51]">
              <PlusCircle className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Add New Property
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish a verified property listing directly to thousands of active prospective buyers.
          </p>
        </div>

        <Link
          href="/seller/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-center cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Property added successfully! Redirecting to your properties table...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Basic Property Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#e76f51]" />
            Basic Property Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Property Title / Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Luxurious 3 BHK Sun-drenched Penthouse"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Property Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Luxury Villa / Bungalow</option>
                <option value="house">Independent Row House</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Goa">Goa</option>
                <option value="Delhi">Delhi NCR</option>
              </select>
            </div>

            {/* Locality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Locality / Neighborhood <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Koregaon Park, Baner, Bandra West"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Exact Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Lane 7, North Main Road"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Dimensions */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e76f51]" />
            Pricing &amp; Layout Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Price (in ₹ INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="100000"
                step="50000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000000"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Area (Super Built-up sq.ft) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="1650"
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bedrooms (BHK) <span className="text-rose-500">*</span>
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bathrooms <span className="text-rose-500">*</span>
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#e76f51] font-medium cursor-pointer"
              >
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3">3 Baths</option>
                <option value="4">4 Baths</option>
                <option value="5">5+ Baths</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media / Photos */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#e76f51]" />
            Property Cover Image
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Image URL (Unsplash or direct HTTPS link) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-10 px-3.5 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-mono text-xs"
              />
            </div>

            {/* Image Preview */}
            {coverImage && (
              <div className="relative w-full max-w-sm h-48 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={coverImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Key Features & Amenities */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#e76f51]" />
            Key Amenities &amp; Features
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {COMMON_FEATURES.map((feat) => {
              const active = selectedFeatures.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`p-2.5 text-xs font-semibold rounded-md border text-left transition-all flex items-center justify-between cursor-pointer ${
                    active
                      ? 'bg-orange-50 text-[#e76f51] border-[#e76f51]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{feat}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#e76f51] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Detailed Description (Optional)
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description outlining room layouts, balcony views, flooring, vicinity to transit, and handover status..."
            className="w-full p-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/seller/properties"
            className="px-5 py-2.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Publish Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

