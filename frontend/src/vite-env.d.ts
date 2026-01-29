/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * 
 * WHY:
 * - TypeScript needs to know what env vars exist
 * - Enables autocomplete and type checking
 * - Documents required configuration
 */

interface ImportMetaEnv {
  /** Backend API URL (e.g., http://localhost:5000) */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}