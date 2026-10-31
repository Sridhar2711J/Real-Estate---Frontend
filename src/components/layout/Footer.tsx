'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="w-full bg-white text-slate-600 text-sm border-t border-slate-200 mt-auto">

      {/* 2. Main 4-Column Footer matching second image */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Newsletter (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/favicon-square.webp"
                  alt="Real Estate Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827]">
                Real Estate<span className="text-[#e76f51]">.</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 pr-4">
              Specializes in providing high-class, modern residences and luxury architecture in prime locations with verified pricing.
            </p>

            {/* Newsletter input with embedded submit arrow button */}
            <div className="pt-2">
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-10 pl-4 pr-12 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-[#111827] hover:bg-[#e76f51] text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Thank you for subscribing!
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Cities (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
              Cities
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] font-medium text-slate-500">
              <li>
                <Link href="/properties?city=San%20Diego" className="hover:text-slate-950 transition-colors">
                  San Diego
                </Link>
              </li>
              <li>
                <Link href="/properties?city=San%20Francisco" className="hover:text-slate-950 transition-colors">
                  San Francisco
                </Link>
              </li>
              <li>
                <Link href="/properties?city=New%20Jersey" className="hover:text-slate-950 transition-colors">
                  New Jersey
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Chicago" className="hover:text-slate-950 transition-colors">
                  Chicago
                </Link>
              </li>
              <li>
                <Link href="/properties?city=New%20York" className="hover:text-slate-950 transition-colors">
                  New York
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Manhattan" className="hover:text-slate-950 transition-colors">
                  Manhattan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Property Types (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
              Property Types
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] font-medium text-slate-500">
              <li>
                <Link href="/properties?propertyType=house" className="hover:text-slate-950 transition-colors">
                  Houses
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=apartment" className="hover:text-slate-950 transition-colors">
                  Apartment
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=commercial" className="hover:text-slate-950 transition-colors">
                  Office
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=villa" className="hover:text-slate-950 transition-colors">
                  Villa
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-500 leading-relaxed font-medium">
              <p className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-[#e76f51] shrink-0" />
                <span>+1 (800) 486-3760 (Toll Free)</span>
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-[#e76f51] shrink-0" />
                <span>hello@realestate.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bottom Sub-Footer Bar with Socials & Legal */}
        <div className="border-t border-slate-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-[#111827] transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#111827] transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#111827] transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#111827] transition-colors" aria-label="LinkedIn">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Legal and Copyright */}
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/properties" className="hover:text-slate-800 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/properties" className="hover:text-slate-800 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <p>© 2026 Real Estate Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
