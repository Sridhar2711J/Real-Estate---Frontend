import { apiClient } from './api';
import { Property, PropertyFilterParams } from '@/types';

export interface PropertyListResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  totalPages?: number;
  viewMode?: 'seller_own_properties' | 'buyer_public_properties';
  properties: Property[];
  message?: string;
}

export interface SinglePropertyResponse {
  success: boolean;
  property: Property;
  message?: string;
}

export interface SellerPropertiesResponse {
  success: boolean;
  stats?: {
    total: number;
    active: number;
    sold: number;
    inactive: number;
  };
  count: number;
  properties: Property[];
  message?: string;
}

export interface PropertyImageUploadResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export const propertyService = {
  /**
   * Fetch properties list:
   * - Unauthenticated or Buyer: returns all available properties
   * - Seller: returns only the logged-in seller's properties
   */
  async getProperties(params?: PropertyFilterParams & { all?: boolean; status?: string; page?: number; limit?: number; sellerId?: string }): Promise<PropertyListResponse> {
    const query = new URLSearchParams();

    if (params) {
      if (params.slug) query.set('slug', params.slug);
      if (params.city && params.city !== 'all') query.set('city', params.city);
      if (params.propertyType && params.propertyType !== 'all') query.set('propertyType', params.propertyType);
      if (params.listingType) query.set('listingType', params.listingType);
      if (params.minPrice) query.set('minPrice', String(params.minPrice));
      if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
      if (params.bedrooms && params.bedrooms !== 'all') query.set('bedrooms', String(params.bedrooms));
      if (params.sort) query.set('sort', params.sort);
      if (params.searchQuery) query.set('searchQuery', params.searchQuery);
      if (params.status) query.set('status', params.status);
      if (params.all) query.set('all', 'true');
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';
    return apiClient<PropertyListResponse>(endpoint, { method: 'GET' });
  },

  /**
   * Get properties owned by the authenticated seller along with dashboard counts
   */
  async getMyProperties(): Promise<SellerPropertiesResponse> {
    return apiClient<SellerPropertiesResponse>('/properties/seller/my-properties', { method: 'GET' });
  },

  /**
   * Get single property details by ID or Slug
   */
  async getPropertyById(idOrSlug: string): Promise<SinglePropertyResponse> {
    return apiClient<SinglePropertyResponse>(`/properties/${encodeURIComponent(idOrSlug)}`, { method: 'GET' });
  },

  /**
   * Alias: Get property by slug
   */
  async getPropertyBySlug(slug: string): Promise<SinglePropertyResponse> {
    return apiClient<SinglePropertyResponse>(`/properties/${encodeURIComponent(slug)}`, { method: 'GET' });
  },

  /**
   * Create a new property listing (Seller only)
   */
  async createProperty(data: Partial<Property>): Promise<SinglePropertyResponse> {
    return apiClient<SinglePropertyResponse>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing property listing (Owner Seller only)
   */
  async updateProperty(id: string, data: Partial<Property>): Promise<SinglePropertyResponse> {
    return apiClient<SinglePropertyResponse>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an existing property listing (Owner Seller only)
   */
  async deleteProperty(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Upload property photo as WebP
   */
  async uploadImage(file: File): Promise<PropertyImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient<PropertyImageUploadResponse>('/properties/upload-image', {
      method: 'POST',
      body: formData,
    });
  },
};

export default propertyService;

