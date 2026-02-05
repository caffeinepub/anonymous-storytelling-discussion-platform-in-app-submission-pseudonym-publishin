import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story } from '../backend';

interface Comment {
  commenterHandle: string;
  comment: string;
  timestamp: bigint;
}

/**
 * Exponential backoff with cap for retry delays
 */
function getRetryDelay(attemptIndex: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 5000; // 5 seconds cap
  const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
  return delay;
}

export function useGetPublishedStories() {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['publishedStories'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const stories = await actor.getPublishedStories();
        return stories || [];
      } catch (error) {
        console.error('Error fetching published stories:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 4, // Total of 5 attempts (initial + 4 retries)
    retryDelay: getRetryDelay,
  });
}

export function useGetPublishedStory(title: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Story>({
    queryKey: ['publishedStory', title],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getPublishedStory(title);
      } catch (error) {
        console.error('Error fetching story:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!title,
    retry: 2,
  });
}

export function useGetComments(storyTitle: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', storyTitle],
    queryFn: async () => {
      // Backend doesn't have a getComments method yet
      // Comments are stored but not retrievable
      return [];
    },
    enabled: !!actor && !isFetching && !!storyTitle,
  });
}

export function useSubmitStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      authorPseudonym: string;
      story: string;
      isAnonymous: boolean;
      authorName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitStory(
        params.title,
        params.authorPseudonym,
        params.story,
        params.isAnonymous,
        params.authorName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      storyTitle: string;
      commenterHandle: string;
      comment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(
        params.storyTitle,
        params.commenterHandle || 'Anonymous',
        params.comment
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.storyTitle] });
      queryClient.invalidateQueries({ queryKey: ['publishedStory', variables.storyTitle] });
    },
  });
}
