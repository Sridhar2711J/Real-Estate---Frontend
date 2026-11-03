import React from 'react';
import SellerAccountSidebar from '@/components/layout/SellerAccountSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="h-[calc(100vh-5rem)] bg-slate-50/60 overflow-hidden flex flex-col">
        <div className="w-full flex-1 min-h-0 px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full min-h-0">
            {/* Left Column: Seller Account Navigation Sidebar - Stationary / Does NOT scroll */}
            <div className="w-full lg:col-span-4 xl:col-span-3 pt-4 sm:pt-6 lg:py-6 shrink-0 self-start select-none">
              <SellerAccountSidebar />
            </div>

            {/* Right Column: Active Page Content - ONLY this position scrolls vertically (scrollbar completely hidden) */}
            <main className="w-full lg:col-span-8 xl:col-span-9 min-w-0 min-h-0 h-full overflow-y-auto overflow-x-hidden pt-2 pb-16 lg:py-6 pr-2 lg:pr-3 no-scrollbar focus:outline-none">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
