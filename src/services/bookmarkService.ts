import { apiClient } from './api';
import { Property } from '@/types';

export interface BookmarkItem {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: Property;
}

export interface BookmarkActionResponse {
  success: boolean;
  message: string;
  bookmark?: BookmarkItem;
  bookmarkCount: number;
  propertyId?: string;
  isBookmarked: boolean;
}

export const bookmarkService = {
  /**
   * 1. ADD: Add a property to bookmarks (Buyer only)
   */
  async addBookmark(propertyId: string): Promise<BookmarkActionResponse> {
    return apiClient<BookmarkActionResponse>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  /**
   * 2. REMOVE: Remove a bookmark by Bookmark ID or Property ID (Buyer only)
   */
  async removeBookmark(idOrPropertyId: string): Promise<BookmarkActionResponse> {
    return apiClient<BookmarkActionResponse>(`/bookmarks/${idOrPropertyId}`, {
      method: 'DELETE',
    });
  },
};

export default bookmarkService;
