/**
 * Loading Spinner Component
 * 
 * WHY:
 * - Visual feedback during async operations
 * - Consistent loading state across the app
 * - Customizable size
 */

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  /** Size of the spinner: 'sm', 'md', 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Optional text to display below spinner */
  text?: string;
  /** Fill the container */
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
      {text && (
        <p className="text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80 z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}