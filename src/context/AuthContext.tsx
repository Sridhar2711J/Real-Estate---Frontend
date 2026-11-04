'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { User, Inquiry } from '@/types';
import { userService, RegisterUserData } from '@/services/userService';
import { INITIAL_INQUIRIES } from '@/data/mockProperties';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (
    email: string,
    password?: string
  ) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }>;

  register: (
    data: RegisterUserData
  ) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }>;

  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string; user?: User }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; message: string; avatarUrl?: string; user?: User }>;
  getMe: () => Promise<User | null>;

  // Client inquiry & saved bookmark states
  inquiries: Inquiry[];
  savedPropertyIds: string[];
  isPropertySaved: (id: string) => boolean;
  toggleSaveProperty: (id: string) => void;
  getMyInquiries: () => Inquiry[];
  updateInquiryStatus: (id: string, status: Inquiry['status'], replyMessage?: string) => void;
  submitInquiry: (inquiryData: any) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'realnest_auth_user',
  TOKEN: 'realnest_auth_token',
  REFRESH_TOKEN: 'realnest_auth_refresh_token',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  // Restore client-side saved bookmarks and inquiries on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSaved = localStorage.getItem('realnest_saved_properties');
        if (storedSaved) {
          const parsed = JSON.parse(storedSaved);
          if (Array.isArray(parsed)) setSavedPropertyIds(parsed);
        }

        const storedInqs = localStorage.getItem('realnest_custom_inquiries');
        if (storedInqs) {
          const parsed = JSON.parse(storedInqs);
          if (Array.isArray(parsed) && parsed.length > 0) setInquiries(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const isPropertySaved = useCallback(
    (id: string) => savedPropertyIds.includes(id),
    [savedPropertyIds]
  );

  const toggleSaveProperty = useCallback((id: string) => {
    setSavedPropertyIds((prev) => {
      const next = prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('realnest_saved_properties', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const getMyInquiries = useCallback((): Inquiry[] => {
    if (!user) return inquiries;
    if (user.role === 'buyer') {
      const buyerInqs = inquiries.filter(
        (inq) =>
          inq.senderId === user.id ||
          (user.email && inq.email.toLowerCase() === user.email.toLowerCase())
      );
      return buyerInqs.length > 0 ? buyerInqs : inquiries;
    }
    return inquiries;
  }, [user, inquiries]);

  const updateInquiryStatus = useCallback(
    (id: string, status: Inquiry['status'], replyMessage?: string) => {
      setInquiries((prev) => {
        const next = prev.map((inq) => {
          if (inq.id === id) {
            return {
              ...inq,
              status,
              replyMessage: replyMessage !== undefined ? replyMessage : inq.replyMessage,
              repliedAt: replyMessage ? new Date().toISOString() : inq.repliedAt,
            };
          }
          return inq;
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('realnest_custom_inquiries', JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    []
  );

  const submitInquiry = useCallback(
    (inquiryData: any): { success: boolean; message: string } => {
      if (inquiryData.honeypotWebsite) {
        return {
          success: false,
          message: 'Spam detected. Submission blocked.',
        };
      }

      if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
        return {
          success: false,
          message: 'Please fill in your name, email, and message.',
        };
      }

      const newInq: Inquiry = {
        id: `inq-${Date.now()}`,
        propertyId: inquiryData.propertyId || '',
        propertyTitle: inquiryData.propertyTitle || 'Property Inquiry',
        propertySlug: inquiryData.propertySlug || inquiryData.propertyId || '',
        propertyCity: inquiryData.propertyCity || '',
        propertyCoverImage: inquiryData.propertyCoverImage || undefined,
        name: inquiryData.name.trim(),
        email: inquiryData.email.trim(),
        phone: inquiryData.phone ? inquiryData.phone.trim() : '',
        message: inquiryData.message.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
        senderId: user?.id || null,
      };

      setInquiries((prev) => {
        const next = [newInq, ...prev];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('realnest_custom_inquiries', JSON.stringify(next));
          } catch {}
        }
        return next;
      });

      return {
        success: true,
        message: 'Your inquiry has been submitted successfully! The seller will contact you shortly.',
      };
    },
    [user]
  );

  // Clear all auth data from state and storage
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      } catch (err) {
        console.warn('Storage cleanup warning:', err);
      }
    }
  }, []);

  // Save authenticated user and tokens
  const saveUserToStorage = useCallback(
    (newUser: User, newToken: string, newRefreshToken?: string) => {
      setUser(newUser);
      setToken(newToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
          sessionStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
          if (newRefreshToken) {
            sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }
        } catch (err) {
          console.warn('Storage save warning:', err);
        }
      }
    },
    []
  );

  // Fetch verified user from backend /api/users/me
  const getMe = useCallback(async (): Promise<User | null> => {
    try {
      const storedToken =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(STORAGE_KEYS.TOKEN)
          : null;

      if (!storedToken) {
        clearAuth();
        return null;
      }

      const res = await userService.getMe();

      if (res && res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
        }
        return res.user;
      } else {
        clearAuth();
        return null;
      }
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  // Synchronize state when tokens are refreshed or session expires globally
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTokenRefreshed = (e: any) => {
      const newToken = e.detail?.token;
      const newRefreshToken = e.detail?.refreshToken;
      if (newToken) setToken(newToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
    };

    const handleAuthExpired = () => {
      clearAuth();
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [clearAuth]);

  // Restore authenticated session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setIsInitialized(true);
          return;
        }

        const storedToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedRefreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = sessionStorage.getItem(STORAGE_KEYS.USER);

        // If no token exists, immediately handle unauthenticated state (navbar displays Signin/Signup safely)
        if (!storedToken) {
          clearAuth();
          return;
        }

        // Token exists: set local state immediately
        setToken(storedToken);
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
        }

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore JSON parse error
          }
        }

        // Verify token with backend via /api/users/me
        try {
          const res = await userService.getMe();
          if (res && res.success && res.user) {
            setUser(res.user);
            sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
          } else {
            // Token expired or invalid
            clearAuth();
          }
        } catch (err: any) {
          // If token expired, invalid, or auth error occurred, clean up and redirect
          const isExpiredError =
            err?.status === 401 ||
            err?.status === 403 ||
            err?.message?.toLowerCase().includes('token') ||
            err?.message?.toLowerCase().includes('expired');

          if (isExpiredError) {
            clearAuth();
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(
                'realnest_session_expired',
                'Your session has expired. Please log in again.'
              );
              const pathname = window.location.pathname;
              const isAuthPage =
                pathname.startsWith('/login') ||
                pathname.startsWith('/register') ||
                pathname.startsWith('/forgot-password');

              if (!isAuthPage) {
                const redirectParam = encodeURIComponent(pathname + window.location.search);
                window.location.href = `/login?expired=true&redirect=${redirectParam}`;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to restore authentication session:', error);
        clearAuth();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [clearAuth]);

  // LOGIN - Call backend login endpoint
  const login = async (
    email: string,
    password?: string
  ): Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }> => {
    try {
      if (!password) {
        return {
          success: false,
          message: 'Password is required to sign in',
        };
      }

      const cleanEmail = email.trim().toLowerCase();

      const response = await userService.login(cleanEmail, password);

      if (!response || !response.success) {
        return {
          success: false,
          message: response?.message || 'Invalid email or password',
        };
      }

      if (!response.user || !response.token) {
        return {
          success: false,
          message: 'User details or authentication token was not received',
        };
      }

      saveUserToStorage(response.user, response.token, response.refreshToken);

      return {
        success: true,
        message: response.message || 'Login successful',
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Login failed. Please verify your credentials.',
      };
    }
  };

  // REGISTER - Post to backend registration API
  const register = async (
    data: RegisterUserData
  ): Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }> => {
    try {
      const response = await userService.register(data);

      if (!response || !response.success) {
        return {
          success: false,
          message: response?.message || 'Registration failed',
        };
      }

      return {
        success: true,
        message: response.message || 'Registration successful',
        user: response.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Registration failed. Please try again.',
      };
    }
  };

  // UPDATE USER PROFILE - Call backend PUT /api/users/profile
  const updateUserProfile = async (
    updatedData: Partial<User>
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const previousUser = user;
    const optimisticUser: User = {
      ...(user || { id: 'temp', email: '', name: '', role: 'buyer' }),
      ...updatedData,
    };
    setUser(optimisticUser);

    try {
      const res = await userService.updateProfile({
        name: updatedData.name,
        phone: updatedData.phone,
        avatar: updatedData.avatar,
      });

      if (res && res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
        }
        return {
          success: true,
          message: res.message || 'Profile updated successfully.',
          user: res.user,
        };
      } else {
        if (previousUser) setUser(previousUser);
        return {
          success: false,
          message: res?.message || 'Failed to update profile.',
        };
      }
    } catch (err: any) {
      if (previousUser) setUser(previousUser);
      return {
        success: false,
        message: err?.message || 'Network error updating profile.',
      };
    }
  };

  // UPLOAD AVATAR - Convert to WebP & upload via POST /api/users/upload-avatar
  const uploadAvatar = async (
    file: File
  ): Promise<{ success: boolean; message: string; avatarUrl?: string; user?: User }> => {
    try {
      const res = await userService.uploadAvatar(file);

      if (res && res.success) {
        const nextUser: User | null = res.user
          ? res.user
          : user
          ? { ...user, avatar: res.avatarUrl }
          : null;

        if (nextUser) {
          setUser(nextUser);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
          }
        }

        return {
          success: true,
          message: res.message || 'Avatar uploaded successfully.',
          avatarUrl: res.avatarUrl,
          user: nextUser || undefined,
        };
      } else {
        return {
          success: false,
          message: res?.message || 'Failed to upload avatar.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Error uploading profile image.',
      };
    }
  };

  // LOGOUT - Call backend to invalidate refresh token, then clear storage
  const logout = async () => {
    const currentRefreshToken =
      refreshToken ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        : null);

    try {
      await userService.logout(currentRefreshToken);
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!user && !!token,
        isInitialized,
        login,
        register,
        logout,
        updateUserProfile,
        uploadAvatar,
        getMe,
        inquiries,
        savedPropertyIds,
        isPropertySaved,
        toggleSaveProperty,
        getMyInquiries,
        updateInquiryStatus,
        submitInquiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
