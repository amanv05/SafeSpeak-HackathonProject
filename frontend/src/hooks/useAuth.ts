/**
 * Authentication Hook
 * 
 * WHY A HOOK:
 * - Encapsulates all auth logic in one place
 * - Easy to use in any component
 * - Handles localStorage and state together
 * 
 * USAGE:
 *   const { isAuthenticated, login, logout } = useAuth();
 */

import { useState, useCallback, useEffect } from 'react';
import { api, getToken } from '../services/api';
import type { LoginCredentials } from '../types';

// Storage key for admin info
const ADMIN_KEY = 'safespeak_admin';

interface UseAuthReturn {
  isAuthenticated: boolean;
  admin: { username: string; displayName: string } | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  // Check initial auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [admin, setAdmin] = useState<{ username: string; displayName: string } | null>(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Login with credentials
   * Returns true on success, false on failure
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.login(credentials);
      
      // Store admin info
      const adminInfo = response.admin;
      localStorage.setItem(ADMIN_KEY, JSON.stringify(adminInfo));
      
      setAdmin(adminInfo);
      setIsAuthenticated(true);
      
      return true;
    } catch (err: unknown) {
      // Extract error message
      let message = 'Login failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message || message;
      }
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Logout and clear all auth data
   */
  const logout = useCallback(() => {
    api.logout();
    localStorage.removeItem(ADMIN_KEY);
    setAdmin(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);
  
  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Sync auth state with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const hasToken = !!getToken();
      setIsAuthenticated(hasToken);
      
      if (!hasToken) {
        setAdmin(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return {
    isAuthenticated,
    admin,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}