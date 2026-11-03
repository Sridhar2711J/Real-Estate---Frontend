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

let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

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
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with Refresh Token rotation
  if (
    response.status === 401 &&
    !cleanEndpoint.includes('/users/login') &&
    !cleanEndpoint.includes('/users/refresh-token') &&
    typeof window !== 'undefined'
  ) {
    const refreshToken = sessionStorage.getItem('realnest_auth_refresh_token');

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${API_BASE_URL}/users/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          const refreshData = await refreshRes.json();

          if (refreshRes.ok && refreshData.success && refreshData.token) {
            sessionStorage.setItem('realnest_auth_token', refreshData.token);
            if (refreshData.refreshToken) {
              sessionStorage.setItem('realnest_auth_refresh_token', refreshData.refreshToken);
            }

            isRefreshing = false;
            onRefreshed(refreshData.token);

            // Retry original request with newly issued token
            headers['Authorization'] = `Bearer ${refreshData.token}`;
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
            // Refresh failed: clear credentials
            sessionStorage.removeItem('realnest_auth_token');
            sessionStorage.removeItem('realnest_auth_refresh_token');
            sessionStorage.removeItem('realnest_auth_user');
            isRefreshing = false;
          }
        } catch {
          sessionStorage.removeItem('realnest_auth_token');
          sessionStorage.removeItem('realnest_auth_refresh_token');
          sessionStorage.removeItem('realnest_auth_user');
          isRefreshing = false;
        }
      } else {
        // Queue other pending requests until refresh is complete
        return new Promise<T>((resolve, reject) => {
          refreshSubscribers.push(async (newToken: string) => {
            try {
              headers['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, {
                ...options,
                headers,
              });
              const retryData = await retryResponse.json().catch(() => null);
              if (!retryResponse.ok) {
                reject(
                  new ApiError(
                    retryData?.message || 'Request failed',
                    retryResponse.status,
                    retryData
                  )
                );
              } else {
                resolve(retryData as T);
              }
            } catch (err) {
              reject(err);
            }
          });
        });
      }
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
