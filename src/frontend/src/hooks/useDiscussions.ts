import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Discussions } from '../backend';

export function useGetAllDiscussions() {
  const { actor, isFetching } = useActor();

  return useQuery<Discussions>({
    queryKey: ['discussions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDiscussions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      storyTitle: string;
      reviewerHandle: string;
      rating: number;
      comment: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(
        params.storyTitle,
        params.reviewerHandle || 'Anonymous',
        params.rating,
        params.comment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
}
