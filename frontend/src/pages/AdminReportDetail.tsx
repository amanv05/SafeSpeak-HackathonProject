/**
 * Admin Report Detail Page
 * 
 * PURPOSE:
 * - Show full details of a single report
 * - Allow admins to update status and add notes
 * - Display AI suggestions and analysis
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  AlertCircle,
  Clock,
  CheckCircle,
  Archive,
  AlertTriangle,
  Save,
  Phone,
  Globe,
  Building2,
  Scale,
  Users,
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ReportDetail, ReportStatus, Suggestion } from '../types';

// Status options
const STATUSES: { value: ReportStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'new', label: 'New', icon: <AlertCircle className="h-4 w-4" /> },
  { value: 'reviewing', label: 'Reviewing', icon: <Clock className="h-4 w-4" /> },
  { value: 'resolved', label: 'Resolved', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'archived', label: 'Archived', icon: <Archive className="h-4 w-4" /> },
];

// Severity colors
const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
  critical: 'bg-red-200 text-red-800 border-red-300',
  unknown: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Suggestion type icons
const suggestionIcons: Record<string, React.ReactNode> = {
  ngo: <Users className="h-5 w-5" />,
  legal: <Scale className="h-5 w-5" />,
  hotline: <Phone className="h-5 w-5" />,
  journalist: <Globe className="h-5 w-5" />,
  government: <Building2 className="h-5 w-5" />,
};

export default function AdminReportDetail() {
  const { id } = useParams<{ id: string }>();
  
  
  // Data state
  const [report, setReport] = useState<ReportDetail | null>(null);
  
  // Form state
  const [status, setStatus] = useState<ReportStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Fetch report on mount
  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await api.getReport(id);
        setReport(data);
        setStatus(data.status);
        setAdminNotes(data.adminNotes || '');
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReport();
  }, [id]);
  
  // Track changes
  useEffect(() => {
    if (report) {
      const changed = status !== report.status || adminNotes !== (report.adminNotes || '');
      setHasChanges(changed);
    }
  }, [status, adminNotes, report]);
  
  /**
   * Save changes
   */
  async function handleSave() {
    if (!id || !hasChanges) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      await api.updateReport(id, { status, adminNotes });
      
      // Update local state
      if (report) {
        setReport({ ...report, status, adminNotes });
      }
      
      setHasChanges(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }
  
  /**
   * Format date for display
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner text="Loading report..." />
      </div>
    );
  }
  
  // Error state
  if (error && !report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/admin" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  if (!report) return null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary-600" />
              <h1 className="font-bold text-lg text-gray-900">Report Details</h1>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Info */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {report.summary || 'Report'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted {formatDate(report.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColors[report.severity]}`}>
                    {report.severity} severity
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {report.category}
                </span>
                {report.userSelectedCategory && report.userSelectedCategory !== report.category && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    User selected: {report.userSelectedCategory}
                  </span>
                )}
                {!report.aiAnalyzed && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    Not AI analyzed
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Full Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{report.description}</p>
                </div>
              </div>
            </div>
            
            {/* AI Suggestions */}
            {report.suggestions && report.suggestions.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">AI Suggested Resources</h3>
                <div className="space-y-3">
                  {report.suggestions.map((suggestion: Suggestion, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 text-primary-600">
                          {suggestionIcons[suggestion.type] || <Globe className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          {suggestion.contact && (
                            <p className="text-sm text-primary-600 mt-2">{suggestion.contact}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Admin Actions */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
              
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              {/* Success */}
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-600">Changes saved successfully!</p>
                </div>
              )}
              
              <div className="space-y-2 mb-6">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                      status === s.value
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this report..."
                  className="input min-h-[100px] resize-y"
                />
              </div>
              
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Metadata */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Report Metadata</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Report ID</dt>
                  <dd className="font-mono text-gray-900">{report.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-900">{formatDate(report.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="text-gray-900">{formatDate(report.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">AI Analysis</dt>
                  <dd className="text-gray-900">{report.aiAnalyzed ? 'Completed' : 'Fallback used'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}