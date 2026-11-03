'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';
import Toast, { ToastType } from '@/components/common/Toast';
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard steps: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; title?: string; type: ToastType } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await userService.forgotPassword(email.trim().toLowerCase());
      if (res && res.success) {
        setToast({
          type: 'info',
          title: 'OTP Dispatched',
          message: 'A 6-digit verification code has been sent to your email.',
        });
        setStep(2);
        setResendCooldown(60);
      } else {
        setError(res?.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await userService.verifyOtp(email.trim().toLowerCase(), cleanOtp);
      if (res && res.success) {
        setToast({
          type: 'success',
          title: 'Code Verified',
          message: 'Code accepted! Please choose your new password.',
        });
        setStep(3);
      } else {
        setError(res?.message || 'Invalid or expired code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await userService.forgotPassword(email.trim().toLowerCase());
      if (res && res.success) {
        setToast({
          type: 'info',
          title: 'Code Resent',
          message: 'A new 6-digit verification code was sent to your email.',
        });
        setResendCooldown(60);
      } else {
        setError(res?.message || 'Failed to resend code.');
      }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await userService.resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        newPassword
      );

      if (res && res.success) {
        setToast({
          type: 'success',
          title: 'Password Reset Successful!',
          message: 'Your password has been updated. Redirecting to login...',
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(res?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row bg-white text-slate-900 font-sans relative md:overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* LEFT SPLIT PANEL: Architectural Branding Showcase */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:h-full flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-slate-950 shrink-0">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
          alt="Modern Architecture"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />

        {/* Top-Left: Brand Link */}
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

        {/* Bottom Banner */}
        <div className="relative z-10 max-w-lg mt-auto pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-semibold mb-4 border border-white/20">
            <Lock className="w-3.5 h-3.5 text-[#e76f51]" />
            <span>End-to-End Account Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Reset Your Access With One-Time Verification
          </h1>
          <p className="mt-3 text-sm text-slate-200/90 leading-relaxed drop-shadow-sm">
            We use multi-factor temporary codes to ensure only authorized property buyers and verified sellers access account data.
          </p>
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: Step Wizard */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 lg:px-14 lg:py-10 bg-white overflow-y-auto">
        {/* Top navigation */}
        <div className="flex items-center justify-between gap-3 w-full pb-4 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#e76f51] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1 ? 'bg-[#e76f51] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}>
              1
            </span>
            <span className="w-3 h-0.5 bg-slate-200" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2 ? 'bg-[#e76f51] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}>
              2
            </span>
            <span className="w-3 h-0.5 bg-slate-200" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 3 ? 'bg-[#e76f51] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}>
              3
            </span>
          </div>
        </div>

        {/* Wizard Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          {/* Header */}
          <div className="text-left mb-6">
            <div className="w-11 h-11 rounded-lg bg-[#fef0eb] text-[#e76f51] flex items-center justify-center mb-3 border border-[#e76f51]/20">
              {step === 1 && <Mail className="w-5 h-5" />}
              {step === 2 && <KeyRound className="w-5 h-5" />}
              {step === 3 && <Lock className="w-5 h-5" />}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Create New Password'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {step === 1 && 'Enter your registered email address to receive a 6-digit OTP code.'}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && 'Choose a secure password of at least 6 characters.'}
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-5 p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              {error}
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-10 px-3.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                  />
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
                  <span>Send Verification Code</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="otp" className="block text-xs font-bold text-slate-700">
                    6-Digit Verification Code <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-[#e76f51] hover:underline font-semibold"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full h-12 text-center text-2xl font-black tracking-[8px] rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn&apos;t receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="inline-flex items-center gap-1 font-bold text-[#e76f51] hover:text-[#d85e40] disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-10 px-4 rounded-md bg-[#e76f51] hover:bg-[#d85e40] text-white text-sm font-bold tracking-wide transition-all shadow-sm shadow-[#e76f51]/25 hover:shadow-md hover:shadow-[#e76f51]/35 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full h-10 pl-3.5 pr-10 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    className="w-full h-10 pl-3.5 pr-10 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e76f51] focus:ring-2 focus:ring-[#e76f51]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}

          {/* Bottom link to login */}
          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            <span>Remember your password? </span>
            <Link
              href="/login"
              className="text-[#e76f51] hover:text-[#d85e40] font-bold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-4 font-medium shrink-0">
          Protected by Realnest Auth Security • SSL 256-bit Encryption
        </div>
      </div>
    </div>
  );
}

