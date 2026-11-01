import type { Metadata } from 'next';
import AddPropertyClient from './AddPropertyClient';

export const metadata: Metadata = {
  title: 'Add New Property | Seller Portal',
  description: 'Create and publish a new property listing with specifications and images.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddPropertyPage() {
  return <AddPropertyClient />;
}

