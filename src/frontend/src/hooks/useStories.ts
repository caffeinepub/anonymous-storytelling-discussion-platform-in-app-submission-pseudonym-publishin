import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story } from '../backend';

interface Comment {
  commenterHandle: string;
  comment: string;
  timestamp: bigint;
}

export function useGetPublishedStories() {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['publishedStories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedStories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublishedStory(title: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Story>({
    queryKey: ['publishedStory', title],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPublishedStory(title);
    },
    enabled: !!actor && !isFetching && !!title,
  });
}

export function useGetComments(storyTitle: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', storyTitle],
    queryFn: async () => {
      if (!actor) return [];
      // The backend doesn't have a direct getComments method, 
      // but we can infer comments are part of the story data structure
      // For now, return empty array as comments are managed through the story
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
