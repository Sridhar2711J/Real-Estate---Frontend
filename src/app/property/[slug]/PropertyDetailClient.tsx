'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import { inquiryService } from '@/services/inquiryService';
import { formatPrice, calculateSimilarProperties } from '@/lib/propertyUtils';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types';
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
  AlertCircle,
  ChevronLeft
} from 'lucide-react';

export default function PropertyDetailClient() {
  const router = useRouter();
  const params = useParams();
  const slug =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : '';

  const {
    user,
    isPropertySaved,
    toggleSaveProperty
  } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch property details directly from API by slug or ID
  useEffect(() => {
    let isMounted = true;
    async function loadPropertyDetails() {
      setLoading(true);
      try {
        const [res, allRes] = await Promise.all([
          propertyService.getPropertyById(slug),
          propertyService.getProperties({ all: true, limit: 10 }),
        ]);
        if (isMounted) {
          if (res && res.success && res.property) {
            setProperty(res.property);
          }
          if (allRes && allRes.success && Array.isArray(allRes.properties)) {
            setAllProperties(allRes.properties);
          }
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (slug) {
      loadPropertyDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  // Sync user info when authenticated
  useEffect(() => {
    if (user) {
      if (user.name) setInquiryName(user.name);
      if (user.email) setInquiryEmail(user.email);
      if (user.phone) setInquiryPhone(user.phone);
    }
  }, [user]);

  // Restore draft inquiry message if user was redirected to login and returned
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const pending = sessionStorage.getItem('realnest_pending_inquiry');
        if (pending) {
          const parsed = JSON.parse(pending);
          if (parsed && (parsed.propertyId === property?.id || parsed.slug === slug)) {
            if (parsed.message) setInquiryMessage(parsed.message);
            if (parsed.phone && !user?.phone) setInquiryPhone(parsed.phone);
          }
          sessionStorage.removeItem('realnest_pending_inquiry');
        }
      }
    } catch {}
  }, [property?.id, slug, user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The property you are looking for may have been sold or removed.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-slate-900 text-white text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Properties
        </Link>
      </div>
    );
  }

  const saved = typeof isPropertySaved === 'function' ? isPropertySaved(property.id) : false;
  const similarProperties = calculateSimilarProperties(property, allProperties.length ? allProperties : [property], 3);
  const pricePerSqft = Math.round(property.price / (property.area || 1));

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If user is not authenticated, save draft inquiry and redirect to login
    if (!user) {
      try {
        sessionStorage.setItem(
          'realnest_pending_inquiry',
          JSON.stringify({
            propertyId: property.id,
            slug: slug || property.id,
            message: inquiryMessage,
            phone: inquiryPhone,
          })
        );
      } catch {}

      const returnUrl = `/property/${slug || property.id}`;
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setInquiryFeedback(null);
    setInquiryLoading(true);

    try {
      const res = await inquiryService.submitInquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        propertySlug: property.slug || property.id,
        propertyCity: property.city,
        propertyCoverImage: property.coverImage,
        name: inquiryName || user.name || '',
        email: inquiryEmail || user.email || '',
        phone: inquiryPhone || user.phone || '',
        message: inquiryMessage,
        honeypotWebsite: honeypot,
      });

      setInquiryLoading(false);
      if (res?.success) {
        setInquiryFeedback({ type: 'success', text: res.message });
        setInquiryMessage('');
      } else {
        setInquiryFeedback({ type: 'error', text: res?.message || 'Failed to submit inquiry.' });
      }
    } catch (err: any) {
      setInquiryLoading(false);
      setInquiryFeedback({
        type: 'error',
        text: err?.message || 'Failed to submit inquiry. Please try again.',
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this ${property.bedrooms} BHK in ${property.location}, ${property.city} on Real Estate.`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-8">
        {/* Top Breadcrumb & Share/Save Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-slate-900">Properties</Link>
            <span>/</span>
            <Link href={`/properties?city=${encodeURIComponent(property.city)}`} className="hover:text-slate-900">{property.city}</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={() => toggleSaveProperty(property.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all shadow-2xs cursor-pointer ${
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
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-lg overflow-hidden bg-slate-900 shadow-xl">
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
              <span className="px-3 py-1 text-xs font-semibold capitalize rounded-md bg-white/90 backdrop-blur-md text-slate-900">
                {property.propertyType}
              </span>
              {property.listingType && (
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-md shadow-xs backdrop-blur-md ${
                    property.listingType === 'rent'
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-emerald-600/90 text-white'
                  }`}
                >
                  {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Listing
              </span>
            </div>

            {/* Image caption */}
            {property.images[activeImageIndex]?.caption && (
              <div className="absolute bottom-4 left-4 text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-md">
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
                  className={`relative w-24 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#e76f51] ring-2 ring-[#e76f51]/20 scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={`${property.title} - photo ${idx + 1}`} fill className="object-cover" />
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
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
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
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline sm:justify-end gap-1">
                    <span>{formatPrice(property.price)}</span>
                    {property.listingType === 'rent' && (
                      <span className="text-sm font-semibold text-slate-500">/mo</span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    ₹{pricePerSqft.toLocaleString('en-IN')} / sq.ft
                  </div>
                </div>
              </div>

              {/* Quick Spec Highlights Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Bedrooms</div>
                    <div className="text-sm font-bold text-slate-900">{property.bedrooms} BHK</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Bathrooms</div>
                    <div className="text-sm font-bold text-slate-900">{property.bathrooms} Baths</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
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
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Property Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {property.listingType && (
                  <div className="p-3 bg-slate-50 rounded-md">
                    <span className="text-slate-400 block mb-1">Purpose</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-400 block mb-1">Property Type</span>
                  <span className="font-bold text-slate-900 capitalize">{property.propertyType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-400 block mb-1">City</span>
                  <span className="font-bold text-slate-900">{property.city}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-400 block mb-1">Location</span>
                  <span className="font-bold text-slate-900">{property.location}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-400 block mb-1">Area</span>
                  <span className="font-bold text-slate-900">{property.area} sq.ft</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            {/* Property Features List */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Property Features</h3>
                <div className="flex flex-wrap gap-2.5">
                  {property.features.map((feat) => (
                    <span
                      key={feat}
                      className="px-3 py-1.5 rounded-md bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200/70 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Detailed Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Contact Seller / Inquiry Form */}
          <div className="space-y-6">
            {/* Seller Info Card */}
            <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                {property.seller?.avatar ? (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={property.seller.avatar}
                      alt={property.seller.name || 'Seller'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-md bg-slate-900 text-white font-bold flex items-center justify-center text-lg uppercase shrink-0">
                    {property.seller?.name ? property.seller.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 capitalize">
                    {property.seller?.name || 'Property Seller'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Usually responds in under 15 mins</p>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/80 shadow-xl space-y-5 sticky top-24">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Send Inquiry to Seller</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule visit or request more photos directly.
                </p>
              </div>

              {!user && (
                <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                  <span>Sign in required to inquire with the seller.</span>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/property/${slug || property.id}`)}`}
                    className="font-bold underline text-amber-900 hover:text-amber-950 shrink-0 cursor-pointer"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {inquiryFeedback && (
                <div
                  className={`p-3.5 rounded-md text-xs flex items-start gap-2 ${
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                  />
                </div>

                {/* Sender Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                  />
                </div>

                {/* Sender Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Message to Seller <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Tell the seller what you want to know about this property..."
                    className="w-full p-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  formNoValidate={!user}
                  disabled={inquiryLoading}
                  className="w-full h-10 px-4 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-sm font-bold tracking-wide transition-all shadow-sm shadow-[#e76f51]/25 hover:shadow-md hover:shadow-[#e76f51]/35 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {inquiryLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : !user ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Sign In to Send Inquiry</span>
                    </>
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

