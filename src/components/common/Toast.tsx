'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  message,
  title,
  type = 'success',
  duration = 2000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      container: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      progress: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      container: 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10',
      badge: 'bg-rose-50 text-rose-700 border border-rose-100',
      progress: 'bg-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      container: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
      badge: 'bg-amber-50 text-amber-700 border border-amber-100',
      progress: 'bg-amber-500',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      container: 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10',
      badge: 'bg-blue-50 text-blue-700 border border-blue-100',
      progress: 'bg-blue-500',
    },
  };

  const current = typeConfig[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[calc(100%-2rem)] sm:w-auto min-w-[320px] sm:min-w-[380px] pointer-events-auto transition-all duration-300 ease-out"
    >
      <div
        className={`flex items-start gap-3.5 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 ${current.container}`}
      >
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${current.badge}`}>
          {current.icon}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          {title && (
            <h4 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">
              {title}
            </h4>
          )}
          <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

