import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story } from '../backend';
import { Principal } from '@dfinity/principal';

// Check if the current user is an admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Get all pending submissions (admin only)
export function useGetPendingStories() {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['pendingStories'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingStories();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Publish a pending story (admin only)
export function usePublishStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminPublishStory(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingStories'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
    },
  });
}

// Create and publish a new article directly (admin only)
export function useCreateAndPublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      authorPseudonym: string;
      story: string;
      isAnonymous: boolean;
      authorName: string | null;
      authorPrincipal: Principal | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminCreateAndPublishArticle(
        params.title,
        params.authorPseudonym,
        params.story,
        params.isAnonymous,
        params.authorName,
        params.authorPrincipal
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
    },
  });
}

// Delete a published article (admin only)
export function useDeletePublishedArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminDeletePublishedArticle(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStory'] });
    },
  });
}
