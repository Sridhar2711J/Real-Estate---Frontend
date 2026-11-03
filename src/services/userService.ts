import apiClient from './api';
import { User, UserRole } from '@/types';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface LoginUserData {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export type RegisterResponse = AuthResponse;

export interface GetMeResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface CommonResponse {
  success: boolean;
  message: string;
}

export const userService = {
  /**
   * Register a new user account (Buyer or Seller)
   * POST /api/users/register
   */
  async register(data: RegisterUserData): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login user
   * POST /api/users/login
   */
  async login(
    credentials: LoginUserData | string,
    passwordArg?: string
  ): Promise<AuthResponse> {
    const payload =
      typeof credentials === 'string'
        ? { email: credentials, password: passwordArg }
        : credentials;

    return apiClient<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get current authenticated user profile
   * GET /api/users/me
   */
  async getMe(): Promise<GetMeResponse> {
    return apiClient<GetMeResponse>('/users/me', {
      method: 'GET',
    });
  },

  /**
   * Refresh access token
   * POST /api/users/refresh-token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/users/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * Logout user and invalidate refresh token
   * POST /api/users/logout
   */
  async logout(refreshToken?: string | null): Promise<CommonResponse> {
    return apiClient<CommonResponse>('/users/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * Request password reset OTP
   * POST /api/users/forgot-password
   */
  async forgotPassword(email: string): Promise<CommonResponse> {
    return apiClient<CommonResponse>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify password reset OTP
   * POST /api/users/verify-otp
   */
  async verifyOtp(email: string, otp: string): Promise<CommonResponse> {
    return apiClient<CommonResponse>('/users/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  /**
   * Reset password with valid OTP
   * POST /api/users/reset-password
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<CommonResponse> {
    return apiClient<CommonResponse>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },
};

export default userService;
