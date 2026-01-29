/**
 * Admin Dashboard
 * 
 * PURPOSE:
 * - Display all reports in a table/list format
 * - Allow filtering by category and status
 * - Navigate to individual report details
 * - Show statistics overview
 * 
 * PRIVACY:
 * - No personal data is shown (because none is collected!)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import type { AdminReport, ReportCategory, ReportStatus, DashboardStats } from '../types';

// Category options for filtering
const CATEGORIES: { value: ReportCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'corruption', label: 'Corruption' },
  { value: 'abuse', label: 'Abuse' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

// Status options for filtering
const STATUSES: { value: ReportStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

// Severity badge colors
const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-800',
  unknown: 'bg-gray-100 text-gray-700',
};

// Status badge colors
const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-700',
};

// Status icons
const statusIcons: Record<string, React.ReactNode> = {
  new: <AlertCircle className="h-4 w-4" />,
  reviewing: <Clock className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
  archived: <Archive className="h-4 w-4" />,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  
  // Data state
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetch reports with current filters
   */
  const fetchReports = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.getReports({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, statusFilter]);
  
  /**
   * Fetch dashboard stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);
  
  // Refetch when filters change
  useEffect(() => {
    fetchReports(1);
  }, [categoryFilter, statusFilter, fetchReports]);
  
  /**
   * Handle logout
   */
  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }
  
  /**
   * Format date for display
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="font-bold text-lg text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {admin?.displayName || 'Admin'}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">New Reports</p>
              <p className="text-2xl font-bold text-blue-600">{stats.newReports}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">High/Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {(stats.bySeverity?.high || 0) + (stats.bySeverity?.critical || 0)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats.byCategory || {}).length}
              </p>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input max-w-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input max-w-xs"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            
            <button
              onClick={() => fetchReports(pagination.currentPage)}
              className="btn-secondary flex items-center gap-2 ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Reports Table */}
        <div className="card">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner text="Loading reports..." />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchReports()}
                className="mt-4 btn-secondary"
              >
                Try Again
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reports found</p>
              <p className="text-sm text-gray-400 mt-1">
                {categoryFilter || statusFilter ? 'Try adjusting your filters' : 'Reports will appear here when submitted'}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Summary</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        onClick={() => navigate(`/admin/reports/${report.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {report.summary || 'No summary available'}
                          </p>
                          {!report.aiAnalyzed && (
                            <span className="text-xs text-amber-600">Manual review needed</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-gray-700">{report.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[report.severity]}`}>
                            {report.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusColors[report.status]}`}>
                            {statusIcons[report.status]}
                            {report.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {reports.length} of {pagination.totalCount} reports
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchReports(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="btn-secondary py-2 px-3 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchReports(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn-secondary py-2 px-3 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}