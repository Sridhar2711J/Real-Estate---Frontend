import type { Metadata } from 'next';
import SellerPropertiesClient from './SellerPropertiesClient';

export const metadata: Metadata = {
  title: 'My Properties | Seller Portal',
  description: 'Manage property listings, statuses, prices, and inventory.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellerPropertiesPage() {
  return <SellerPropertiesClient />;
}

