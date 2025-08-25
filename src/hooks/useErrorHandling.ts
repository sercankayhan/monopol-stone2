"use client";

import { useState, useCallback, useEffect } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

interface ErrorHandlingConfig {
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: any) => void;
  enableLogging?: boolean;
}

export const useErrorHandling = (config: ErrorHandlingConfig = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    enableLogging = true,
  } = config;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  });

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  }, []);

  // Handle error with retry logic
  const handleError = useCallback((error: Error, errorInfo?: any) => {
    const newRetryCount = errorState.retryCount + 1;
    
    setErrorState({
      hasError: true,
      error,
      errorInfo,
      retryCount: newRetryCount,
    });

    // Log error
    if (enableLogging) {
      console.error('Error caught by useErrorHandling:', error, errorInfo);
      
      // Send to monitoring service
      logErrorToService(error, errorInfo, newRetryCount);
    }

    // Call custom error handler
    onError?.(error, errorInfo);
  }, [errorState.retryCount, enableLogging, onError]);

  // Retry function
  const retry = useCallback(() => {
    if (errorState.retryCount < maxRetries) {
      setTimeout(() => {
        clearError();
      }, retryDelay);
    }
  }, [errorState.retryCount, maxRetries, retryDelay, clearError]);

  // Async error wrapper
  const executeWithErrorHandling = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    operationName?: string
  ): Promise<T | null> => {
    try {
      const result = await asyncOperation();
      clearError(); // Clear any previous errors on success
      return result;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      if (enableLogging && operationName) {
        console.error(`Error in ${operationName}:`, errorInstance);
      }
      
      handleError(errorInstance, { operationName });
      return null;
    }
  }, [clearError, enableLogging, handleError]);

  // Sync error wrapper
  const executeWithSyncErrorHandling = useCallback(<T>(
    operation: () => T,
    operationName?: string
  ): T | null => {
    try {
      const result = operation();
      clearError(); // Clear any previous errors on success
      return result;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      if (enableLogging && operationName) {
        console.error(`Error in ${operationName}:`, errorInstance);
      }
      
      handleError(errorInstance, { operationName });
      return null;
    }
  }, [clearError, enableLogging, handleError]);

  return {
    ...errorState,
    clearError,
    retry,
    handleError,
    executeWithErrorHandling,
    executeWithSyncErrorHandling,
    canRetry: errorState.retryCount < maxRetries,
  };
};

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    logErrorToService(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { type: 'unhandledrejection' },
      0
    );
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    logErrorToService(
      event.error || new Error(event.message),
      {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      0
    );
  });
};

// Error logging service
const logErrorToService = (error: Error, errorInfo: any, retryCount: number) => {
  if (typeof window === 'undefined') return;

  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    errorInfo,
    retryCount,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: getUserId(), // You can implement this based on your auth system
    sessionId: getSessionId(),
  };

  // Send to monitoring services
  sendToSentry(errorData);
  sendToCustomAnalytics(errorData);
  sendToLocalStorage(errorData);
};

// Sentry integration (if using Sentry)
const sendToSentry = (errorData: any) => {
  try {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(errorData.message), {
        extra: errorData,
      });
    }
  } catch (error) {
    console.warn('Failed to send error to Sentry:', error);
  }
};

// Custom analytics endpoint
const sendToCustomAnalytics = async (errorData: any) => {
  try {
    await fetch('/api/error-logging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'error',
        data: errorData,
      }),
    });
  } catch (error) {
    console.warn('Failed to send error to analytics endpoint:', error);
  }
};

// Store errors in localStorage for offline scenarios
const sendToLocalStorage = (errorData: any) => {
  try {
    const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
    errors.push(errorData);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    
    localStorage.setItem('error_logs', JSON.stringify(errors));
  } catch (error) {
    console.warn('Failed to store error in localStorage:', error);
  }
};

// Utility functions
const getUserId = (): string | null => {
  // Implement based on your authentication system
  try {
    // Example: return localStorage.getItem('userId');
    return null;
  } catch {
    return null;
  }
};

const getSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  } catch {
    return 'session_' + Date.now();
  }
};

// Hook for form error handling
export const useFormErrorHandling = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setSubmitError(null);
  }, []);

  const validateField = useCallback((field: string, value: any, validator: (value: any) => string | null) => {
    const error = validator(value);
    if (error) {
      setFieldError(field, error);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }, [setFieldError, clearFieldError]);

  return {
    fieldErrors,
    submitError,
    setFieldError,
    clearFieldError,
    setSubmitError,
    clearAllErrors,
    validateField,
    hasErrors: Object.keys(fieldErrors).length > 0 || submitError !== null,
  };
};