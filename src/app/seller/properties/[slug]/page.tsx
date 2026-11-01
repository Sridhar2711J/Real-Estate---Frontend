import type { Metadata } from 'next';
import EditPropertyClient from './EditPropertyClient';

interface EditPropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditPropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Edit Property | Seller Portal`,
    description: `Manage listing information, pricing, status, and features for property ${slug}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function EditPropertyPage() {
  return <EditPropertyClient />;
}

