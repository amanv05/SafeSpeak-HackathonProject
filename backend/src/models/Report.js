/**
 * Report Model
 * 
 * WHY THIS SCHEMA:
 * - Stores incident reports with AI analysis results
 * - Deliberately EXCLUDES any personal identifying information
 * - Includes timestamps for tracking when reports come in
 * 
 * PRIVACY NOTE:
 * We do NOT store: name, email, phone, IP address, device info
 * This ensures complete anonymity for reporters
 */

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  // The incident description provided by the reporter
  // WHY required: This is the core of the report
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  
  // Optional category selected by the reporter
  // WHY optional: Reporter may not know what category fits
  userSelectedCategory: {
    type: String,
    enum: ['harassment', 'corruption', 'abuse', 'discrimination', 'other', null],
    default: null,
  },
  
  // AI-determined category
  // WHY separate from userSelectedCategory: AI analysis may differ
  aiCategory: {
    type: String,
    enum: ['harassment', 'corruption', 'abuse', 'discrimination', 'other', 'unknown'],
    default: 'unknown',
  },
  
  // AI-determined severity level
  // WHY: Helps admins prioritize which reports to handle first
  aiSeverity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'unknown'],
    default: 'unknown',
  },
  
  // AI-suggested resources and next steps
  // WHY array: Multiple resources may be relevant
  aiSuggestions: [{
    type: {
      type: String, // 'ngo', 'legal', 'hotline', 'journalist', 'government'
    },
    name: String,
    description: String,
    contact: String, // Could be phone, email, or website
  }],
  
  // AI summary (brief overview for admins)
  aiSummary: {
    type: String,
    maxlength: 500,
  },
  
  // Whether AI analysis was successful
  // WHY: Helps identify reports that need manual review
  aiAnalyzed: {
    type: Boolean,
    default: false,
  },
  
  // Status for admin workflow
  // WHY: Allows admins to track which reports have been reviewed
  status: {
    type: String,
    enum: ['new', 'reviewing', 'resolved', 'archived'],
    default: 'new',
  },
  
  // Admin notes (internal only)
  adminNotes: {
    type: String,
    default: '',
  },

}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true,
});

// Create indexes for common queries
// WHY: Improves performance when filtering/sorting reports
reportSchema.index({ aiCategory: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 }); // Most recent first

// Virtual for a display-friendly date
// WHY: Easier to use in frontend without date formatting
reportSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Ensure virtuals are included in JSON output
reportSchema.set('toJSON', { virtuals: true });

export const Report = mongoose.model('Report', reportSchema);