/**
 * Vite Configuration
 * 
 * WHY VITE:
 * - Super fast development server (instant hot reload)
 * - Optimized production builds
 * - Great TypeScript support out of the box
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Build output configuration
  build: {
    // Output directory (default, but explicit for clarity)
    outDir: 'dist',
    
    // Generate sourcemaps for production (helpful for debugging)
    sourcemap: true,
  },
  
  // Development server configuration
  server: {
    port: 5173,
    
    // Allow connections from other devices (useful for mobile testing)
    host: true,
  },
  
  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
  },
});