import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetPublishedStory } from '../hooks/useStories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, User } from 'lucide-react';
import CommentThread from '../components/CommentThread';
import CommentComposer from '../components/CommentComposer';

export default function ArticleDetailPage() {
  const navigate = useNavigate();
  const { title } = useParams({ from: '/article/$title' });
  const { data: story, isLoading, isError, error } = useGetPublishedStory(title);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <Skeleton className="h-10 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !story) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/articles' })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Button>
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof Error ? error.message : 'Article not found.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: '/articles' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-3xl">{story.title}</CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {story.isAnonymous ? 'Anonymous' : story.authorPseudonym}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(story.timestamp)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap font-serif leading-relaxed">
                {story.story}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold">Comments</h2>
          <CommentComposer storyTitle={title} />
          <CommentThread storyTitle={title} />
        </div>
      </div>
    </div>
  );
}
