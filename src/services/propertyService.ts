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

export interface SellerPropertiesParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  search?: string;
  status?: string;
  propertyType?: string;
  city?: string;
  sort?: string;
  slug?: string;
}

export interface SellerPropertiesResponse {
  success: boolean;
  stats?: {
    total: number;
    active: number;
    sold: number;
    inactive: number;
  };
  cities?: string[];
  propertyTypes?: string[];
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  count: number;
  properties: Property[];
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
   * Get properties owned by the authenticated seller along with dashboard counts, filters, and pagination
   */
  async getMyProperties(params?: SellerPropertiesParams): Promise<SellerPropertiesResponse> {
    const query = new URLSearchParams();

    if (params) {
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.searchQuery) query.set('searchQuery', params.searchQuery);
      if (params.search) query.set('search', params.search);
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.propertyType && params.propertyType !== 'all') query.set('propertyType', params.propertyType);
      if (params.city && params.city !== 'all') query.set('city', params.city);
      if (params.sort) query.set('sort', params.sort);
      if (params.slug) query.set('slug', params.slug);
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/properties/seller/my-properties?${queryString}` : '/properties/seller/my-properties';
    return apiClient<SellerPropertiesResponse>(endpoint, { method: 'GET' });
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
  async createProperty(data: Partial<Property> | FormData): Promise<SinglePropertyResponse> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return apiClient<SinglePropertyResponse>('/properties', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Update an existing property listing (Owner Seller only)
   */
  async updateProperty(id: string, data: Partial<Property> | FormData): Promise<SinglePropertyResponse> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return apiClient<SinglePropertyResponse>(`/properties/${id}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
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
};

export default propertyService;

