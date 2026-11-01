import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://realnest.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Real Estate | Let's find your perfect home",
    template: '%s | Real Estate',
  },
  description:
    "Let's find your perfect home for you. Search verified modern luxury villas, apartments, and residential homes with transparent pricing.",
  keywords: [
    'Real Estate',
    'Luxury homes',
    'Modern villas',
    'Apartments for sale',
    'Properties by cities',
    'Real estate marketplace',
    'Verified residential listings',
  ],
  authors: [{ name: 'Real Estate Platform' }],
  creator: 'Real Estate',
  publisher: 'Real Estate',
  formatDetection: {
    email: false,
    address: true,
    telephone: false,
  },
  openGraph: {
    title: "Real Estate | Let's find your perfect home for you.",
    description: 'From as low as $10 per day with limited time offer discounts. Verified luxury homes and apartments.',
    url: siteUrl,
    siteName: 'Real Estate',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Real Estate - Find Your Dream Luxury Home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Real Estate | Let's find your perfect home for you.",
    description: 'Search verified modern luxury villas, apartments, and residential homes.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon-square.webp',
    shortcut: '/favicon.ico',
    apple: '/favicon-square.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Real Estate',
        description: 'Verified luxury homes, apartments, and modern villas for sale and rent.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/properties?searchQuery={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'RealEstateAgent',
        '@id': `${siteUrl}/#organization`,
        name: 'Real Estate Platform',
        url: siteUrl,
        logo: `${siteUrl}/favicon-square.webp`,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        priceRange: '₹₹₹₹',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans selection:bg-[#e76f51] selection:text-white">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
