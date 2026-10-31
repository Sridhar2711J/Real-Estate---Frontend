'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('info.madhu786@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (type: 'buyer' | 'seller') => {
    quickLogin(type);
    if (type === 'seller') {
      setEmail('info.madhu786@gmail.com');
    } else {
      setEmail('priya.verma@example.com');
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white text-slate-900 font-sans">
      {/* LEFT SPLIT PANEL: Architectural Villa with Water Reflection matching provided image */}
      <div className="relative w-full md:w-1/2 min-h-[420px] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-slate-950">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/login-hero.jpg"
            alt="Realnest Modern Architecture House at Dusk with Water Reflection"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle gradient overlay to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />
        </div>

        {/* Top-Left: Real Estate Logo Badge */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform bg-white/95 p-1">
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

        {/* Bottom-Left: Find your sweet home Title & Carousel Dots */}
        <div className="relative z-10 max-w-lg mt-auto pt-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            Find your sweet home
          </h1>
          <div className="mt-3 text-sm sm:text-base text-slate-200/95 font-normal leading-relaxed drop-shadow-sm">
            <p>Schedule visit in just a few clicks</p>
            <p className="text-xs text-slate-300/80">visits in just a few clicks</p>
          </div>

          {/* Carousel indicators matching image (pill + 2 dots) */}
          <div className="mt-8 flex items-center gap-2">
            <div className="w-8 h-2 rounded-full bg-white transition-all shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
          </div>
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: Form Area matching provided image */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        {/* Top Right Action: Sign in pill button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full pb-6">
          <Link
            href="/"
            className="sm:hidden text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            ← Back to Home
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-slate-950 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Sign in
          </Link>
        </div>

        {/* Main Form Center */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          <div className="text-left mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Welcome Back to Realnest!
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-normal">
              Sign in your account
            </p>
          </div>

          {/* Demo Quick Fill Switcher */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick 1-Click Demo Login:
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                No typing needed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('seller')}
                className="py-1.5 px-3 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-900 hover:text-white transition-colors text-center shadow-xs"
              >
                Seller (Madhu)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('buyer')}
                className="py-1.5 px-3 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-900 hover:text-white transition-colors text-center shadow-xs"
              >
                Buyer (Priya)
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Your Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Your Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info.madhu786@gmail.com"
                  required
                  className="w-full h-11 px-4 text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 accent-slate-900 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset link sent to ' + email)}
                className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Big Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-950 text-white text-sm font-bold tracking-wide hover:bg-slate-800 transition-all shadow-md shadow-slate-950/15 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider: ------- Instant Login ------- */}
          <div className="relative my-7 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-4 text-xs text-slate-400 font-medium tracking-wider">
              Instan Login
            </span>
          </div>

          {/* Social Login Buttons side-by-side matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickDemo('seller')}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {/* Google G Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {/* Facebook Icon */}
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Footer: Don't have any acount? Register */}
          <div className="mt-10 text-center text-xs text-slate-500">
            <span>Don&apos;t have any acount? </span>
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Bottom subtle note */}
        <div className="text-center text-[11px] text-slate-400 pt-4">
          Protected by Realnest Auth Security • SSL 256-bit Encryption
        </div>
      </div>
    </div>
  );
}

