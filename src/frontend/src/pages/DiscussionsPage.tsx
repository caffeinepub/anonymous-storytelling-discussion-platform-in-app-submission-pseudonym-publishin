import { useState } from 'react';
import { useGetAllDiscussions, useAddReview } from '../hooks/useDiscussions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Star, Loader2 } from 'lucide-react';
import { useSearch } from '@tanstack/react-router';
import ReviewComposer from '../components/ReviewComposer';
import ReviewThread from '../components/ReviewThread';
import CommentThreadDisplay from '../components/CommentThreadDisplay';

export default function DiscussionsPage() {
  const search = useSearch({ strict: false }) as { mode?: string };
  const initialMode = search.mode === 'comments' ? 'comments' : 'reviews';
  
  const { data: discussions, isLoading } = useGetAllDiscussions();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [mode, setMode] = useState<'comments' | 'reviews'>(initialMode);

  // Extract unique topics from both comments and reviews
  const topics = discussions
    ? Array.from(
        new Set([
          ...discussions.comments.map((t) => t.storyTitle),
          ...discussions.reviews.map((t) => t.storyTitle),
        ])
      ).sort()
    : [];

  // Auto-select first topic if none selected
  if (!selectedTopic && topics.length > 0) {
    setSelectedTopic(topics[0]);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Discussions</h1>
          <p className="text-muted-foreground text-lg">
            Join the conversation through comments and reviews
          </p>
        </div>

        {/* Topics */}
        {topics.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Topics</h2>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? 'default' : 'outline'}
                  onClick={() => setSelectedTopic(topic)}
                  className="transition-all"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No discussions yet. Be the first to start a conversation!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mode Switch & Thread */}
        {selectedTopic && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'comments' | 'reviews')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="comments" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-6 mt-6">
              <CommentThreadDisplay storyTitle={selectedTopic} />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6 mt-6">
              <ReviewComposer storyTitle={selectedTopic} />
              <ReviewThread storyTitle={selectedTopic} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
