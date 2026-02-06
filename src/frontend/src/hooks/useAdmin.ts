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
      // Use the correct backend method: callerIsAdmin
      return await actor.callerIsAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Get all pending submissions (admin only)
export function useGetPendingStories(isAdmin: boolean | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['pendingStories'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingStories();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
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
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingStories'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStory'] });
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
      // Invalidate all published content queries
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStory'] });
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

// Delete all published articles (admin only)
export function useDeleteAllArticles() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminDeleteAllArticles();
    },
    onSuccess: () => {
      // Invalidate all content and discussion queries
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStory'] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['storyComments'] });
    },
  });
}
