import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetAllStories() {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['allStories'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllStories();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function usePublishStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      rewordedStory: string;
      rewordedPseudonym: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminRewordAndPublishStory(
        params.title,
        params.rewordedStory,
        params.rewordedPseudonym
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStories'] });
      queryClient.invalidateQueries({ queryKey: ['publishedStories'] });
    },
  });
}

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
