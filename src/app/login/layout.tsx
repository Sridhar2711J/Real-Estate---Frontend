import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Your Account',
  description:
    'Sign in to your Real Estate account to manage your listings, view inquiries, and browse saved luxury properties.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

