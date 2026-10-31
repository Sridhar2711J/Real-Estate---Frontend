export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
export type ListingType = 'sale' | 'rent';
export type ListingStatus = 'active' | 'sold' | 'inactive';
export type InquiryStatus = 'new' | 'read' | 'replied';

export interface PropertyImage {
  id: string;
  url: string;
  sortOrder?: number;
  caption?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  features?: string[];
  price: number;
  propertyType: string;
  city: string;
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;

  images: PropertyImage[];
  coverImage: string;

  ownerId: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  propertyCity: string;
  propertyCoverImage?: string;
  senderId?: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  dedupeKey?: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface PropertyFilterParams {
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
  searchQuery?: string;
}

