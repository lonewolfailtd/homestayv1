import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Global error handler for API responses
export const handleApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new AppError(
      'Unable to connect to the server. Please check your internet connection.',
      0,
      'NETWORK_ERROR'
    );
  }

  // Handle HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return new AppError(
          error.message || 'Invalid request. Please check your input.',
          400,
          'BAD_REQUEST'
        );
      case 401:
        return new AppError(
          'You need to sign in to access this feature.',
          401,
          'UNAUTHORIZED'
        );
      case 403:
        return new AppError(
          'You don\'t have permission to perform this action.',
          403,
          'FORBIDDEN'
        );
      case 404:
        return new AppError(
          'The requested resource was not found.',
          404,
          'NOT_FOUND'
        );
      case 409:
        return new AppError(
          error.message || 'This action conflicts with existing data.',
          409,
          'CONFLICT'
        );
      case 429:
        return new AppError(
          'Too many requests. Please wait a moment and try again.',
          429,
          'RATE_LIMITED'
        );
      case 500:
        return new AppError(
          'Server error. Please try again later.',
          500,
          'INTERNAL_ERROR'
        );
      default:
        return new AppError(
          error.message || 'An unexpected error occurred.',
          error.status,
          'UNKNOWN'
        );
    }
  }

  // Fallback for unknown errors
  return new AppError(
    error.message || 'An unexpected error occurred.',
    500,
    'UNKNOWN'
  );
};

// Enhanced fetch wrapper with error handling and retries
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData.details;
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new AppError(errorMessage, response.status, `HTTP_${response.status}`, errorDetails);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error.name === 'AbortError') {
      throw new AppError(
        'Request timed out. Please try again.',
        408,
        'TIMEOUT'
      );
    }

    // Retry logic for network errors and server errors
    if (retries > 0 && (
      error.status === 0 || // Network error
      error.status >= 500 || // Server error
      error.code === 'TIMEOUT'
    )) {
      console.log(`Retrying request to ${url}. Retries left: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return apiRequest<T>(url, options, retries - 1);
    }

    throw handleApiError(error);
  }
};

// User-friendly error messaging
export const getErrorMessage = (error: AppError): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'No internet connection. Please check your network and try again.';
    case 'TIMEOUT':
      return 'Request timed out. The server might be busy, please try again.';
    case 'UNAUTHORIZED':
      return 'Please sign in to continue.';
    case 'FORBIDDEN':
      return 'You don\'t have permission for this action.';
    case 'NOT_FOUND':
      return 'The requested information could not be found.';
    case 'CONFLICT':
      return 'This action conflicts with existing data. Please refresh and try again.';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment before trying again.';
    case 'VALIDATION_ERROR':
      return error.message || 'Please check your input and try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

// Toast error helper
export const showErrorToast = (error: any) => {
  const appError = handleApiError(error);
  const message = getErrorMessage(appError);
  
  toast.error(message, {
    description: process.env.NODE_ENV === 'development' ? appError.details : undefined,
    action: appError.code === 'NETWORK_ERROR' ? {
      label: 'Retry',
      onClick: () => window.location.reload()
    } : undefined
  });
};

// Success toast helper
export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, { description });
};

// Loading toast helper
export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};