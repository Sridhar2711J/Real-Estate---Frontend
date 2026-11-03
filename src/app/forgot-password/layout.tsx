import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Reset Your Account Security',
  description:
    'Reset your password securely with a one-time verification code (OTP). Verify your identity and restore access to your Real Estate account.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/forgot-password',
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
