/**
 * Authentication Middleware
 * 
 * WHY THIS EXISTS:
 * - Protects admin routes from unauthorized access
 * - Validates JWT tokens
 * - Attaches admin info to request for use in route handlers
 * 
 * HOW JWT WORKS:
 * 1. Admin logs in → receives a token
 * 2. Token is sent with each request (in Authorization header)
 * 3. This middleware verifies the token is valid
 * 4. If valid, request proceeds; if not, 401 error
 */

import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { Admin } from '../models/Admin.js';

/**
 * Middleware to require admin authentication
 * 
 * USAGE:
 * router.get('/protected-route', requireAdmin, (req, res) => {
 *   // req.admin is available here
 * });
 */
export async function requireAdmin(req, res, next) {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid authentication token',
      });
    }
    
    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
    }
    
    // Verify the token
    // WHY try/catch: jwt.verify throws if token is invalid/expired
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtError) {
      // Provide specific error messages
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.',
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid',
      });
    }
    
    // Find the admin in database
    // WHY: Token might be valid but admin could be deleted/deactivated
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Admin account not found or inactive',
      });
    }
    
    // Attach admin to request for use in route handlers
    req.admin = {
      id: admin._id,
      username: admin.username,
      displayName: admin.displayName,
    };
    
    // Continue to the next middleware/route handler
    next();
    
  } catch (error) {
    // Unexpected errors
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
}

/**
 * Generate a JWT token for an admin
 * 
 * @param {Object} admin - The admin document
 * @returns {string} JWT token
 */
export function generateToken(admin) {
  const payload = {
    adminId: admin._id,
    username: admin.username,
  };
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}