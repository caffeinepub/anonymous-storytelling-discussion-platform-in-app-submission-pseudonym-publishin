import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export type BackendAvailabilityState = 'unknown' | 'checking' | 'reachable' | 'unreachable';

export interface BackendAvailability {
  state: BackendAvailabilityState;
  error: string | null;
  isChecking: boolean;
}

/**
 * Hook to check backend canister availability using the heartbeat endpoint
 * Only runs when explicitly enabled (e.g., after a feed load failure)
 */
export function useBackendAvailability(enabled: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['backendHeartbeat'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.checkBackendHeartbeat();
        return result;
      } catch (error) {
        console.error('Backend heartbeat check failed:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: 1,
    retryDelay: 500,
    staleTime: 0, // Always fresh check
    gcTime: 0, // Don't cache
  });

  let state: BackendAvailabilityState = 'unknown';
  let error: string | null = null;

  if (!enabled) {
    state = 'unknown';
  } else if (query.isLoading || actorFetching) {
    state = 'checking';
  } else if (query.isSuccess && query.data === true) {
    state = 'reachable';
  } else if (query.isError) {
    state = 'unreachable';
    error = query.error instanceof Error ? query.error.message : 'Backend unreachable';
  }

  return {
    state,
    error,
    isChecking: query.isLoading || actorFetching,
    refetch: query.refetch,
  };
}
