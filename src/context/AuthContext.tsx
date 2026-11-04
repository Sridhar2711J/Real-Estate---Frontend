'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { User } from '@/types';
import { userService, RegisterUserData } from '@/services/userService';
import { bookmarkService, BookmarkItem } from '@/services/bookmarkService';

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

  // Saved bookmark states
  savedPropertyIds: string[];
  bookmarks: BookmarkItem[];
  bookmarkCount: number;
  isPropertySaved: (id: string) => boolean;
  toggleSaveProperty: (id: string) => Promise<void> | void;
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

  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  // Synchronize bookmark state from user or API response
  const syncBookmarkData = useCallback(
    (userData?: User | null, rawBookmarks?: any[], rawCount?: number, rawIds?: string[]) => {
      if (userData && userData.role === 'buyer') {
        const bList = (rawBookmarks || userData.bookmarks || []) as BookmarkItem[];
        const ids =
          rawIds ||
          userData.savedPropertyIds ||
          (Array.isArray(bList) ? bList.map((b) => b.propertyId) : []);
        const count =
          rawCount !== undefined
            ? rawCount
            : userData.bookmarkCount !== undefined
            ? userData.bookmarkCount
            : ids.length;

        setSavedPropertyIds(ids);
        setBookmarks(bList);
        setBookmarkCount(count);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('realnest_saved_properties', JSON.stringify(ids));
          } catch {}
        }
      } else if (userData && userData.role !== 'buyer') {
        setSavedPropertyIds([]);
        setBookmarks([]);
        setBookmarkCount(0);
      }
    },
    []
  );

  // Restore client-side saved bookmarks and inquiries on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSaved = localStorage.getItem('realnest_saved_properties');
        if (storedSaved) {
          const parsed = JSON.parse(storedSaved);
          if (Array.isArray(parsed)) {
            setSavedPropertyIds(parsed);
            setBookmarkCount(parsed.length);
          }
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

  // Add / Remove bookmarks using backend API when buyer is logged in
  const toggleSaveProperty = useCallback(
    async (id: string) => {
      if (!id) return;

      if (user && user.role === 'buyer') {
        const isCurrentlySaved = savedPropertyIds.includes(id);

        // Optimistic UI updates
        if (isCurrentlySaved) {
          setSavedPropertyIds((prev) => prev.filter((pId) => pId !== id));
          setBookmarks((prev) => prev.filter((b) => b.propertyId !== id));
          setBookmarkCount((prev) => Math.max(0, prev - 1));
        } else {
          setSavedPropertyIds((prev) => [...prev, id]);
          setBookmarkCount((prev) => prev + 1);
        }

        try {
          if (isCurrentlySaved) {
            const res = await bookmarkService.removeBookmark(id);
            if (res && typeof res.bookmarkCount === 'number') {
              setBookmarkCount(res.bookmarkCount);
            }
          } else {
            const res = await bookmarkService.addBookmark(id);
            if (res && res.success) {
              if (res.bookmark) {
                setBookmarks((prev) => [res.bookmark!, ...prev.filter((b) => b.propertyId !== id)]);
              }
              if (typeof res.bookmarkCount === 'number') {
                setBookmarkCount(res.bookmarkCount);
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync bookmark with backend:', err);
          // Rollback on network / server failure
          if (isCurrentlySaved) {
            setSavedPropertyIds((prev) => [...prev, id]);
            setBookmarkCount((prev) => prev + 1);
          } else {
            setSavedPropertyIds((prev) => prev.filter((pId) => pId !== id));
            setBookmarkCount((prev) => Math.max(0, prev - 1));
          }
        }
      } else {
        // Fallback for unauthenticated guest
        setSavedPropertyIds((prev) => {
          const next = prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('realnest_saved_properties', JSON.stringify(next));
            } catch {}
          }
          setBookmarkCount(next.length);
          return next;
        });
      }
    },
    [user, savedPropertyIds]
  );

  // Clear all auth data from state and storage
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setSavedPropertyIds([]);
    setBookmarks([]);
    setBookmarkCount(0);
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

      if (newUser.role === 'buyer') {
        syncBookmarkData(newUser);
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
    [syncBookmarkData]
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
        if (res.user.role === 'buyer') {
          syncBookmarkData(res.user, res.bookmarks, res.bookmarkCount, res.savedPropertyIds);
        }
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
  }, [clearAuth, syncBookmarkData]);

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
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (parsed.role === 'buyer') {
              syncBookmarkData(parsed);
            }
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
            if (res.user.role === 'buyer') {
              syncBookmarkData(res.user, res.bookmarks, res.bookmarkCount, res.savedPropertyIds);
            }
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
  }, [clearAuth, syncBookmarkData]);

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
      if (response.user.role === 'buyer') {
        syncBookmarkData(
          response.user,
          response.bookmarks,
          response.bookmarkCount,
          response.savedPropertyIds
        );
      }

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
        savedPropertyIds,
        bookmarks,
        bookmarkCount,
        isPropertySaved,
        toggleSaveProperty,
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
