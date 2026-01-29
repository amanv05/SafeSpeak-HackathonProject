/**
 * Main Application Component
 * 
 * WHY THIS STRUCTURE:
 * - Routes defines the URL structure
 * - Layout wraps all pages with consistent header/footer
 * - Protected routes handle authentication
 * 
 * ROUTES:
 * - / : Home page
 * - /report : Submit a report
 * - /success : Report submitted successfully
 * - /admin/login : Admin login
 * - /admin : Admin dashboard (protected)
 */

import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout';

// Public pages
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import SuccessPage from './pages/SuccessPage';

// Admin pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminReportDetail from './pages/AdminReportDetail';

// Auth
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes - Anyone can access */}
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/success" element={<SuccessPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Protected Admin Routes - Require authentication */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/:id"
          element={
            <ProtectedRoute>
              <AdminReportDetail />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all: Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;