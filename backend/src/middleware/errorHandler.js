/**
 * Global Error Handler Middleware
 * 
 * WHY THIS EXISTS:
 * - Catches all errors that weren't handled in routes
 * - Provides consistent error response format
 * - Prevents the app from crashing on unexpected errors
 * - Logs errors for debugging
 * 
 * HOW IT WORKS:
 * - Express calls this when next(error) is called
 * - Or when an error is thrown in async route handlers
 * - Returns a clean JSON response instead of stack traces
 */

import { config } from '../../config/env.js';

/**
 * Not Found Handler
 * Catches requests to undefined routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
  });
}

/**
 * Global Error Handler
 * Must have 4 parameters for Express to recognize it as error middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error (but not in tests)
  if (config.nodeEnv !== 'test') {
    console.error('❌ Error:', err.message);
    if (config.isDevelopment) {
      console.error(err.stack);
    }
  }
  
  // Determine the status code
  // WHY: Some errors have a statusCode property, otherwise use 500
  let statusCode = err.statusCode || err.status || 500;
  
  // Handle specific error types
  let errorResponse = {
    success: false,
    error: err.name || 'Error',
    message: err.message || 'An unexpected error occurred',
  };
  
  // Mongoose validation error
  // WHY: These have a specific structure we need to extract
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    errorResponse = {
      success: false,
      error: 'Validation Error',
      message: messages.join(', '),
      details: messages,
    };
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    errorResponse = {
      success: false,
      error: 'Duplicate Error',
      message: `${field || 'Value'} already exists`,
    };
  }
  
  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse = {
      success: false,
      error: 'Invalid ID',
      message: 'The provided ID is not valid',
    };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse = {
      success: false,
      error: 'Invalid Token',
      message: 'The authentication token is invalid',
    };
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse = {
      success: false,
      error: 'Token Expired',
      message: 'Your session has expired. Please log in again.',
    };
  }
  
  // In development, include stack trace for debugging
  // WHY: Helpful for debugging, but never expose in production
  if (config.isDevelopment) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Async Handler Wrapper
 * 
 * WHY:
 * - Express doesn't automatically catch errors in async functions
 * - This wrapper catches them and passes to the error handler
 * 
 * USAGE:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   // Errors here are automatically caught
 *   throw new Error('This will be handled!');
 * }));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create a custom error with status code
 * 
 * USAGE:
 * throw createError(400, 'Bad request message');
 */
export function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}