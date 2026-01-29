/**
 * Environment Configuration
 * 
 * WHY THIS FILE EXISTS:
 * - Validates all required environment variables at startup
 * - Fails fast if something is missing (better than crashing later)
 * - Provides sensible defaults where possible
 * - Single source of truth for all config values
 */

import dotenv from 'dotenv';

// Load .env file (only needed in development)
// In production, env vars are set directly on the platform
dotenv.config();

/**
 * Validates that a required environment variable exists
 * @param {string} name - Name of the environment variable
 * @param {string} [defaultValue] - Optional default value
 * @returns {string} The value of the environment variable
 */
function requireEnv(name, defaultValue) {
  const value = process.env[name] || defaultValue;
  
  if (!value) {
    // In production, we want to fail loudly if config is missing
    console.error(`❌ Missing required environment variable: ${name}`);
    console.error(`   Please set ${name} in your .env file or environment`);
    process.exit(1);
  }
  
  return value;
}

/**
 * Optional environment variable (won't crash if missing)
 * @param {string} name - Name of the environment variable
 * @param {string} defaultValue - Default value if not set
 * @returns {string} The value or default
 */
function optionalEnv(name, defaultValue) {
  return process.env[name] || defaultValue;
}

// Export all configuration values
// WHY: Centralizing config makes it easy to see what the app needs
export const config = {
  // Server Configuration
  port: optionalEnv('PORT', '5000'),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  
  // Database Configuration
  // WHY requireEnv: App can't work without a database
  mongodbUri: requireEnv('MONGODB_URI', 'mongodb://localhost:27017/safespeak'),
  
  // Authentication
  // WHY requireEnv: Security-critical, must be explicitly set
  jwtSecret: requireEnv('JWT_SECRET', 'dev-secret-change-in-production'),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '24h'),
  
  // AI Configuration
  // WHY requireEnv: Core feature, but we have fallback handling
  geminiApiKey: optionalEnv('GEMINI_API_KEY', ''),
  
  // CORS Configuration
  // WHY: Needed for frontend to communicate with backend
  frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
  
  // Computed values
  isDevelopment: optionalEnv('NODE_ENV', 'development') === 'development',
  isProduction: optionalEnv('NODE_ENV', 'development') === 'production',
};

// Log configuration status (hide sensitive values)
console.log('📋 Configuration loaded:');
console.log(`   - Port: ${config.port}`);
console.log(`   - Environment: ${config.nodeEnv}`);
console.log(`   - MongoDB: ${config.mongodbUri.includes('localhost') ? 'localhost' : 'remote'}`);
console.log(`   - Gemini API: ${config.geminiApiKey ? '✅ configured' : '⚠️ not set (will use fallback)'}`);
console.log(`   - Frontend URL: ${config.frontendUrl}`);