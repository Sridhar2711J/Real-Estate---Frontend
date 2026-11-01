import type { Metadata } from 'next';
import BuyerProfileClient from './BuyerProfileClient';

export const metadata: Metadata = {
  title: 'My Profile | Real Estate',
  description: 'Manage your user profile and personal contact details.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuyerProfilePage() {
  return <BuyerProfileClient />;
}

