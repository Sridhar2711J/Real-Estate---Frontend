'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import HeroSearch from '@/components/home/HeroSearch';
import PropertyCard from '@/components/property/PropertyCard';
import {
  ArrowUpRight,
  Play,
  X
} from 'lucide-react';

export default function HomePage() {
  const { properties } = useAuth();

  const featuredProperties = properties.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. HERO SECTION (FULL WIDTH WITH PALE MINT CONTAINER MATCHING REFERENCE IMAGE) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 pt-4 pb-12">
        <div className="relative rounded-2xl bg-[#dceee5] overflow-hidden p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle & Search Card */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Bold Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black text-[#111827] tracking-tight leading-[1.08]">
                Let&apos;s find your <br />
                perfect home <br />
                for you.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg leading-relaxed">
                From as low as $10 per day with limited time offer discounts.
              </p>

              {/* Floating Search Box Component */}
              <div className="pt-2">
                <HeroSearch />
              </div>
            </div>

            {/* Right Column: Architectural Modern Villa with "Watch Video" Pill */}
            <div className="lg:col-span-5 relative w-full h-[360px] sm:h-[460px] lg:h-[500px]">
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl shadow-slate-900/10">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Architectural Home with Warm Lighting"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROPERTIES GRID (FULL WIDTH) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-14 border-t border-slate-100">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* 3. SELLER BANNER (ORIGINAL SIZE & LAYOUT WITH HERO COLOR PALETTE) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
        <div className="rounded-2xl bg-[#dceee5] text-[#111827] p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs border border-slate-200/40">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e76f51]">
              For Property Sellers &amp; Landlords
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-[#111827]">
              List Your Property with Real Estate &amp; Connect with Verified Buyers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Post your apartment, villa, or commercial property with multi-image gallery upload and direct contact inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/dashboard/properties/new"
              className="px-6 py-3.5 rounded-lg bg-[#e76f51] hover:bg-[#d65a3d] text-white text-xs sm:text-sm font-bold transition-all text-center shadow-md shadow-[#e76f51]/25 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Add Property</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-[#111827] text-xs sm:text-sm font-bold border border-slate-200/80 transition-all text-center shadow-xs cursor-pointer"
            >
              Seller Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
