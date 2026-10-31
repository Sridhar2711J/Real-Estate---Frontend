'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  ArrowUpRight,
  PlusCircle,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Heart
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, savedPropertyIds, getMyInquiries } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hide on login/register split screens
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const myInquiries = getMyInquiries();
  const unreadInquiriesCount = myInquiries.filter((i) => i.status === 'new').length;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Hamburger Icon + Humero. Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-900 hover:text-slate-600 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Name "Humero." */}
            <Link href="/" className="flex items-center group">
              <span className="text-2xl sm:text-[26px] font-black tracking-tight text-[#111827]">
                Humero<span className="text-[#111827]">.</span>
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links matching image (Home ⌵, About ⌵, Property ⌵, Agent ⌵, Pages ⌵, Contact) */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-slate-700">
            <div className="flex items-center gap-1 hover:text-slate-950 cursor-pointer transition-colors">
              <Link href="/" className={pathname === '/' ? 'text-slate-950 font-bold' : ''}>
                Home
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1 hover:text-slate-950 cursor-pointer transition-colors">
              <Link href="/properties">
                About
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1 hover:text-slate-950 cursor-pointer transition-colors">
              <Link
                href="/properties"
                className={pathname === '/properties' ? 'text-slate-950 font-bold' : ''}
              >
                Property
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1 hover:text-slate-950 cursor-pointer transition-colors">
              <Link href="/properties">
                Agent
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1 hover:text-slate-950 cursor-pointer transition-colors">
              <Link href="/properties">
                Pages
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <Link href="/properties" className="hover:text-slate-950 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action: Signin / Signup & "Add property ↗" */}
          <div className="hidden sm:flex items-center gap-6">
            {/* Wishlist Link */}
            <Link
              href="/properties?savedOnly=true"
              className="relative p-2 text-slate-600 hover:text-rose-600 transition-colors"
              title="Saved properties"
            >
              <Heart className="w-5 h-5" />
              {savedPropertyIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedPropertyIds.length}
                </span>
              )}
            </Link>

            {/* Signin / Signup link or User profile dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-800"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 relative">
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
                  <span className="text-xs font-bold max-w-[100px] truncate text-slate-900">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md">
                    {user.role === 'seller' ? 'Seller' : 'Buyer'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full capitalize">
                        {user.role === 'seller' ? 'Seller' : 'Buyer'} Account
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        My Dashboard
                      </Link>
                      <Link
                        href="/dashboard/inquiries"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          Received Inquiries
                        </span>
                        {unreadInquiriesCount > 0 && (
                          <span className="bg-[#e76f51] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {unreadInquiriesCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
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

            {/* "Add property ↗" button matching image */}
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-900 text-slate-950 hover:bg-slate-950 hover:text-white transition-all text-[13px] font-bold shadow-2xs group"
            >
              <span>Add property</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/dashboard/properties/new"
              className="p-2 rounded-xl border border-slate-900 text-slate-900"
              title="Add property"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-5 pt-4 pb-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-800">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Home
            </Link>
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="py-1">
              About
            </Link>
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Property
            </Link>
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Agent
            </Link>
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Pages
            </Link>
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)} className="py-1">
              Contact
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-slate-900 text-white"
              >
                Signin / Signup
              </Link>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 text-slate-800"
              >
                Open Dashboard ({user.role})
              </Link>
            )}

            <Link
              href="/dashboard/properties/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-900 text-slate-900 flex items-center justify-center gap-1.5"
            >
              <span>Add property</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
