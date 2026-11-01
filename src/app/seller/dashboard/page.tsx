import type { Metadata } from 'next';
import SellerDashboardClient from './SellerDashboardClient';

export const metadata: Metadata = {
  title: 'Seller Dashboard | Real Estate',
  description: 'Overview of listing performance, inquiries, and property portfolio.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellerDashboardPage() {
  return <SellerDashboardClient />;
}

