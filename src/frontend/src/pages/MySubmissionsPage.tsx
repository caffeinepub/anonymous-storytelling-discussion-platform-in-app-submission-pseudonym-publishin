import { useNavigate } from '@tanstack/react-router';
import { useGetMySubmissions } from '../hooks/useStories';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, LogIn, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  const { data: submissions, isLoading, isError, error } = useGetMySubmissions();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <LogIn className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold">Login Required</h2>
                <p className="text-muted-foreground">
                  Please log in to view your submissions
                </p>
              </div>
              <Button 
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
              >
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
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
              Failed to load your submissions. {error instanceof Error ? error.message : 'Please try again later.'}
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
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground text-lg">
            Track the status of your submitted stories
          </p>
        </div>

        {!submissions || submissions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold">No Submissions Yet</h3>
                <p className="text-muted-foreground">
                  You haven't submitted any stories. Share your experience with the community!
                </p>
              </div>
              <Button onClick={() => navigate({ to: '/submit' })}>
                Submit Your Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const isPending = submission.status === 'pending';
              const isPublished = submission.status === 'published';
              
              return (
                <Card key={submission.story.title}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="font-serif text-2xl">
                          {submission.story.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Submitted {formatDate(submission.story.timestamp)}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={isPublished ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {isPublished ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Published
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Pending Review
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3">
                      {submission.story.story}
                    </p>
                    {isPublished && (
                      <Button 
                        variant="outline"
                        onClick={() => navigate({ to: '/article/$title', params: { title: submission.story.title } })}
                      >
                        View Published Article
                      </Button>
                    )}
                    {isPending && (
                      <p className="text-sm text-muted-foreground">
                        Your story is awaiting admin approval. You'll be able to view it once it's published.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
