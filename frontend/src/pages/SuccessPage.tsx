/**
 * Success Page
 * 
 * PURPOSE:
 * - Confirm that the report was submitted
 * - Show AI-generated category and severity
 * - Display suggested resources and next steps
 * - Provide reassurance and encouragement
 */

import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Shield,
  AlertTriangle,
  Phone,
  Globe,
  Building2,
  Scale,
  Users,
  ArrowRight,
  Home,
} from 'lucide-react';
import type { ReportResponse, Suggestion } from '../types';

// Map suggestion types to icons
const suggestionIcons: Record<string, React.ReactNode> = {
  ngo: <Users className="h-5 w-5" />,
  legal: <Scale className="h-5 w-5" />,
  hotline: <Phone className="h-5 w-5" />,
  journalist: <Globe className="h-5 w-5" />,
  government: <Building2 className="h-5 w-5" />,
};

// Category display names
const categoryLabels: Record<string, string> = {
  harassment: 'Harassment',
  corruption: 'Corruption',
  abuse: 'Abuse',
  discrimination: 'Discrimination',
  other: 'Other Issue',
  unknown: 'General Report',
};

// Severity colors and labels
const severityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  low: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Low Priority' },
  medium: { color: 'text-amber-700', bgColor: 'bg-amber-100', label: 'Medium Priority' },
  high: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'High Priority' },
  critical: { color: 'text-red-900', bgColor: 'bg-red-200', label: 'Critical - Urgent' },
  unknown: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Priority Pending' },
};

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get report data from navigation state
  const report = location.state?.report as ReportResponse | undefined;
  
  // If no report data, redirect to home
  useEffect(() => {
    if (!report) {
      navigate('/', { replace: true });
    }
  }, [report, navigate]);
  
  // Don't render until we have data
  if (!report) {
    return null;
  }
  
  const severity = severityConfig[report.severity] || severityConfig.unknown;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">
                Report Submitted Successfully
              </h1>
              <p className="mt-2 text-green-700">
                Thank you for speaking up. Your report has been received and will be 
                reviewed by authorized personnel. Your identity remains protected.
              </p>
            </div>
          </div>
        </div>
        
        {/* AI Analysis Results */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
            {!report.analyzedByAI && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Fallback Mode
              </span>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Category */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {categoryLabels[report.category] || report.category}
              </p>
            </div>
            
            {/* Severity */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Priority Level</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-sm font-medium ${severity.bgColor} ${severity.color}`}>
                  {severity.label}
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary */}
          {report.summary && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500 mb-2">Summary</p>
              <p className="text-gray-700">{report.summary}</p>
            </div>
          )}
        </div>
        
        {/* Suggested Resources */}
        {report.suggestions && report.suggestions.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Suggested Resources
            </h2>
            <p className="text-gray-600 mb-6">
              Based on your report, these organizations may be able to help:
            </p>
            
            <div className="space-y-4">
              {report.suggestions.map((suggestion: Suggestion, index: number) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          </div>
        )}
        
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Important</h3>
              <p className="mt-1 text-sm text-amber-700">
                If you are in immediate danger, please contact emergency services 
                in your area. This platform is for reporting, not emergency response.
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="btn-secondary flex items-center justify-center gap-2 flex-1"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
          <Link
            to="/report"
            className="btn-primary flex items-center justify-center gap-2 flex-1"
          >
            Submit Another Report
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Suggestion Card Component
 */
function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const icon = suggestionIcons[suggestion.type] || <Globe className="h-5 w-5" />;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 text-primary-600">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
          {suggestion.description && (
            <p className="mt-1 text-sm text-gray-600">{suggestion.description}</p>
          )}
          {suggestion.contact && (
            <p className="mt-2 text-sm">
              <span className="text-gray-500">Contact: </span>
              <span className="text-primary-600 font-medium">{suggestion.contact}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}