import { apiClient } from './api';
import { Property } from '@/types';

export interface BookmarkItem {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: Property;
}

export interface BookmarksResponse {
  success: boolean;
  count: number;
  bookmarks: BookmarkItem[];
}

export const bookmarkService = {
  /**
   * 1. GET: Fetch all bookmarks for the authenticated buyer
   */
  async getBookmarks(): Promise<BookmarksResponse> {
    return apiClient<BookmarksResponse>('/bookmarks');
  },

  /**
   * 2. ADD: Add a property to bookmarks
   */
  async addBookmark(propertyId: string): Promise<{ success: boolean; message: string; bookmark: BookmarkItem }> {
    return apiClient<{ success: boolean; message: string; bookmark: BookmarkItem }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  /**
   * 3. REMOVE: Remove a bookmark by Bookmark ID or Property ID
   */
  async removeBookmark(idOrPropertyId: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/bookmarks/${idOrPropertyId}`, {
      method: 'DELETE',
    });
  },
};

export default bookmarkService;
