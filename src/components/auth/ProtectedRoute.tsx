'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller')[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;

    // 1. Not Authenticated -> Redirect to Login
    if (!isAuthenticated || !user) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirectParam}`);
      return;
    }

    // 2. Role Check
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      if (user.role === 'buyer') {
        router.replace('/buyer/profile');
      } else if (user.role === 'seller') {
        router.replace('/seller/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isInitialized, isAuthenticated, user, allowedRoles, pathname, router]);

  // Loading state while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-[500px] w-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#e76f51] rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Verifying security session...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[500px] w-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#e76f51] rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500">
          Redirecting to login...
        </p>
      </div>
    );
  }

  // Unauthorized role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center">
        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 mb-3 border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Restricted Portal Access
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          This portal is reserved for {allowedRoles.join(' or ')} accounts. Redirecting you to your account...
        </p>
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[#e76f51] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

