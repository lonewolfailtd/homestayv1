'use client';

import { Loader2 } from 'lucide-react';

// Basic loading spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Loading overlay for forms
export const LoadingOverlay: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
    <div className="text-center">
      <LoadingSpinner size="lg" className="text-purple-600 mx-auto mb-3" />
      <p className="text-gray-600 font-body text-sm">{message}</p>
    </div>
  </div>
);

// Skeleton loader for cards
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="card animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Skeleton loader for dashboard stats
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    ))}
  </div>
);

// Skeleton loader for booking list
export const BookingListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 rounded-lg w-12 h-12"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton loader for dog profiles
export const DogProfileSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-200 rounded-lg w-10 h-10"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="flex space-x-1">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="h-9 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

// Loading button
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ loading, children, className = '', disabled, onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`${className} ${loading || disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <LoadingSpinner size="sm" className="mr-2" />
        Loading...
      </div>
    ) : (
      children
    )}
  </button>
);

// Page loading state
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="text-purple-600 mx-auto mb-4" />
      <h2 className="text-xl font-heading text-black mb-2">{message}</h2>
      <p className="text-gray-600 font-body">Please wait a moment</p>
    </div>
  </div>
);

// Form loading overlay with specific message
export const FormLoading: React.FC<{ message: string }> = ({ message }) => (
  <div className="relative">
    <LoadingOverlay message={message} />
  </div>
);