/**
 * Report Page
 * 
 * PURPOSE:
 * - Allow users to submit anonymous incident reports
 * - Provide clear instructions and reassurance
 * - Handle loading and error states gracefully
 * 
 * FLOW:
 * 1. User enters description
 * 2. (Optional) Select category
 * 3. Submit
 * 4. Show loading state
 * 5. Redirect to success page with results
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertCircle,
  Lock,
  Send,
} from 'lucide-react';
import { api, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ReportCategory, ReportResponse } from '../types';

// Category options for the dropdown
const CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
  { 
    value: 'harassment', 
    label: 'Harassment', 
    description: 'Workplace bullying, sexual harassment, intimidation' 
  },
  { 
    value: 'corruption', 
    label: 'Corruption', 
    description: 'Bribery, fraud, misuse of power' 
  },
  { 
    value: 'abuse', 
    label: 'Abuse', 
    description: 'Physical, emotional, or psychological harm' 
  },
  { 
    value: 'discrimination', 
    label: 'Discrimination', 
    description: 'Bias based on race, gender, religion, disability' 
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Any other injustice or wrongdoing' 
  },
];

export default function ReportPage() {
  const navigate = useNavigate();
  
  // Form state
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory | ''>('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Character count for feedback
  const charCount = description.length;
  const minChars = 10;
  const maxChars = 5000;
  const isValidLength = charCount >= minChars && charCount <= maxChars;
  
  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate
    if (!isValidLength) {
      setError(`Please provide at least ${minChars} characters.`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Submit the report
      const response: ReportResponse = await api.submitReport({
        description: description.trim(),
        category: category || null,
      });
      
      // Navigate to success page with the response data
      // Using state to pass data between pages (not in URL for privacy)
      navigate('/success', { state: { report: response } });
      
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Privacy Reminder */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">Your Privacy is Protected</h3>
              <p className="mt-1 text-sm text-green-700">
                We do not collect your name, email, IP address, or any identifying information. 
                Your report is completely anonymous.
              </p>
            </div>
          </div>
        </div>
        
        {/* Form Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report an Incident</h1>
              <p className="text-gray-600">Share what happened in your own words</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">Unable to Submit</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Description Field */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What happened? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident in as much detail as you feel comfortable sharing. You can include when it happened, who was involved (without names if you prefer), and any other relevant context."
                className="input min-h-[200px] resize-y"
                disabled={isSubmitting}
                required
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className={charCount < minChars ? 'text-amber-600' : 'text-gray-500'}>
                  {charCount < minChars 
                    ? `${minChars - charCount} more characters needed`
                    : `${charCount} / ${maxChars} characters`
                  }
                </span>
                {charCount > maxChars && (
                  <span className="text-red-500">Too long</span>
                )}
              </div>
            </div>
            
            {/* Category Field (Optional) */}
            <div>
              <label 
                htmlFor="category" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category <span className="text-gray-400">(optional)</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="input"
                disabled={isSubmitting}
              >
                <option value="">Select a category (or let AI decide)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Not sure? Leave this blank and our AI will categorize it for you.
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !isValidLength}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Analyzing your report...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
              
              {isSubmitting && (
                <p className="mt-3 text-sm text-gray-500 text-center">
                  This may take a few seconds while we analyze your report...
                </p>
              )}
            </div>
          </form>
        </div>
        
        {/* Additional Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By submitting, you acknowledge that this report will be reviewed by authorized personnel
            who can help connect you with appropriate resources.
          </p>
        </div>
      </div>
    </div>
  );
}