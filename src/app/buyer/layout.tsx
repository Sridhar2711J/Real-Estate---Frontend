import React from 'react';
import BuyerAccountSidebar from '@/components/layout/BuyerAccountSidebar';

export const metadata = {
  title: 'Buyer Portal | Real Estate',
  description: 'Buyer account management, saved bookmarks, and property inquiries.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Buyer Navigation Sidebar - Sticky / Stationary, does NOT scroll away */}
          <div className="w-full lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 shrink-0 select-none">
            <BuyerAccountSidebar />
          </div>

          {/* Right Column: Buyer Active Page Content - Scrollable with hidden scrollbar */}
          <main className="w-full lg:col-span-8 xl:col-span-9 min-w-0 no-scrollbar overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
