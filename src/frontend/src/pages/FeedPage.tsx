import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useGetPublishedStories } from '../hooks/useStories';
import { useBackendAvailability } from '../hooks/useBackendAvailability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FeedDiagnosticsPanel } from '../components/FeedDiagnosticsPanel';
import { MessageCircle, Calendar, AlertCircle, RefreshCw, ExternalLink, Loader2, Activity } from 'lucide-react';
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
  const isRetrying = !!(error && isFetching);
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
          'Try the raw URL (see diagnostics below)',
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
          'Use the troubleshooting page for more diagnostic tools',
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
          {/* Error State with Enhanced Diagnostics */}
          {error && (
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {errorInfo?.title}
                  {backendAvailability.isChecking && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{errorInfo?.description}</p>
                  
                  {/* Backend Reachability Status */}
                  {backendAvailability.state !== 'unknown' && (
                    <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-background/50 rounded border">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">Backend Status:</span>
                      {backendAvailability.state === 'checking' && (
                        <span className="text-muted-foreground">Checking...</span>
                      )}
                      {backendAvailability.state === 'reachable' && (
                        <span className="text-green-600 font-medium">Reachable ✓</span>
                      )}
                      {backendAvailability.state === 'unreachable' && (
                        <span className="text-destructive font-medium">Not Reachable ✗</span>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="font-medium mb-2">What you can try:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {errorInfo?.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => refetch()} 
                  disabled={isRetrying}
                  className="gap-2"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Retry Now
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>

                <Button 
                  variant="outline"
                  asChild
                >
                  <Link to="/troubleshooting">
                    <Activity className="h-4 w-4 mr-2" />
                    Open Troubleshooting
                  </Link>
                </Button>

                {canisterInfo.rawUrl && (
                  <Button 
                    variant="outline"
                    asChild
                  >
                    <a href={canisterInfo.rawUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try Raw URL
                    </a>
                  </Button>
                )}
              </div>

              {/* Diagnostics Panel */}
              <FeedDiagnosticsPanel />

              {hasReachedMaxRetries && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Automatic Retries Exhausted</AlertTitle>
                  <AlertDescription>
                    The system has tried multiple times to connect. If the issue persists, the backend canister 
                    may still be propagating (wait 2-5 minutes) or there may be a deployment issue. 
                    Visit the troubleshooting page for more diagnostic tools including a backend heartbeat check.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Success State - Stories List */}
          {!isLoading && !error && stories && stories.length > 0 && (
            <div className="space-y-6">
              {stories.map((story) => (
                <Card 
                  key={story.title}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate({ to: '/story/$title', params: { title: story.title } })}
                >
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {story.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(story.timestamp)}
                      </span>
                      <span>By {story.authorPseudonym}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {story.story}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>Read more and join the discussion</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && stories && stories.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No stories have been published yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
