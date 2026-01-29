/**
 * SafeSpeak Backend Server
 * 
 * This is the main entry point for the API server.
 * 
 * STARTUP SEQUENCE:
 * 1. Load configuration (env vars)
 * 2. Connect to MongoDB (with retry)
 * 3. Set up Express middleware
 * 4. Register routes
 * 5. Start listening
 * 
 * WHY THIS ORDER:
 * - Config must be loaded first (other modules depend on it)
 * - Database should connect before accepting requests
 * - Middleware must be registered before routes
 * - Error handlers must come after routes
 */

import express from 'express';
import cors from 'cors';

// Configuration and database
import { config } from '../config/env.js';
import { connectDatabase, getDatabaseStatus } from '../config/database.js';

// Routes
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// AI service (for health check)
import { getAIStatus } from './services/geminiService.js';

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

/**
 * CORS Configuration
 * 
 * WHY:
 * - Browsers block requests from different origins by default
 * - We need to explicitly allow our frontend to talk to this backend
 */
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (config.isDevelopment) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Allow configured frontend URL
    if (origin === config.frontendUrl) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Block other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies if needed
}));

/**
 * JSON Body Parser
 * 
 * WHY:
 * - Parses incoming JSON request bodies
 * - Makes req.body available in route handlers
 */
app.use(express.json({ limit: '10kb' })); // Limit body size for security

/**
 * Request Logger (development only)
 * 
 * WHY:
 * - Helps debug issues during development
 * - Shows what requests are coming in
 */
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Endpoint
 * 
 * WHY:
 * - Used by deployment platforms to check if app is running
 * - Useful for monitoring and debugging
 * - Returns status of database and AI service
 */
app.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const aiStatus = getAIStatus();
  
  // Overall health is OK if database is connected
  const isHealthy = dbStatus.isConnected;
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus.isConnected ? 'connected' : 'disconnected',
        state: dbStatus.readyStateText,
      },
      ai: {
        status: aiStatus.configured ? 'configured' : 'not configured',
        provider: aiStatus.provider,
      },
    },
    environment: config.nodeEnv,
  });
});

/**
 * API Routes
 * 
 * WHY separate prefixes:
 * - /api/report - Public endpoints for anonymous reporting
 * - /api/admin - Protected endpoints for admins
 */
app.use('/api/report', reportRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Root endpoint
 * WHY: Nice to have a friendly message at the root
 */
app.get('/', (req, res) => {
  res.json({
    name: 'SafeSpeak API',
    version: '1.0.0',
    description: 'Anonymous incident reporting platform',
    endpoints: {
      health: 'GET /health',
      report: 'POST /api/report',
      adminLogin: 'POST /api/admin/login',
      adminReports: 'GET /api/admin/reports (requires auth)',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must come after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  console.log('');
  console.log('🛡️  SafeSpeak Backend Server');
  console.log('============================');
  console.log('');
  
  // Step 1: Connect to database
  // NOTE: App will start even if DB fails (with retry logic)
  const dbConnected = await connectDatabase();
  
  if (!dbConnected) {
    console.log('⚠️ Starting without database connection');
    console.log('   Some features may not work until DB is available');
  }
  
  // Step 2: Start listening
  const port = config.port;
  
  app.listen(port, () => {
    console.log('');
    console.log('✅ Server is running!');
    console.log(`   Local:   http://localhost:${port}`);
    console.log(`   Health:  http://localhost:${port}/health`);
    console.log('');
    console.log('📝 Ready to receive reports');
    console.log('');
  });
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();