const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Clean up authentication data, broadcast expiration event, and redirect to login
 */
export function handleAuthFailure(reason: string = 'Your session has expired. Please log in again.') {
  if (typeof window === 'undefined') return;

  // Clear credentials from storage
  try {
    sessionStorage.removeItem('realnest_auth_token');
    sessionStorage.removeItem('realnest_auth_refresh_token');
    sessionStorage.removeItem('realnest_auth_user');
    localStorage.removeItem('realnest_auth_token');
    localStorage.removeItem('realnest_auth_refresh_token');
    localStorage.removeItem('realnest_auth_user');
    sessionStorage.setItem('realnest_session_expired', reason);
  } catch (err) {
    console.warn('Storage cleanup warning:', err);
  }

  // Broadcast event so AuthContext clears active state
  window.dispatchEvent(new CustomEvent('auth:expired', { detail: { message: reason } }));

  // Redirect to login if user is not on a public authentication page
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

// Deduplicate concurrent refresh requests with a single promise
let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('realnest_auth_refresh_token')
          : null;

      if (!refreshToken) {
        handleAuthFailure('Session expired. Please log in again.');
        return null;
      }

      const refreshRes = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshData = await refreshRes.json().catch(() => null);

      if (refreshRes.ok && refreshData?.success && refreshData?.token) {
        sessionStorage.setItem('realnest_auth_token', refreshData.token);
        if (refreshData.refreshToken) {
          sessionStorage.setItem('realnest_auth_refresh_token', refreshData.refreshToken);
        }

        window.dispatchEvent(
          new CustomEvent('auth:token-refreshed', {
            detail: {
              token: refreshData.token,
              refreshToken: refreshData.refreshToken,
            },
          })
        );

        return refreshData.token;
      } else {
        handleAuthFailure(refreshData?.message || 'Session expired. Please log in again.');
        return null;
      }
    } catch {
      handleAuthFailure('Network error refreshing session. Please log in again.');
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Universal API Client with automatic JSON parsing, JWT authorization & Refresh Token rotation
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('realnest_auth_token')
      : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only default to application/json if not sending FormData
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized or 403 Forbidden with automatic Refresh Token rotation
  const isAuthError =
    (response.status === 401 || response.status === 403) &&
    !cleanEndpoint.includes('/users/login') &&
    !cleanEndpoint.includes('/users/register') &&
    !cleanEndpoint.includes('/users/refresh-token') &&
    typeof window !== 'undefined';

  if (isAuthError) {
    const newToken = await doRefreshToken();

    if (newToken) {
      // Retry original request with newly issued access token
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      });

      const retryData = await retryResponse.json().catch(() => null);

      if (!retryResponse.ok) {
        throw new ApiError(
          retryData?.message || 'Request failed after token refresh',
          retryResponse.status,
          retryData
        );
      }

      return retryData as T;
    } else {
      throw new ApiError('Session expired. Please log in again.', response.status, {
        expired: true,
      });
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      'Request failed with status ' + response.status;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export default apiClient;
