import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetPublishedStories } from '../hooks/useStories';
import { useBackendAvailability } from '../hooks/useBackendAvailability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FeedDiagnosticsPanel } from '../components/FeedDiagnosticsPanel';
import { MessageCircle, Calendar, AlertCircle, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { getCanisterInfo } from '../utils/canisterUrls';

export default function FeedPage() {
  const navigate = useNavigate();
  const { data: stories, isLoading, error, refetch, failureCount, isFetching } = useGetPublishedStories();
  const [checkBackend, setCheckBackend] = useState(false);
  const backendAvailability = useBackendAvailability(checkBackend);

  // Trigger backend availability check when we have an error
  useEffect(() => {
    if (error && !checkBackend) {
      setCheckBackend(true);
    }
  }, [error, checkBackend]);

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1_000_000);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'Unknown date';
    }
  };

  const canisterInfo = getCanisterInfo();
  const isRetrying = error && isFetching;
  const hasReachedMaxRetries = error && !isFetching && failureCount >= 4;

  // Determine error messaging based on backend availability
  const getErrorMessage = () => {
    if (backendAvailability.state === 'unreachable') {
      return {
        title: 'Backend Not Responding',
        description: 'The backend canister is not reachable. This usually means the canister is still propagating across the Internet Computer network after deployment, or there may be a temporary network issue.',
        suggestions: [
          'Wait 1-3 minutes for the canister to finish propagating',
          'Try refreshing the page',
          'Try the raw URL (see below)',
          'Check if you recently deployed - propagation can take a few minutes',
        ],
      };
    } else if (backendAvailability.state === 'reachable') {
      return {
        title: 'Failed to Load Stories',
        description: 'The backend is reachable, but the request to load stories failed. This could be a temporary issue or a problem with the specific request.',
        suggestions: [
          'Click "Retry Now" to try loading again',
          'Check your internet connection',
          'Try refreshing the page',
        ],
      };
    } else {
      return {
        title: 'Failed to Load Stories',
        description: 'There was an error loading the stories. The website loaded successfully, but we cannot connect to the backend service.',
        suggestions: [
          'Wait a moment and click "Retry Now"',
          'The backend may still be propagating after deployment',
          'Try the troubleshooting page for more options',
        ],
      };
    }
  };

  const errorInfo = error ? getErrorMessage() : null;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-accent/30 via-muted/40 to-background border-b border-border overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Real Stories, Real Lives
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A collection of anonymous experiences shared by people like you. Read, reflect, and join the conversation.
            </p>
            <div className="pt-4">
              <img 
                src="/assets/generated/paper-stories-hero-blue.dim_1400x400.png" 
                alt="Stories" 
                className="w-full max-w-3xl mx-auto rounded-lg shadow-soft"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stories Feed */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Loading State */}
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Retrying State */}
          {isRetrying && (
            <Alert className="border-primary/50 bg-primary/5">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Checking backend...</AlertTitle>
              <AlertDescription>
                Retrying connection (attempt {failureCount + 1} of 5). The backend may still be propagating after deployment.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State with Enhanced Diagnostics */}
          {hasReachedMaxRetries && errorInfo && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{errorInfo.title}</AlertTitle>
                <AlertDescription className="space-y-4">
                  <p>{errorInfo.description}</p>
                  
                  {backendAvailability.state === 'checking' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Checking backend availability...</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="font-medium text-sm">What to try:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {errorInfo.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setCheckBackend(false);
                        refetch();
                      }}
                      className="gap-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate({ to: '/troubleshooting' })}
                    >
                      Open Troubleshooting
                    </Button>
                    {canisterInfo.rawUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <a href={canisterInfo.rawUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                          <ExternalLink className="h-3 w-3" />
                          Try Raw URL
                        </a>
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <FeedDiagnosticsPanel />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && stories && stories.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <p className="text-muted-foreground text-lg">No stories published yet.</p>
                <Button onClick={() => navigate({ to: '/submit' })}>
                  Be the first to share
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success State - Stories List */}
          {!isLoading && !error && stories && stories.length > 0 && (
            <>
              {stories.map((story) => (
                <Card 
                  key={story.title} 
                  className="overflow-hidden hover:shadow-soft hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate({ to: '/story/$title', params: { title: story.title } })}
                >
                  <CardHeader className="space-y-3">
                    <CardTitle className="font-serif text-2xl md:text-3xl leading-tight group-hover:text-primary transition-colors">
                      {story.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="font-medium">by {story.authorPseudonym}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(story.timestamp)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {story.story}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <MessageCircle className="h-4 w-4" />
                        Read & Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
