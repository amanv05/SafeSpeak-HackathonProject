/**
 * MongoDB Database Connection
 * 
 * WHY THIS FILE EXISTS:
 * - Handles database connection with retry logic
 * - Graceful handling of connection failures
 * - App can start even if DB is temporarily unavailable
 * - Provides connection status for health checks
 */

import mongoose from 'mongoose';
import { config } from './env.js';

// Track connection status for health checks
let isConnected = false;
let connectionError = null;

/**
 * Connect to MongoDB with retry logic
 * 
 * WHY RETRY LOGIC:
 * - Database might be starting up (Docker, etc.)
 * - Network issues are often temporary
 * - Better UX than immediate crash
 */
export async function connectDatabase() {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds between retries
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔌 Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      
      await mongoose.connect(config.mongodbUri, {
        // These options help with connection stability
        serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
        heartbeatFrequencyMS: 10000,    // Check connection every 10s
      });
      
      isConnected = true;
      connectionError = null;
      console.log('✅ MongoDB connected successfully!');
      
      // Handle disconnection events
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        isConnected = false;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        isConnected = true;
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB error:', err.message);
        connectionError = err.message;
      });
      
      return true;
      
    } catch (error) {
      connectionError = error.message;
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`   Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // All retries failed
  console.error('❌ Could not connect to MongoDB after all retries');
  console.error('   App will start anyway, but database features won\'t work');
  return false;
}

/**
 * Get database connection status
 * Used by health check endpoint
 */
export function getDatabaseStatus() {
  return {
    isConnected,
    error: connectionError,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  };
}

/**
 * Gracefully close database connection
 * Used during app shutdown
 */
export async function closeDatabase() {
  if (isConnected) {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed');
  }
}