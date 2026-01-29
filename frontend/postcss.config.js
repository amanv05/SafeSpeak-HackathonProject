/**
 * PostCSS Configuration
 * 
 * WHY:
 * - Required for Tailwind CSS to work
 * - Autoprefixer adds vendor prefixes for browser compatibility
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};