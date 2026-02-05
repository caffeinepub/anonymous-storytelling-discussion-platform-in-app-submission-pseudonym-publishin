import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPublishedStory } from '../hooks/useStories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar } from 'lucide-react';
import CommentThread from '../components/CommentThread';
import CommentComposer from '../components/CommentComposer';

export default function StoryDetailPage() {
  const { title } = useParams({ from: '/story/$title' });
  const navigate = useNavigate();
  const { data: story, isLoading, error } = useGetPublishedStory(title);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <Skeleton className="h-10 w-24" />
          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Button>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">Story not found or failed to load.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Button>

        {/* Story Content */}
        <article>
          <Card className="overflow-hidden shadow-soft">
            <CardHeader className="space-y-4 pb-6">
              <CardTitle className="font-serif text-3xl md:text-4xl leading-tight">
                {story.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="font-medium">by {story.authorPseudonym}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(story.timestamp)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                {story.story}
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold">Discussion</h2>
          
          <CommentComposer storyTitle={title} />
          
          <CommentThread storyTitle={title} />
        </div>
      </div>
    </div>
  );
}
