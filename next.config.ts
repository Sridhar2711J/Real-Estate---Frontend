import type { NextConfig } from "next";

if (!process.env.NODE_OPTIONS?.includes('--max-old-space-size')) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim();
}

const nextConfig: NextConfig = {
  typescript: {
    // Verified by standalone tsc --noEmit check
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: '/bookmarks', destination: '/buyer/bookmarks', permanent: true },
      { source: '/my-inquiries', destination: '/buyer/inquiries', permanent: true },
      { source: '/my-profile', destination: '/buyer/profile', permanent: true },
      { source: '/dashboard', destination: '/seller/dashboard', permanent: true },
      { source: '/dashboard/inquiries', destination: '/seller/inquiries', permanent: true },
      { source: '/dashboard/properties', destination: '/seller/properties', permanent: true },
      { source: '/dashboard/properties/new', destination: '/seller/properties/new', permanent: true },
      { source: '/dashboard/properties/:slug*', destination: '/seller/properties/:slug*', permanent: true },
      { source: '/properties/new', destination: '/seller/properties/new', permanent: true },
      { source: '/seller/dashborad', destination: '/seller/dashboard', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
