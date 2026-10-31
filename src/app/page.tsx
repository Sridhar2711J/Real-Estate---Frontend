'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import HeroSearch from '@/components/home/HeroSearch';
import PropertyCard from '@/components/property/PropertyCard';
import { HUMERO_CITIES } from '@/data/mockProperties';
import {
  ArrowUpRight,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Home as HomeIcon,
  X
} from 'lucide-react';

export default function HomePage() {
  const { properties } = useAuth();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const citiesScrollRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const featuredProperties = properties.slice(0, 6);

  const scrollCities = (direction: 'left' | 'right') => {
    if (citiesScrollRef.current) {
      const scrollAmount = 300;
      citiesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setCarouselIndex((prev) => (direction === 'right' ? Math.min(prev + 1, 3) : Math.max(prev - 1, 0)));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. HERO SECTION (MATCHING EXACT HUMERO DESIGN FROM UPLOADED IMAGE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full">
        <div className="relative rounded-[32px] sm:rounded-[40px] bg-[#dceee5] overflow-hidden p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle & Search Card */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Bold Title matching image */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black text-[#111827] tracking-tight leading-[1.08]">
                Let&apos;s find your <br />
                perfect home <br />
                for you.
              </h1>

              {/* Subtitle matching image */}
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg leading-relaxed">
                From as low as $10 per day with limited time offer discounts.
              </p>

              {/* Floating Search Box Component */}
              <div className="pt-2">
                <HeroSearch />
              </div>
            </div>

            {/* Right Column: Architectural Modern Villa with "Watch Video" Notch */}
            <div className="lg:col-span-5 relative w-full h-[360px] sm:h-[460px] lg:h-[500px]">
              <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Humero Modern Architectural Home with Warm Lighting"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>

              {/* "Watch Video" Floating Card at Bottom-Right matching image */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="absolute -bottom-2 right-0 sm:right-2 bg-white rounded-2xl sm:rounded-full py-3 px-5 sm:px-6 shadow-xl border border-slate-100/80 flex items-center gap-3 hover:scale-105 transition-all text-slate-900 group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span className="text-xs sm:text-sm font-black tracking-tight text-[#111827]">
                  Watch Video
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROPERTIES BY CITIES SECTION (MATCHING EXACT HUMERO SECTION FROM UPLOADED IMAGE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Properties by cities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              From as low as $10 per day with limited time offer discounts.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#e76f51] hover:text-[#d65a3d] transition-colors group"
          >
            <span>All Cities</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Cities Carousel Container */}
        <div className="relative">
          {/* Scrollable Cards Row */}
          <div
            ref={citiesScrollRef}
            className="flex items-center gap-5 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {HUMERO_CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/properties?city=${encodeURIComponent(city.name)}`}
                className="group shrink-0 w-[170px] sm:w-[185px] flex flex-col cursor-pointer"
              >
                {/* Rounded Photo */}
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* City Name & Property Count with Diagonal Arrow ↗ */}
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#e76f51] transition-colors leading-snug">
                      {city.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {city.count}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#e76f51] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-0.5 shrink-0" />
                </div>
              </Link>
            ))}
          </div>

          {/* Left / Right Carousel Arrow Buttons matching image */}
          <button
            type="button"
            onClick={() => scrollCities('left')}
            className="absolute -left-3 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all z-10"
            aria-label="Previous cities"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollCities('right')}
            className="absolute -right-3 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all z-10"
            aria-label="Next cities"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom Progress Bar Indicator matching image */}
          <div className="mt-8 flex justify-center">
            <div className="w-44 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111827] rounded-full transition-all duration-300"
                style={{
                  width: '35%',
                  transform: `translateX(${carouselIndex * 70}%)`
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Featured Properties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Explore verified apartments, villas, and modern residential spaces.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#e76f51] hover:text-[#d65a3d] transition-colors group"
          >
            <span>View All Properties ({properties.length})</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 4. SELLER BANNER WITH HUMERO STYLING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="rounded-[32px] sm:rounded-[36px] bg-[#111827] text-white p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e76f51]">
              For Property Sellers &amp; Landlords
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              List Your Property with Humero. &amp; Connect with Verified Buyers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Post your apartment, villa, or commercial property with multi-image gallery upload and direct contact inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/dashboard/properties/new"
              className="px-6 py-3 rounded-xl bg-[#e76f51] hover:bg-[#d65a3d] text-white text-xs sm:text-sm font-bold transition-all text-center shadow-lg shadow-[#e76f51]/30 flex items-center justify-center gap-1.5"
            >
              <span>Add Property</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all text-center"
            >
              Seller Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal Trigger */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[#e76f51] fill-[#e76f51]" />
                <h3 className="font-bold text-base text-slate-900">Humero. Virtual Tour Video</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="Video preview"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[#e76f51] flex items-center justify-center shadow-lg mb-3">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
                <p className="font-bold text-sm">Experience Architectural Luxury with Humero.</p>
                <p className="text-xs text-slate-300 mt-1">High definition virtual walkthrough</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
