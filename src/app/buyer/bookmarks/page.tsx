import type { Metadata } from 'next';
import BookmarksClient from './BookmarksClient';

export const metadata: Metadata = {
  title: 'Saved Bookmarks | Real Estate',
  description: 'View and manage your saved and favorited properties.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}

