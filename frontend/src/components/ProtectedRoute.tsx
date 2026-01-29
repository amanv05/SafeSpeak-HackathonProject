/**
 * Protected Route Component
 * 
 * WHY:
 * - Prevents unauthorized access to admin pages
 * - Redirects to login if not authenticated
 * - Simple wrapper pattern for React Router
 * 
 * USAGE:
 *   <ProtectedRoute>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Save the attempted URL for redirecting after login
    return (
      <Navigate 
        to="/admin/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }
  
  // User is authenticated, render the protected content
  return <>{children}</>;
}