/**
 * Utility functions for classifying authentication, authorization, and connectivity errors
 */

export function isUnauthorizedError(error: unknown): boolean {
  if (!error) return false;
  
  if (error instanceof Error) {
    return error.message.includes('Unauthorized') || 
           error.message.includes('Only admins') ||
           error.message.includes('permission');
  }
  
  if (typeof error === 'string') {
    return error.includes('Unauthorized') || 
           error.includes('Only admins') ||
           error.includes('permission');
  }
  
  return false;
}

export function isActorConnectivityError(error: unknown): boolean {
  if (!error) return false;
  
  if (error instanceof Error) {
    return error.message === 'ACTOR_CONNECTING' || 
           error.message === 'ACTOR_UNAVAILABLE' ||
           error.message === 'BACKEND_NOT_CONFIGURED';
  }
  
  if (typeof error === 'string') {
    return error === 'ACTOR_CONNECTING' || 
           error === 'ACTOR_UNAVAILABLE' ||
           error === 'BACKEND_NOT_CONFIGURED';
  }
  
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof Error) {
    // Handle standardized connectivity errors
    if (error.message === 'ACTOR_CONNECTING') {
      return 'Still connecting to the backend. Please wait a moment and try again.';
    }
    if (error.message === 'ACTOR_UNAVAILABLE') {
      return 'Unable to connect to the backend. Please check your connection and try again.';
    }
    if (error.message === 'BACKEND_NOT_CONFIGURED') {
      return 'Backend canister is not configured. Please check the troubleshooting page for deployment instructions.';
    }
    
    // Handle authorization errors
    if (isUnauthorizedError(error)) {
      return 'You do not have permission to perform this action. Please log in and try again.';
    }
    
    // Return the error message for other errors
    return error.message;
  }
  
  if (typeof error === 'string') {
    // Handle standardized connectivity error strings
    if (error === 'ACTOR_CONNECTING') {
      return 'Still connecting to the backend. Please wait a moment and try again.';
    }
    if (error === 'ACTOR_UNAVAILABLE') {
      return 'Unable to connect to the backend. Please check your connection and try again.';
    }
    if (error === 'BACKEND_NOT_CONFIGURED') {
      return 'Backend canister is not configured. Please check the troubleshooting page for deployment instructions.';
    }
    
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
