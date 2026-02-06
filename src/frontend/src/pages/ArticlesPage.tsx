import { useNavigate } from '@tanstack/react-router';
import { useGetPublishedStories } from '../hooks/useStories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Clock, User } from 'lucide-react';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const { data: stories, isLoading, isError, error } = useGetPublishedStories();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load articles. {error instanceof Error ? error.message : 'Please try again later.'}
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Published Articles</h1>
          <p className="text-muted-foreground text-lg">
            Read stories from our community
          </p>
        </div>

        {!stories || stories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold">No Articles Yet</h3>
                <p className="text-muted-foreground">
                  Articles will appear here after being published by our team. Check back soon!
                </p>
              </div>
              <Button onClick={() => navigate({ to: '/submit' })}>
                Share Your Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <Card 
                key={story.title} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate({ to: '/article/$title', params: { title: story.title } })}
              >
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">{story.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {story.isAnonymous ? 'Anonymous' : story.authorPseudonym}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(story.timestamp)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {story.story}
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-4 px-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: '/article/$title', params: { title: story.title } });
                    }}
                  >
                    Read more →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
