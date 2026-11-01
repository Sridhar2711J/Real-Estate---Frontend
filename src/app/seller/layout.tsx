import React from 'react';
import SellerAccountSidebar from '@/components/layout/SellerAccountSidebar';

export const metadata = {
  title: 'Seller Dashboard | Real Estate',
  description: 'Manage property listings, view buyer inquiries, and review performance analytics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Seller Account Navigation Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <SellerAccountSidebar />
          </div>

          {/* Right Column: Active Page Content */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

