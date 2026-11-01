import type { Metadata } from 'next';
import BuyerInquiriesClient from './BuyerInquiriesClient';

export const metadata: Metadata = {
  title: 'My Inquiries | Real Estate',
  description: 'View and track all inquiries and tour requests sent for properties.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuyerInquiriesPage() {
  return <BuyerInquiriesClient />;
}

