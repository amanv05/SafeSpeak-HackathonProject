/**
 * Input Validation Schemas
 * 
 * WHY ZOD:
 * - Type-safe validation (works great with TypeScript)
 * - Clear error messages
 * - Easy to define complex validations
 * - Parses AND validates in one step
 * 
 * WHY VALIDATE:
 * - Prevents invalid data from reaching the database
 * - Security: blocks injection attacks
 * - Better error messages for users
 */

import { z } from 'zod';

/**
 * Report submission validation
 * 
 * WHY these specific rules:
 * - description: Min 10 chars ensures meaningful content, max 5000 prevents abuse
 * - category: Optional, enum ensures only valid values
 */
export const reportSchema = z.object({
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be text',
    })
    .min(10, 'Please provide more detail (at least 10 characters)')
    .max(5000, 'Description is too long (max 5000 characters)')
    .trim(), // Remove leading/trailing whitespace
    
  category: z
    .enum(['harassment', 'corruption', 'abuse', 'discrimination', 'other'], {
      invalid_type_error: 'Invalid category selected',
    })
    .optional()
    .nullable(),
});

/**
 * Admin login validation
 * 
 * WHY these rules:
 * - username: Basic length check
 * - password: Minimum length for security
 */
export const loginSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
    })
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long')
    .toLowerCase() // Normalize to lowercase
    .trim(),
    
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password is required'), // Don't leak min length in login errors
});

/**
 * Report filter validation (for admin queries)
 */
export const reportFilterSchema = z.object({
  category: z
    .enum(['harassment', 'corruption', 'abuse', 'discrimination', 'other', 'unknown'])
    .optional(),
    
  status: z
    .enum(['new', 'reviewing', 'resolved', 'archived'])
    .optional(),
    
  page: z
    .string()
    .transform(Number) // Convert string to number
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
    
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('20'),
});

/**
 * Helper function to validate and get clean data or errors
 * 
 * WHY:
 * - Consistent validation handling across all routes
 * - Returns either { success: true, data } or { success: false, errors }
 * 
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {any} data - The data to validate
 * @returns {{ success: boolean, data?: any, errors?: string[] }}
 */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Extract error messages
  const errors = result.error.errors.map(err => {
    // Include the field name for clarity
    const field = err.path.join('.');
    return field ? `${field}: ${err.message}` : err.message;
  });
  
  return { success: false, errors };
}