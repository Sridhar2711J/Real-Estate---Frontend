'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calculateSimilarProperties } from '@/lib/propertyUtils';
import PropertyCard from '@/components/property/PropertyCard';
import {
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Send,
  Phone,
  Mail,
  AlertCircle,
  Building2,
  ChevronLeft
} from 'lucide-react';

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const {
    properties,
    user,
    isPropertySaved,
    toggleSaveProperty,
    submitInquiry
  } = useAuth();

  const property = properties.find((p) => p.id === slug);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState(user?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [inquiryMessage, setInquiryMessage] = useState(
    'Hello, I am interested in this property. Please let me know a suitable time for a physical visit.'
  );
  const [honeypot, setHoneypot] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryFeedback, setInquiryFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The property you are looking for may have been sold or removed.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Properties
        </Link>
      </div>
    );
  }

  const saved = isPropertySaved(property.id);
  const similarProperties = calculateSimilarProperties(property, properties, 3);
  const pricePerSqft = Math.round(property.price / (property.area || 1));

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryFeedback(null);
    setInquiryLoading(true);

    setTimeout(() => {
      const res = submitInquiry({
        propertyId: property.id,
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        message: inquiryMessage,
        honeypotWebsite: honeypot,
      });

      setInquiryLoading(false);
      if (res.success) {
        setInquiryFeedback({ type: 'success', text: res.message });
        setInquiryMessage('');
      } else {
        setInquiryFeedback({ type: 'error', text: res.message });
      }
    }, 400);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this ${property.bedrooms} BHK in ${property.location}, ${property.city} on Humero.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Share/Save Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-slate-900">Properties</Link>
            <span>/</span>
            <Link href={`/properties?city=${property.city}`} className="hover:text-slate-900">{property.city}</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={() => toggleSaveProperty(property.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                saved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* GALLERY SECTION */}
        <div className="space-y-3">
          {/* Main Large Display */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
            <Image
              src={property.images[activeImageIndex]?.url || property.coverImage}
              alt={property.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs font-semibold capitalize rounded-full bg-white/90 backdrop-blur-md text-slate-900">
                {property.propertyType}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Listing
              </span>
            </div>

            {/* Image caption */}
            {property.images[activeImageIndex]?.caption && (
              <div className="absolute bottom-4 left-4 text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                {property.images[activeImageIndex].caption}
              </div>
            )}
          </div>

          {/* Thumbnails Strip */}
          {property.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-slate-950 ring-2 ring-slate-900/20 scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TWO-COLUMN DETAILS & INQUIRY SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Property Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Header & Pricing Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {property.address ? `${property.address}, ` : ''}{property.location}, {property.city}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    ₹{pricePerSqft.toLocaleString('en-IN')} / sq.ft
                  </div>
                </div>
              </div>

              {/* Quick Spec Highlights Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Bedrooms</div>
                    <div className="text-sm font-bold text-slate-900">{property.bedrooms} BHK</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Bathrooms</div>
                    <div className="text-sm font-bold text-slate-900">{property.bathrooms} Baths</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Built-up Area</div>
                    <div className="text-sm font-bold text-slate-900">{property.area} sq.ft</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Overview Specifications */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Property Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Property Type</span>
                  <span className="font-bold text-slate-900 capitalize">{property.propertyType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">City</span>
                  <span className="font-bold text-slate-900">{property.city}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Location</span>
                  <span className="font-bold text-slate-900">{property.location}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Area</span>
                  <span className="font-bold text-slate-900">{property.area} sq.ft</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Listing ID</span>
                  <span className="font-bold text-slate-900 truncate block">{property.id}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            {/* Property Features List (Separate from Description) */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Property Features</h3>
                <div className="flex flex-wrap gap-2.5">
                  {property.features.map((feat) => (
                    <span
                      key={feat}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200/70 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Detailed Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Contact Seller / Inquiry Form */}
          <div className="space-y-6">
            {/* Seller Info Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Property Seller</h4>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Usually responds in under 15 mins</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Contact via Form
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  Direct Connection
                </span>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl space-y-5 sticky top-24">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Send Inquiry to Seller</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule visit or request more photos directly.
                </p>
              </div>

              {inquiryFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                    inquiryFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{inquiryFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {/* Anti-spam honeypot field */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Sender Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Sender Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Sender Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message to Seller
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#e76f51] hover:bg-[#d65a3d] text-white text-xs font-bold transition-all shadow-md shadow-[#e76f51]/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {inquiryLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Direct Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* SIMILAR PROPERTIES SECTION */}
        {similarProperties.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Similar Properties You May Like
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recommended based on price, location, bedrooms and area.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp.id} property={simProp} showSimilarityScore={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
