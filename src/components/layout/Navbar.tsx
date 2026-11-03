'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronDown,
  User as UserIcon,
  ArrowUpRight,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Heart,
  Building2,
  PlusCircle,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const auth = useAuth() as any;
  const user = auth?.user;
  const logout = auth?.logout || (() => {});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localSavedIds, setLocalSavedIds] = useState<string[]>([]);

  React.useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('realnest_saved_properties') : null;
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          setLocalSavedIds(ids);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Hide on auth split screens
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    return null;
  }

  const isSellerPortal = pathname.startsWith('/seller');
  const myInquiries = typeof auth?.getMyInquiries === 'function' ? auth.getMyInquiries() : [];
  const unreadInquiriesCount = Array.isArray(myInquiries)
    ? myInquiries.filter((i: any) => i.status === 'new').length
    : 0;
  const safeSavedIds = Array.isArray(auth?.savedPropertyIds) ? auth.savedPropertyIds : localSavedIds;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      {/* Full width container matching user request */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Logo + Title */}
          {isSellerPortal ? (
            /* Seller Portal Brand Link (Navigates to Seller Dashboard, NO Buyer Home link) */
            <Link href="/seller/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-md overflow-hidden shrink-0">
                <Image
                  src="/favicon-square.webp"
                  alt="Real Estate Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#111827]">
                  Real Estate
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fef0eb] text-[#e76f51] border border-[#e76f51]/30">
                  Seller Portal
                </span>
              </div>
            </Link>
          ) : (
            /* Buyer / Public Site Brand Link (Navigates to Home Page) */
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-md overflow-hidden shrink-0">
                <Image
                  src="/favicon-square.webp"
                  alt="Real Estate Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#111827]">
                Real Estate
              </span>
            </Link>
          )}

          {/* Right Action: Seller Actions OR Buyer/Public Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Wishlist Link - SHOWN ONLY ON BUYER SITE, NOT ON SELLER PORTAL */}
            {!isSellerPortal && (
              <Link
                href="/buyer/bookmarks"
                className="relative p-2 text-slate-600 hover:text-rose-600 transition-colors"
                title="Saved properties"
              >
                <Heart className="w-5 h-5" />
                {safeSavedIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {safeSavedIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile Pill / Dropdown OR Signin/Signup */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-800 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-200 relative shrink-0">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-600 m-1.5" />
                    )}
                  </div>
                  <span className="text-xs font-bold max-w-[90px] sm:max-w-[120px] truncate text-slate-900">
                    {(user.name || user.email || 'User').split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded capitalize">
                        {isSellerPortal || user.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
                      </span>
                    </div>

                    {isSellerPortal || user.role === 'seller' ? (
                      /* Seller Nav Only: Strictly seller options, NO buyer site or bookmarks */
                      <div className="py-1">
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          My Dashboard
                        </Link>
                        <Link
                          href="/seller/properties"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Building2 className="w-4 h-4 text-slate-500" />
                          My Properties
                        </Link>
                        <Link
                          href="/seller/inquiries"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                            Received Inquiries
                          </span>
                          {unreadInquiriesCount > 0 && (
                            <span className="bg-[#e76f51] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              {unreadInquiriesCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/seller/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          My Profile
                        </Link>
                      </div>
                    ) : (
                      /* Buyer Nav: Buyer Profile, Inquiries & Bookmarks */
                      <div className="py-1">
                        <Link
                          href="/buyer/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          My Profile
                        </Link>
                        <Link
                          href="/buyer/inquiries"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                            My Inquiries
                          </span>
                        </Link>
                        <Link
                          href="/buyer/bookmarks"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2.5">
                            <Heart className="w-4 h-4 text-slate-500" />
                            Bookmark
                          </span>
                          {safeSavedIds.length > 0 && (
                            <span className="bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              {safeSavedIds.length}
                            </span>
                          )}
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-[14px] font-semibold text-slate-800 hover:text-slate-950 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
                <span>Signin / Signup</span>
              </Link>
            )}

            {/* "Add Property" button: Styled for Seller Portal vs Public Site */}
            {!isSellerPortal && (
              <Link
                href="/seller/properties/new"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white transition-all text-xs sm:text-[13px] font-bold shadow-xs shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Property</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
