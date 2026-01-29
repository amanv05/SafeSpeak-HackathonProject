/**
 * API Service
 * 
 * WHY CENTRALIZE API CALLS:
 * - Single place to configure base URL
 * - Consistent error handling
 * - Easy to add auth headers
 * - Simpler to test and mock
 * 
 * USAGE:
 *   import { api } from './services/api';
 *   const reports = await api.getReports();
 */

import axios, { AxiosError } from 'axios';
import type {
  ReportSubmission,
  ReportResponse,
  LoginCredentials,
  LoginResponse,
  AdminReport,
  ReportDetail,
  PaginatedResponse,
  DashboardStats,
  ApiError,
} from '../types';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Base URL for API requests
 * 
 * WHY import.meta.env:
 * - Vite's way of accessing environment variables
 * - Only variables prefixed with VITE_ are exposed
 * - Falls back to localhost in development
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Create Axios instance with default config
 * 
 * WHY Axios:
 * - Automatic JSON parsing
 * - Request/response interceptors
 * - Better error handling than fetch
 */
const client = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout (AI might take a while)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// AUTH TOKEN MANAGEMENT
// ============================================

const TOKEN_KEY = 'safespeak_admin_token';

/**
 * Get stored auth token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save auth token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove auth token (logout)
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

// ============================================
// REQUEST INTERCEPTOR
// ============================================

/**
 * Add auth token to requests
 * 
 * WHY interceptor:
 * - Automatically adds token to all requests
 * - Don't have to remember to add it manually
 */
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle response errors
 */
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 (unauthorized) - token expired or invalid
    if (error.response?.status === 401) {
      clearToken();
      // Redirect to login if on admin page
      if (window.location.pathname.startsWith('/admin') && 
          !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Extract error message from API error
 * 
 * WHY:
 * - API errors have different formats
 * - This gives us a consistent user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // API returned an error response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Network error
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (!error.response) {
      return 'Unable to connect to server. Please check your connection.';
    }
  }
  // Generic error
  return 'An unexpected error occurred. Please try again.';
}

// ============================================
// API METHODS
// ============================================

export const api = {
  // ----------------------------------------
  // REPORTS (Public)
  // ----------------------------------------
  
  /**
   * Submit an anonymous report
   * No authentication required
   */
  async submitReport(data: ReportSubmission): Promise<ReportResponse> {
    const response = await client.post<{
      success: true;
      message: string;
      report: ReportResponse;
    }>('/api/report', data);
    return response.data.report;
  },
  
  // ----------------------------------------
  // ADMIN AUTH
  // ----------------------------------------
  
  /**
   * Admin login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await client.post<LoginResponse>('/api/admin/login', credentials);
    // Store token
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },
  
  /**
   * Logout (client-side only)
   */
  logout(): void {
    clearToken();
  },
  
  // ----------------------------------------
  // ADMIN REPORTS
  // ----------------------------------------
  
  /**
   * Get all reports (admin only)
   */
  async getReports(params?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminReport>['data']> {
    const response = await client.get<PaginatedResponse<AdminReport>>('/api/admin/reports', {
      params,
    });
    return response.data.data;
  },
  
  /**
   * Get single report details (admin only)
   */
  async getReport(id: string): Promise<ReportDetail> {
    const response = await client.get<{
      success: true;
      data: ReportDetail;
    }>(`/api/admin/reports/${id}`);
    return response.data.data;
  },
  
  /**
   * Update report status (admin only)
   */
  async updateReport(id: string, data: {
    status?: string;
    adminNotes?: string;
  }): Promise<void> {
    await client.patch(`/api/admin/reports/${id}`, data);
  },
  
  /**
   * Get dashboard stats (admin only)
   */
  async getStats(): Promise<DashboardStats> {
    const response = await client.get<{
      success: true;
      data: DashboardStats;
    }>('/api/admin/stats');
    return response.data.data;
  },
  
  // ----------------------------------------
  // HEALTH CHECK
  // ----------------------------------------
  
  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await client.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};