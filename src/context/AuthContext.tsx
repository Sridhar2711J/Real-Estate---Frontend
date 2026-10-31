'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Property, Inquiry } from '@/types';
import { DEMO_USERS, INITIAL_PROPERTIES, INITIAL_INQUIRIES } from '@/data/mockProperties';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  properties: Property[];
  inquiries: Inquiry[];
  savedPropertyIds: string[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  quickLogin: (userType: 'buyer' | 'seller') => void;
  register: (data: { name: string; email: string; phone?: string; role: 'buyer' | 'seller' }) => Promise<{ success: boolean }>;
  logout: () => void;
  toggleSaveProperty: (propertyId: string) => void;
  isPropertySaved: (propertyId: string) => boolean;
  addProperty: (propertyData: Partial<Property>) => Property;
  updateProperty: (id: string, propertyData: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  submitInquiry: (inquiry: {
    propertyId: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    honeypotWebsite?: string;
  }) => { success: boolean; message: string };
  updateInquiryStatus: (inquiryId: string, status: 'new' | 'read' | 'replied') => void;
  getPropertyBySlug: (slug: string) => Property | undefined;
  getMyProperties: () => Property[];
  getMyInquiries: () => Inquiry[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'realnest_auth_user',
  PROPERTIES: 'realnest_properties_db',
  INQUIRIES: 'realnest_inquiries_db',
  SAVED: 'realnest_saved_props',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default user is Madhu Sharma (from login image: info.madhu786@gmail.com)
  const [user, setUser] = useState<User | null>(DEMO_USERS[0]);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(['prop-pune-001', 'prop-mumbai-001']);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage safely on client
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Pre-populate with Madhu Sharma as shown in the screenshot
        setUser(DEMO_USERS[0]);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USERS[0]));
      }

      const storedProps = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (storedProps) {
        setProperties(JSON.parse(storedProps));
      } else {
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
      }

      const storedInqs = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (storedInqs) {
        setInquiries(JSON.parse(storedInqs));
      } else {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
      }

      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (storedSaved) {
        setSavedPropertyIds(JSON.parse(storedSaved));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save changes to localStorage
  const saveUserToStorage = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const savePropertiesToStorage = (newProps: Property[]) => {
    setProperties(newProps);
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(newProps));
  };

  const saveInquiriesToStorage = (newInqs: Inquiry[]) => {
    setInquiries(newInqs);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(newInqs));
  };

  // Login handler
  const login = async (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      saveUserToStorage(matchedUser);
      return { success: true };
    }

    // Allow user to login with any valid formatted email as dynamic user
    const newUser: User = {
      id: `user-${Date.now().toString(36)}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      createdAt: new Date().toISOString(),
    };
    saveUserToStorage(newUser);
    return { success: true };
  };

  // Quick preset login helper (only Buyer and Seller)
  const quickLogin = (userType: 'buyer' | 'seller') => {
    if (userType === 'seller') {
      saveUserToStorage(DEMO_USERS[0]); // Madhu (Seller)
    } else {
      saveUserToStorage(DEMO_USERS[1]); // Priya (Buyer)
    }
  };

  // Register handler (only Buyer and Seller)
  const register = async (data: { name: string; email: string; phone?: string; role: 'buyer' | 'seller' }) => {
    const newUser: User = {
      id: `user-${Date.now().toString(36)}`,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      role: data.role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      createdAt: new Date().toISOString(),
    };
    saveUserToStorage(newUser);
    return { success: true };
  };

  const logout = () => {
    saveUserToStorage(null);
  };

  // Saved bookmark toggling
  const toggleSaveProperty = (propertyId: string) => {
    setSavedPropertyIds((prev) => {
      const updated = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
      return updated;
    });
  };

  const isPropertySaved = (propertyId: string) => {
    return savedPropertyIds.includes(propertyId);
  };

  // Add new property listing
  const addProperty = (propertyData: Partial<Property>): Property => {
    const newId = `prop-${Date.now()}`;
    const city = propertyData.city || 'Pune';
    const title = propertyData.title || 'New Property Listing';

    const defaultCover =
      propertyData.images && propertyData.images.length > 0
        ? propertyData.images[0].url
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

    const newProperty: Property = {
      id: newId,
      title: title,
      description: propertyData.description || 'Spacious property situated in prime residential area with premium fittings and convenient accessibility.',
      features: propertyData.features || [],
      price: Number(propertyData.price) || 5000000,
      propertyType: propertyData.propertyType || 'apartment',
      city: city,
      location: propertyData.location || 'City Center',
      address: propertyData.address || '',
      bedrooms: Number(propertyData.bedrooms) || 2,
      bathrooms: Number(propertyData.bathrooms) || 2,
      area: Number(propertyData.area) || 1200,
      coverImage: defaultCover,
      images: propertyData.images || [
        {
          id: `img-${Date.now()}-1`,
          url: defaultCover,
          sortOrder: 0,
          caption: 'Main View',
        },
      ],
      ownerId: user?.id || 'user-madhu-001',
      createdAt: new Date().toISOString(),
    };

    const updated = [newProperty, ...properties];
    savePropertiesToStorage(updated);
    return newProperty;
  };

  const updateProperty = (id: string, propertyData: Partial<Property>) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, ...propertyData } : p));
    savePropertiesToStorage(updated);
  };

  const deleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    savePropertiesToStorage(updated);
  };

  // Submit Inquiry with anti-spam honeypot and deduplication (per Section 9 of doc)
  const submitInquiry = (data: {
    propertyId: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    honeypotWebsite?: string;
  }) => {
    // 1. Honeypot check
    if (data.honeypotWebsite && data.honeypotWebsite.trim() !== '') {
      return { success: false, message: 'Spam detected. Submission rejected.' };
    }

    // 2. Property lookup
    const prop = properties.find((p) => p.id === data.propertyId);
    if (!prop) {
      return { success: false, message: 'Target property not found.' };
    }

    // 3. Self-inquiry check (Section 9.1)
    if (user && user.id === prop.ownerId) {
      return { success: false, message: 'You cannot inquire on your own listing.' };
    }

    // 4. Duplicate check for today (Section 9.1: dedupe_key by property + email + day)
    const today = new Date().toISOString().slice(0, 10);
    const dedupeKey = `${data.propertyId}_${data.email.toLowerCase()}_${today}`;
    const alreadySent = inquiries.some((inq) => inq.dedupeKey === dedupeKey);

    if (alreadySent) {
      return {
        success: false,
        message: 'You have already sent an inquiry for this property today. The owner will respond soon!',
      };
    }

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertySlug: prop.id,
      propertyCity: prop.city,
      propertyCoverImage: prop.coverImage,
      senderId: user?.id || null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      dedupeKey: dedupeKey,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const updated = [newInquiry, ...inquiries];
    saveInquiriesToStorage(updated);
    return {
      success: true,
      message: 'Inquiry submitted successfully! The owner will contact you shortly.',
    };
  };

  const updateInquiryStatus = (inquiryId: string, status: 'new' | 'read' | 'replied') => {
    const updated = inquiries.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq));
    saveInquiriesToStorage(updated);
  };

  const getPropertyBySlug = (slug: string) => {
    return properties.find((p) => p.id === slug);
  };

  const getMyProperties = () => {
    if (!user) return [];
    return properties.filter((p) => p.ownerId === user.id);
  };

  const getMyInquiries = () => {
    if (!user) return [];
    const myPropertyIds = properties
      .filter((p) => p.ownerId === user.id)
      .map((p) => p.id);

    return inquiries.filter(
      (inq) => myPropertyIds.includes(inq.propertyId) || inq.senderId === user.id
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitialized,
        properties,
        inquiries,
        savedPropertyIds,
        login,
        quickLogin,
        register,
        logout,
        toggleSaveProperty,
        isPropertySaved,
        addProperty,
        updateProperty,
        deleteProperty,
        submitInquiry,
        updateInquiryStatus,
        getPropertyBySlug,
        getMyProperties,
        getMyInquiries,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

