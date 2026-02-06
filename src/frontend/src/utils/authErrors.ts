/**
 * Utility functions for classifying authentication and authorization errors
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

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}
