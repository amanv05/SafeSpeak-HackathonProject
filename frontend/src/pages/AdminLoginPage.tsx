/**
 * Admin Login Page
 * 
 * PURPOSE:
 * - Authenticate admin users
 * - Redirect to dashboard on success
 * - Show clear error messages on failure
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error, login, clearError } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Get the intended destination (if redirected from protected route)
  const from = (location.state as { from?: string })?.from || '/admin';
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Clear error when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [username, password]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const success = await login({ username, password });
    
    if (success) {
      navigate(from, { replace: true });
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SafeSpeak
        </Link>
        
        {/* Login Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="mt-2 text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input"
                required
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Only authorized personnel should access this area.
          <br />
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}