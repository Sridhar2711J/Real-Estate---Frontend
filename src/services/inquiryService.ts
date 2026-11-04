import { apiClient } from './api';
import { Inquiry } from '@/types';

export interface CreateInquiryData {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  honeypotWebsite?: string;
  propertyTitle?: string;
  propertySlug?: string;
  propertyCity?: string;
  propertyCoverImage?: string;
}

export interface InquiryFilterParams {
  status?: string;
  search?: string;
  searchQuery?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
}

export interface InquiryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InquiryStatusCounts {
  all: number;
  new: number;
  read: number;
  replied: number;
  unread: number;
}

export interface InquiryListResponse {
  success: boolean;
  inquiries: Inquiry[];
  pagination: InquiryPagination;
  counts: InquiryStatusCounts;
}

export interface InquiryCountResponse {
  success: boolean;
  total: number;
  unread: number;
  countNew: number;
  countReplied: number;
}

export interface InquiryDetailResponse {
  success: boolean;
  inquiry: Inquiry;
}

export interface InquiryActionResponse {
  success: boolean;
  message: string;
  inquiry?: Inquiry;
}

export const inquiryService = {
  /**
   * 1. Submit Inquiry
   */
  async submitInquiry(data: CreateInquiryData): Promise<InquiryActionResponse> {
    const res = await apiClient<InquiryActionResponse>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inquiry:updated'));
    }

    return res;
  },

  /**
   * 2. Get paginated inquiries with backend search and filtering
   */
  async getInquiries(params: InquiryFilterParams = {}): Promise<InquiryListResponse> {
    const query = new URLSearchParams();

    if (params.status && params.status !== 'all') {
      query.set('status', params.status);
    }
    const q = params.searchQuery || params.search;
    if (q && q.trim()) {
      query.set('search', q.trim());
    }
    if (params.propertyId) {
      query.set('propertyId', params.propertyId);
    }
    if (params.page) {
      query.set('page', String(params.page));
    }
    if (params.limit) {
      query.set('limit', String(params.limit));
    }

    const qs = query.toString();
    const endpoint = `/inquiries${qs ? `?${qs}` : ''}`;
    return apiClient<InquiryListResponse>(endpoint, { method: 'GET' });
  },

  /**
   * 3. Get quick inquiry counts for sidebar badges
   */
  async getInquiryCounts(): Promise<InquiryCountResponse> {
    return apiClient<InquiryCountResponse>('/inquiries/count', { method: 'GET' });
  },

  /**
   * 4. Get single inquiry by ID
   */
  async getInquiryById(id: string): Promise<InquiryDetailResponse> {
    return apiClient<InquiryDetailResponse>(`/inquiries/${id}`, { method: 'GET' });
  },

  /**
   * 5. Update status or reply to inquiry (Seller)
   */
  async updateInquiryStatus(
    id: string,
    status?: 'new' | 'read' | 'replied',
    replyMessage?: string
  ): Promise<InquiryActionResponse> {
    const res = await apiClient<InquiryActionResponse>(`/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, replyMessage }),
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inquiry:updated'));
    }

    return res;
  },

  /**
   * 6. Delete inquiry
   */
  async deleteInquiry(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient<{ success: boolean; message: string }>(`/inquiries/${id}`, {
      method: 'DELETE',
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inquiry:updated'));
    }

    return res;
  },
};

export default inquiryService;

