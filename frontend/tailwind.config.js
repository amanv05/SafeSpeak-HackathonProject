/**
 * Tailwind CSS Configuration
 * 
 * WHY TAILWIND:
 * - Utility-first CSS (write styles directly in HTML)
 * - Consistent design system
 * - Small production bundle (unused classes are removed)
 * - Great for rapid prototyping
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Files to scan for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // Custom colors for SafeSpeak brand
      colors: {
        // Primary: Calming blue (trust, safety)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Accent: Warm green (hope, action)
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Severity colors for reports
        severity: {
          low: '#22c55e',      // Green
          medium: '#f59e0b',   // Amber
          high: '#ef4444',     // Red
          critical: '#7c2d12', // Dark red
        },
      },
      
      // Custom font family (system fonts for reliability)
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  
  plugins: [],
};