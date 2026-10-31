'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, ShieldCheck, Award, Home, ArrowUpRight } from 'lucide-react';
import { HUMERO_CITIES } from '@/data/mockProperties';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="bg-[#111827] text-slate-400 text-sm border-t border-slate-900 mt-auto">
      {/* Top Highlights Bar */}
      <div className="border-b border-slate-800/80 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e76f51]/15 text-[#e76f51] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">100% Verified Listings</h4>
                <p className="text-xs text-slate-400 mt-0.5">Physical and document verified properties by our field experts.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Direct Owner Contact</h4>
                <p className="text-xs text-slate-400 mt-0.5">Zero brokerage options available with transparent communication.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#dceee5]/20 text-[#dceee5] flex items-center justify-center shrink-0">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Premium Urban Homes</h4>
                <p className="text-xs text-slate-400 mt-0.5">Across San Francisco, San Diego, New York, Chicago &amp; more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-3xl font-black tracking-tight text-white">
                Humero<span className="text-[#e76f51]">.</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 pr-6">
              Humero is your premier real estate discovery and listing platform. Connecting homebuyers, tenants, and property sellers directly with verified modern villas, apartments, and commercial architecture.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-[#e76f51]" /> hello@humero.com
              </span>
              <span className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-[#e76f51]" /> +1 (800) 486-3760 (Toll Free)
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/properties?listingType=sale" className="hover:text-white transition-colors">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=rent" className="hover:text-white transition-colors">
                  Rental Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=apartment" className="hover:text-white transition-colors">
                  Apartments &amp; Flats
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=villa" className="hover:text-white transition-colors">
                  Luxury Villas
                </Link>
              </li>
              <li>
                <Link href="/dashboard/properties/new" className="text-[#e76f51] hover:text-[#d65a3d] font-bold transition-colors inline-flex items-center gap-1">
                  <span>Add Property</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Properties by City</h4>
            <ul className="space-y-2.5 text-xs">
              {HUMERO_CITIES.map((city) => (
                <li key={city.name}>
                  <Link
                    href={`/properties?city=${encodeURIComponent(city.name)}`}
                    className="hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{city.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Account &amp; Tools</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Buyer / Seller Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/inquiries" className="hover:text-white transition-colors">
                  Inquiries &amp; Messages
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Privacy Policy &amp; Terms</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Humero. Real Estate Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js, Tailwind CSS &amp; TypeScript matching the Humero modern design system.
          </p>
        </div>
      </div>
    </footer>
  );
}
