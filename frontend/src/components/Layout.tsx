/**
 * Layout Component
 * 
 * WHY:
 * - Provides consistent structure across all pages
 * - Contains header, footer, and main content area
 * - Handles navigation
 */

import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on an admin page
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <Shield className="h-8 w-8" />
              <span className="font-bold text-xl">SafeSpeak</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/report"
                className="btn-primary"
              >
                Report Incident
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/report"
                  className="btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Report Incident
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="page-transition">
          {children}
        </div>
      </main>
      
      {/* Footer - Hide on admin pages */}
      {!isAdminPage && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-5 w-5" />
                <span>SafeSpeak - Your voice, protected.</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>100% Anonymous</span>
                <span>•</span>
                <span>No Data Collected</span>
                <span>•</span>
                <Link to="/admin/login" className="hover:text-gray-700">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}