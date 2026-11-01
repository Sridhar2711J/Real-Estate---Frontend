import type { Metadata } from 'next';
import SellerProfileClient from './SellerProfileClient';

export const metadata: Metadata = {
  title: 'Seller Profile | Seller Portal',
  description: 'Manage seller credentials, agency information, contact details, and listing verification.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellerProfilePage() {
  return <SellerProfileClient />;
}

