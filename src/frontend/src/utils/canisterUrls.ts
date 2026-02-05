/**
 * Utility to generate canister access URLs for troubleshooting
 * Distinguishes between frontend (asset) and backend (API) canisters
 */

export interface CanisterInfo {
  frontendCanisterId: string | null;
  backendCanisterId: string | null;
  standardUrl: string | null;
  rawUrl: string | null;
  source: 'hostname' | 'env' | 'unknown';
}

/**
 * Extract canister ID from the current hostname if on icp0.io or raw.icp0.io
 * This is the FRONTEND/ASSET canister ID (the one serving this website)
 */
function getFrontendCanisterIdFromHostname(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  const match = hostname.match(/^([a-z0-9-]+)\.(?:raw\.)?icp0\.io$/);
  
  return match ? match[1] : null;
}

/**
 * Get the backend canister ID from environment variables
 * This is the BACKEND/API canister ID (the one handling data/logic)
 */
function getBackendCanisterIdFromEnv(): string | null {
  // Try to get from Vite environment variables
  if (import.meta.env.VITE_BACKEND_CANISTER_ID) {
    return import.meta.env.VITE_BACKEND_CANISTER_ID;
  }

  // Try to get from window (injected at build time)
  if (typeof window !== 'undefined' && (window as any).canisterId) {
    return (window as any).canisterId;
  }

  return null;
}

/**
 * Get the frontend canister ID from environment variables
 * This is the FRONTEND/ASSET canister ID from build config
 */
function getFrontendCanisterIdFromEnv(): string | null {
  // Try to get from Vite environment variables
  if (import.meta.env.VITE_FRONTEND_CANISTER_ID) {
    return import.meta.env.VITE_FRONTEND_CANISTER_ID;
  }

  // Try to get from window (injected at build time)
  if (typeof window !== 'undefined' && (window as any).frontendCanisterId) {
    return (window as any).frontendCanisterId;
  }

  return null;
}

/**
 * Get comprehensive canister information for troubleshooting
 * Prioritizes hostname-derived frontend canister ID for URL generation
 */
export function getCanisterInfo(): CanisterInfo {
  // The frontend canister ID is what we need for the website URLs
  const hostnameCanisterId = getFrontendCanisterIdFromHostname();
  const envFrontendCanisterId = getFrontendCanisterIdFromEnv();
  const backendCanisterId = getBackendCanisterIdFromEnv();

  // Determine the active frontend canister ID (prefer hostname, fallback to env)
  const frontendCanisterId = hostnameCanisterId || envFrontendCanisterId;

  // Determine source
  let source: 'hostname' | 'env' | 'unknown' = 'unknown';
  if (hostnameCanisterId) {
    source = 'hostname';
  } else if (envFrontendCanisterId) {
    source = 'env';
  }

  // Generate URLs based on the frontend canister ID
  const standardUrl = frontendCanisterId ? `https://${frontendCanisterId}.icp0.io` : null;
  const rawUrl = frontendCanisterId ? `https://${frontendCanisterId}.raw.icp0.io` : null;

  return {
    frontendCanisterId,
    backendCanisterId,
    standardUrl,
    rawUrl,
    source,
  };
}

/**
 * Legacy function for backward compatibility
 * Returns backend canister ID
 */
export function getBackendCanisterId(): string {
  const backendId = getBackendCanisterIdFromEnv();
  if (backendId) return backendId;
  
  // Fallback: if we can't determine backend, return a placeholder
  // This should trigger the "unknown" state in the UI
  return 'unknown';
}

/**
 * Legacy function for backward compatibility
 * Now returns frontend canister URLs
 */
export function getCanisterUrls() {
  const info = getCanisterInfo();
  return {
    canisterId: info.frontendCanisterId || 'unknown',
    standardUrl: info.standardUrl || 'unknown',
    rawUrl: info.rawUrl || 'unknown',
  };
}
