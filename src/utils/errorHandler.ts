import { toast } from 'react-hot-toast';

// Error types
export enum ErrorType {
  AUTH = 'auth',
  API = 'api',
  PAYMENT = 'payment',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Error interface
interface AppError {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  originalError?: any;
  context?: Record<string, any>;
}

// Function to log errors to console with additional context
const logError = (error: AppError) => {
  console.error(`[${error.type.toUpperCase()}][${error.severity.toUpperCase()}] ${error.message}`, {
    originalError: error.originalError,
    context: error.context,
    timestamp: new Date().toISOString(),
  });
};

// Function to show appropriate toast based on error severity
const showErrorToast = (error: AppError) => {
  switch (error.severity) {
    case ErrorSeverity.INFO:
      toast(error.message, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
        icon: 'ℹ️',
      });
      break;
    case ErrorSeverity.WARNING:
      toast(error.message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#F59E0B',
          color: '#fff',
        },
        icon: '⚠️',
      });
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      toast.error(error.message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      break;
    default:
      toast.error(error.message);
  }
};

// Main error handler function
export const handleError = (
  error: Error | string | unknown,
  type: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  context?: Record<string, any>,
  showToast: boolean = true
): AppError => {
  // Format the error message
  let errorMessage = 'An unexpected error occurred';
  let originalError = error;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || 'An unexpected error occurred';
    originalError = error;
  }

  // Create the AppError object
  const appError: AppError = {
    type,
    message: errorMessage,
    severity,
    originalError,
    context,
  };

  // Log the error
  logError(appError);

  // Show toast notification if enabled
  if (showToast) {
    showErrorToast(appError);
  }

  return appError;
};

// Helper functions for common error types
export const handleAuthError = (
  error: Error | string | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
) => {
  return handleError(error, ErrorType.AUTH, ErrorSeverity.ERROR, context, showToast);
};

export const handleApiError = (
  error: Error | string | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
) => {
  return handleError(error, ErrorType.API, ErrorSeverity.ERROR, context, showToast);
};

export const handlePaymentError = (
  error: Error | string | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
) => {
  return handleError(error, ErrorType.PAYMENT, ErrorSeverity.ERROR, context, showToast);
};

export const handleRateLimitError = (
  error: Error | string | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
) => {
  return handleError(error, ErrorType.RATE_LIMIT, ErrorSeverity.WARNING, context, showToast);
};

export const handleValidationError = (
  error: Error | string | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
) => {
  return handleError(error, ErrorType.VALIDATION, ErrorSeverity.WARNING, context, showToast);
};

export const handleNetworkError = (
  error: Error | string | unknown,
  context?: Record<string, any>,
  showToast: boolean = true
) => {
  return handleError(error, ErrorType.NETWORK, ErrorSeverity.ERROR, context, showToast);
};
