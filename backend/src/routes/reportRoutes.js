/**
 * Report Routes
 * 
 * ENDPOINTS:
 * - POST /api/report - Submit an anonymous report
 * 
 * WHY NO AUTH:
 * - Reports are anonymous
 * - No user accounts required
 * - This is intentional for user safety
 */

import express from 'express';
import { Report } from '../models/Report.js';
import { analyzeReport } from '../services/geminiService.js';
import { reportSchema, validate } from '../utils/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/report
 * Submit an anonymous incident report
 * 
 * REQUEST BODY:
 * {
 *   description: string (required, 10-5000 chars)
 *   category: string (optional, enum)
 * }
 * 
 * RESPONSE:
 * {
 *   success: true,
 *   message: string,
 *   report: {
 *     id: string,
 *     category: string,
 *     severity: string,
 *     summary: string,
 *     suggestions: array
 *   }
 * }
 */
router.post('/', asyncHandler(async (req, res) => {
  // Step 1: Validate input
  // WHY: Ensures we only process valid data
  const validation = validate(reportSchema, req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please check your input',
      details: validation.errors,
    });
  }
  
  const { description, category } = validation.data;
  
  console.log('📝 New report received (length:', description.length, 'chars)');
  
  // Step 2: Analyze with AI
  // WHY: Get category, severity, and helpful suggestions
  // NOTE: This has built-in error handling and fallback
  const aiAnalysis = await analyzeReport(description);
  
  // Step 3: Create and save report
  // WHY: Combine user input with AI analysis
  const report = new Report({
    description,
    userSelectedCategory: category || null,
    ...aiAnalysis, // Spread AI results (aiCategory, aiSeverity, etc.)
  });
  
  await report.save();
  
  console.log('✅ Report saved with ID:', report._id);
  
  // Step 4: Send response
  // WHY: Return enough info for the success page, but not the full report
  res.status(201).json({
    success: true,
    message: 'Your report has been submitted successfully. Thank you for speaking up.',
    report: {
      id: report._id,
      category: report.aiCategory,
      severity: report.aiSeverity,
      summary: report.aiSummary,
      suggestions: report.aiSuggestions,
      analyzedByAI: report.aiAnalyzed,
    },
  });
}));

export default router;