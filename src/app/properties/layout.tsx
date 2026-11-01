import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Verified Properties & Luxury Real Estate',
  description:
    'Search and filter verified luxury apartments, modern villas, penthouses, and residences across Pune, Mumbai, Bangalore, Hyderabad, and Delhi NCR. Direct seller contact with 0% brokerage options.',
  keywords: [
    'Properties for sale',
    'Luxury apartments Pune',
    'Villas in Mumbai',
    'Real estate listings',
    'Buy luxury flats',
    'Verified residential homes',
  ],
  openGraph: {
    title: 'Explore Verified Properties & Luxury Real Estate | Real Estate',
    description:
      'Browse through hundreds of verified luxury properties with instant tour scheduling and transparent pricing.',
    url: '/properties',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Real Estate Property Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Verified Properties & Luxury Real Estate',
    description: 'Find verified apartments, villas, and modern residential homes.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
  },
  alternates: {
    canonical: '/properties',
  },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

