/**
 * TypeScript Type Definitions
 *
 * WHY TYPES:
 * - Catch errors at compile time (before users see them)
 * - Better IDE autocomplete and documentation
 * - Makes code easier to understand
 *
 * All shared types for the application live here.
 */

// ============================================
// REPORT TYPES
// ============================================

/** Categories for incident reports */
export type ReportCategory =
  | "harassment"
  | "corruption"
  | "abuse"
  | "discrimination"
  | "other"
  | "unknown";

/** Severity levels */
export type ReportSeverity = "low" | "medium" | "high" | "critical" | "unknown";

/** Report status (for admin workflow) */
export type ReportStatus = "new" | "reviewing" | "resolved" | "archived";

/** A suggestion from AI analysis */
export interface Suggestion {
  type: "ngo" | "legal" | "hotline" | "journalist" | "government";
  name: string;
  description: string;
  contact: string;
}

/** Data submitted when creating a report */
export interface ReportSubmission {
  description: string;
  category?: ReportCategory | null;
}

/** Response from submitting a report */
export interface ReportResponse {
  id: string;
  category: ReportCategory;
  severity: ReportSeverity;
  summary: string;
  suggestions: Suggestion[];
  analyzedByAI: boolean;
}

/** A report as seen in the admin dashboard */
export interface AdminReport {
  id: string;
  category: ReportCategory;
  severity: ReportSeverity;
  summary: string;
  status: ReportStatus;
  createdAt: string;
  aiAnalyzed: boolean;
}

/** Full report details (for admin detail view) */
export interface ReportDetail extends AdminReport {
  description: string;
  userSelectedCategory: ReportCategory | null;
  suggestions: Suggestion[];
  adminNotes: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/** Generic API success response */
export interface ApiResponse<T> {
  success: true;
  message?: string;
  data?: T;
}

/** Generic API error response */
export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: string[];
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  success: true;
  data: {
    reports: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// ============================================
// AUTH TYPES
// ============================================

/** Admin login credentials */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Login response */
export interface LoginResponse {
  success: true;
  message: string;
  token: string;
  admin: {
    username: string;
    displayName: string;
  };
}

/** Stored auth state */
export interface AuthState {
  token: string | null;
  admin: {
    username: string;
    displayName: string;
  } | null;
  isAuthenticated: boolean;
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  totalReports: number;
  newReports: number;
  byCategory: Record<ReportCategory, number>;
  bySeverity: Record<ReportSeverity, number>;
}
