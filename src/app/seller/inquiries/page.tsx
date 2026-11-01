import type { Metadata } from 'next';
import SellerInquiriesClient from './SellerInquiriesClient';

export const metadata: Metadata = {
  title: 'Seller Inquiries | Real Estate',
  description: 'Manage and respond to buyer inquiries and tour bookings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellerInquiriesPage() {
  return <SellerInquiriesClient />;
}

