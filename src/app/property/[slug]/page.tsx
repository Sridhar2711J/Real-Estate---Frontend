import type { Metadata } from 'next';
import { INITIAL_PROPERTIES } from '@/data/mockProperties';
import PropertyDetailClient from './PropertyDetailClient';

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return INITIAL_PROPERTIES.map((property) => ({
    slug: property.id,
  }));
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = INITIAL_PROPERTIES.find((p) => p.id === slug);

  if (!property) {
    return {
      title: 'Property Not Found | Real Estate',
      description: 'The property you are looking for may have been sold or removed.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(property.price);

  const title = `${property.title} - ${property.bedrooms} BHK in ${property.location}, ${property.city}`;
  const description = `${property.bedrooms} BHK ${property.propertyType} for sale in ${property.location}, ${property.city}. Built-up area: ${property.area} sq.ft, Price: ${formattedPrice}. Verified listing with physical tour booking. ${property.description.slice(0, 140)}...`;

  const canonicalUrl = `/property/${property.id}`;
  const ogImages = [
    {
      url: property.coverImage,
      width: 1200,
      height: 630,
      alt: property.title,
    },
    ...(property.images || []).slice(0, 4).map((img, idx) => ({
      url: img.url,
      width: 1200,
      height: 800,
      alt: `${property.title} - View ${idx + 1}`,
    })),
  ];

  return {
    title,
    description,
    keywords: [
      property.title,
      `${property.bedrooms} BHK in ${property.city}`,
      `${property.bedrooms} BHK ${property.location}`,
      `${property.propertyType} for sale in ${property.city}`,
      `Luxury property in ${property.location}`,
      property.city,
      property.location,
      'Real Estate marketplace',
      'Verified property',
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      images: ogImages,
      siteName: 'Real Estate',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.coverImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = INITIAL_PROPERTIES.find((p) => p.id === slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://realnest.com';

  // Comprehensive Product & RealEstateListing Structured Data (JSON-LD) for Google Rich Snippets
  const jsonLd = property
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': ['RealEstateListing', 'SingleFamilyResidence', 'Product'],
            '@id': `${siteUrl}/property/${property.id}#listing`,
            name: property.title,
            description: property.description,
            image: [property.coverImage, ...(property.images?.map((i) => i.url) || [])],
            url: `${siteUrl}/property/${property.id}`,
            numberOfRooms: property.bedrooms,
            numberOfBathroomsTotal: property.bathrooms,
            floorSize: {
              '@type': 'QuantitativeValue',
              value: property.area,
              unitCode: 'FTK',
              unitText: 'sq ft',
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: property.address || property.location,
              addressLocality: property.city,
              addressRegion: property.location,
              addressCountry: 'IN',
            },
            geo: {
              '@type': 'GeoCoordinates',
              addressCountry: 'IN',
            },
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: 'INR',
              priceValidUntil: '2026-12-31',
              availability: 'https://schema.org/InStock',
              url: `${siteUrl}/property/${property.id}`,
              seller: {
                '@type': 'RealEstateAgent',
                name: 'Real Estate Marketplace',
                url: siteUrl,
              },
            },
            amenityFeature: (property.features || []).map((feat) => ({
              '@type': 'LocationFeatureSpecification',
              name: feat,
              value: true,
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Properties',
                item: `${siteUrl}/properties`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: property.city,
                item: `${siteUrl}/properties?city=${encodeURIComponent(property.city)}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: property.title,
                item: `${siteUrl}/property/${property.id}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PropertyDetailClient />
    </>
  );
}
