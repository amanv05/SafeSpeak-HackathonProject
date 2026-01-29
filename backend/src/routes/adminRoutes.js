/**
 * Admin Routes
 * 
 * ENDPOINTS:
 * - POST /api/admin/login - Admin authentication
 * - GET /api/admin/reports - Get all reports (protected)
 * - PATCH /api/admin/reports/:id - Update report status (protected)
 * 
 * WHY SEPARATE FROM REPORT ROUTES:
 * - Different authentication requirements
 * - Different concerns (admin vs user)
 * - Easier to maintain and secure
 */

import express from 'express';
import { Admin } from '../models/Admin.js';
import { Report } from '../models/Report.js';
import { loginSchema, reportFilterSchema, validate } from '../utils/validation.js';
import { requireAdmin, generateToken } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/admin/login
 * Authenticate an admin and return a JWT token
 * 
 * REQUEST BODY:
 * {
 *   username: string,
 *   password: string
 * }
 * 
 * RESPONSE:
 * {
 *   success: true,
 *   token: string,
 *   admin: { username, displayName }
 * }
 */
router.post('/login', asyncHandler(async (req, res) => {
  // Step 1: Validate input
  const validation = validate(loginSchema, req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please provide username and password',
      details: validation.errors,
    });
  }
  
  const { username, password } = validation.data;
  
  // Step 2: Find admin and verify password
  // WHY use findByCredentials: Encapsulates the logic and selects password field
  const admin = await Admin.findByCredentials(username, password);
  
  if (!admin) {
    // WHY same message for both: Don't reveal if username exists
    // This is a security best practice
    return res.status(401).json({
      success: false,
      error: 'Authentication Failed',
      message: 'Invalid username or password',
    });
  }
  
  // Step 3: Update last login timestamp
  admin.lastLogin = new Date();
  await admin.save();
  
  // Step 4: Generate JWT token
  const token = generateToken(admin);
  
  console.log(`✅ Admin logged in: ${admin.username}`);
  
  // Step 5: Send response
  res.json({
    success: true,
    message: 'Login successful',
    token,
    admin: {
      username: admin.username,
      displayName: admin.displayName,
    },
  });
}));

/**
 * GET /api/admin/reports
 * Get all reports (paginated, filterable)
 * 
 * QUERY PARAMS:
 * - category: filter by AI category
 * - status: filter by report status
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * 
 * REQUIRES: Admin authentication
 */
router.get('/reports', requireAdmin, asyncHandler(async (req, res) => {
  // Validate and parse query params
  const validation = validate(reportFilterSchema, req.query);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Query Parameters',
      details: validation.errors,
    });
  }
  
  const { category, status, page, limit } = validation.data;
  
  // Build filter object
  // WHY dynamic: Only include filters that were actually provided
  const filter = {};
  if (category) filter.aiCategory = category;
  if (status) filter.status = status;
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  // WHY parallel: Get results and count at the same time
  const [reports, totalCount] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .select('-description') // Don't send full description in list view
      .lean(), // Convert to plain objects (faster)
    Report.countDocuments(filter),
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({
    success: true,
    data: {
      reports: reports.map(report => ({
        id: report._id,
        category: report.aiCategory,
        severity: report.aiSeverity,
        summary: report.aiSummary,
        status: report.status,
        createdAt: report.createdAt,
        aiAnalyzed: report.aiAnalyzed,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
}));

/**
 * GET /api/admin/reports/:id
 * Get a single report by ID
 * 
 * REQUIRES: Admin authentication
 */
router.get('/reports/:id', requireAdmin, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    throw createError(404, 'Report not found');
  }
  
  res.json({
    success: true,
    data: {
      id: report._id,
      description: report.description,
      userSelectedCategory: report.userSelectedCategory,
      category: report.aiCategory,
      severity: report.aiSeverity,
      summary: report.aiSummary,
      suggestions: report.aiSuggestions,
      status: report.status,
      adminNotes: report.adminNotes,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      aiAnalyzed: report.aiAnalyzed,
    },
  });
}));

/**
 * PATCH /api/admin/reports/:id
 * Update a report's status or admin notes
 * 
 * REQUEST BODY:
 * {
 *   status?: 'new' | 'reviewing' | 'resolved' | 'archived',
 *   adminNotes?: string
 * }
 * 
 * REQUIRES: Admin authentication
 */
router.patch('/reports/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  
  // Build update object
  const update = {};
  if (status) update.status = status;
  if (adminNotes !== undefined) update.adminNotes = adminNotes;
  
  if (Object.keys(update).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No updates provided',
      message: 'Please provide status or adminNotes to update',
    });
  }
  
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
  );
  
  if (!report) {
    throw createError(404, 'Report not found');
  }
  
  console.log(`✅ Report ${report._id} updated by ${req.admin.username}`);
  
  res.json({
    success: true,
    message: 'Report updated successfully',
    data: {
      id: report._id,
      status: report.status,
      adminNotes: report.adminNotes,
    },
  });
}));

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 * 
 * REQUIRES: Admin authentication
 */
router.get('/stats', requireAdmin, asyncHandler(async (req, res) => {
  // Get various counts in parallel
  const [
    totalReports,
    newReports,
    byCategory,
    bySeverity,
  ] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ status: 'new' }),
    Report.aggregate([
      { $group: { _id: '$aiCategory', count: { $sum: 1 } } },
    ]),
    Report.aggregate([
      { $group: { _id: '$aiSeverity', count: { $sum: 1 } } },
    ]),
  ]);
  
  // Format aggregation results into objects
  const categoryStats = Object.fromEntries(
    byCategory.map(item => [item._id, item.count])
  );
  const severityStats = Object.fromEntries(
    bySeverity.map(item => [item._id, item.count])
  );
  
  res.json({
    success: true,
    data: {
      totalReports,
      newReports,
      byCategory: categoryStats,
      bySeverity: severityStats,
    },
  });
}));

export default router;