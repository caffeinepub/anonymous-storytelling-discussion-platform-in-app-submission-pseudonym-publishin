/**
 * Utility to generate canister access URLs for troubleshooting
 */

export interface CanisterUrls {
  canisterId: string;
  standardUrl: string;
  rawUrl: string;
}

/**
 * Get the backend canister ID from the environment
 * The canister ID is typically available via import.meta.env or window
 */
export function getBackendCanisterId(): string {
  // Try to get from Vite environment variables
  if (import.meta.env.VITE_BACKEND_CANISTER_ID) {
    return import.meta.env.VITE_BACKEND_CANISTER_ID;
  }

  // Try to get from window (injected at build time)
  if (typeof window !== 'undefined' && (window as any).canisterId) {
    return (window as any).canisterId;
  }

  // Fallback: try to extract from current URL if we're already on a canister domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const match = hostname.match(/^([a-z0-9-]+)\.(?:raw\.)?icp0\.io$/);
    if (match) {
      return match[1];
    }
  }

  // Default fallback (will be replaced at build time in most cases)
  return 'g5zij-2qaaa-aaaap-ahmoq-cai';
}

/**
 * Generate both standard and raw canister URLs
 */
export function getCanisterUrls(): CanisterUrls {
  const canisterId = getBackendCanisterId();
  
  return {
    canisterId,
    standardUrl: `https://${canisterId}.icp0.io`,
    rawUrl: `https://${canisterId}.raw.icp0.io`,
  };
}
