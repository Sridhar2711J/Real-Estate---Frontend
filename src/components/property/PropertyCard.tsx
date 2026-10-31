'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types';
import { formatPrice } from '@/lib/propertyUtils';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  showSimilarityScore?: boolean;
}

export default function PropertyCard({ property, showSimilarityScore = false }: PropertyCardProps) {
  const { isPropertySaved, toggleSaveProperty } = useAuth();
  const saved = isPropertySaved(property.id);

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Link href={`/property/${property.id}`} className="block w-full h-full">
          <Image
            src={property.coverImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Gradient overlay on bottom of image for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-semibold capitalize rounded-md bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
            {property.propertyType}
          </span>
        </div>

        {/* Save Bookmark Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveProperty(property.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-md backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            saved
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Price & Location */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatPrice(property.price)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </div>
        </div>

        {/* Title */}
        <Link href={`/property/${property.id}`} className="group/title">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover/title:text-[#e76f51] transition-colors mb-2">
            {property.title}
          </h3>
        </Link>

        {/* Location & City */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{property.location || property.city || 'Prime Location'}, {property.city || ''}</span>
        </div>

        {/* Features Chips (Bedrooms, Bathrooms, Area) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-slate-700 text-xs mt-auto">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">{property.bedrooms} <span className="font-normal text-slate-500">Beds</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">{property.bathrooms} <span className="font-normal text-slate-500">Baths</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">{property.area} <span className="font-normal text-slate-500">sqft</span></span>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3.5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Verified Seller
          </span>
          <Link
            href={`/property/${property.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-[#e76f51] transition-colors"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
