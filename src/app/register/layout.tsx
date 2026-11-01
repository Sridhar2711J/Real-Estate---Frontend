import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account | Join Real Estate Platform',
  description:
    'Join 50,000+ happy residents and property owners. Post properties for free or search verified luxury apartments and villas.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

