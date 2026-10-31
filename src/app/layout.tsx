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

export const metadata: Metadata = {
  title: 'Humero. | Find Your Perfect Home',
  description:
    "Let's find your perfect home for you. Search verified modern luxury villas, apartments, and residential homes.",
  keywords: [
    'Humero real estate',
    'Properties by cities',
    'Luxury homes',
    'Modern villas',
    'Real estate marketplace'
  ],
  authors: [{ name: 'Humero Real Estate' }],
  openGraph: {
    title: "Humero. | Let's find your perfect home for you.",
    description: 'From as low as $10 per day with limited time offer discounts.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
