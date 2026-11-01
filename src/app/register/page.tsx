'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    title: 'Join 50,000+ Happy Residents',
    subtitle: 'Post properties for free or find your next dream home',
    subnote: 'Direct connection • Verified listings • Zero hidden charges',
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    title: 'Sell & Lease with Confidence',
    subtitle: 'Reach thousands of verified buyers and active tenants',
    subnote: 'Instant inquiries • Seamless management • Zero commission options',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('seller');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, phone, role });
      if (res.success) {
        router.push('/dashboard');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white text-slate-900 font-sans">
      {/* LEFT SPLIT PANEL: Interactive Cursor-Based Carousel */}
      <div className="relative w-full md:w-1/2 min-h-[420px] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-slate-950">
        {/* Background Images Carousel with smooth crossfade */}
        {CAROUSEL_SLIDES.map((slide, idx) => (
          <div
            key={slide.image}
            className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${
              currentSlide === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover object-center"
            />
            {/* Subtle gradient overlay to make text pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
          </div>
        ))}

        {/* Top-Left: Real Estate Logo Badge */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-md overflow-hidden shadow-lg group-hover:scale-105 transition-transform bg-white/95 p-1">
              <Image
                src="/favicon-square.webp"
                alt="Real Estate Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
              Real Estate
            </span>
          </Link>
        </div>

        {/* Bottom-Left: Dynamic Content & Cursor-Based Indicators */}
        <div className="relative z-10 max-w-lg mt-auto pt-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md transition-all duration-300">
            {CAROUSEL_SLIDES[currentSlide].title}
          </h1>
          <div className="mt-3 text-sm sm:text-base text-slate-200/95 font-medium leading-relaxed drop-shadow-sm">
            <p>{CAROUSEL_SLIDES[currentSlide].subtitle}</p>
            <p className="text-xs text-slate-300/80 font-normal mt-0.5">{CAROUSEL_SLIDES[currentSlide].subnote}</p>
          </div>

          {/* Interactive Cursor-Based Carousel Controls (clickable dots + arrows) */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-md transition-all cursor-pointer ${
                    currentSlide === idx
                      ? 'w-8 bg-[#e76f51] shadow-sm'
                      : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous slide"
                className="w-8 h-8 rounded-md bg-black/40 hover:bg-[#e76f51] backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next slide"
                className="w-8 h-8 rounded-md bg-black/40 hover:bg-[#e76f51] backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="flex items-center justify-between gap-3 w-full pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#e76f51] transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm shadow-[#e76f51]/20 transition-all"
          >
            Sign in
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-2">
          <div className="text-left mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create an Account
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Get started with free property search and listings
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-md border transition-all text-center cursor-pointer ${
                    role === 'seller'
                      ? 'border-[#e76f51] bg-[#e76f51] text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#e76f51]/50 hover:text-[#e76f51]'
                  }`}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-md border transition-all text-center cursor-pointer ${
                    role === 'buyer'
                      ? 'border-[#e76f51] bg-[#e76f51] text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#e76f51]/50 hover:text-[#e76f51]'
                  }`}
                >
                  Buyer
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Madhu Sharma"
                required
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info.madhu786@gmail.com"
                required
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full h-10 pl-3.5 pr-10 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 px-4 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-sm font-bold tracking-wide transition-all shadow-sm shadow-[#e76f51]/25 hover:shadow-md hover:shadow-[#e76f51]/35 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Register &amp; Continue</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            <span>Already have an account? </span>
            <Link href="/login" className="text-[#e76f51] hover:text-[#d85e40] font-bold hover:underline transition-colors">
              Log in
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 pt-4 font-medium">
          By signing up, you agree to Realnest Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

