import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetMySubmissions } from '../hooks/useStories';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, ChevronUp, FileText, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '../utils/authErrors';
import { Variant_pending_published, type SubmissionStatus } from '../backend';

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  const { data: submissions, isLoading, error } = useGetMySubmissions();
  const [expandedPending, setExpandedPending] = useState<string | null>(null);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleExpanded = (title: string) => {
    setExpandedPending(expandedPending === title ? null : title);
  };

  const handleViewPublished = (title: string) => {
    navigate({ to: '/story/$title', params: { title } });
  };

  // Show login required state for unauthenticated users
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
                {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground text-lg">
            Track your submitted stories and their publication status
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        ) : !submissions || submissions.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium">No submissions yet</p>
                <p className="text-sm text-muted-foreground">
                  Share your story to see it here
                </p>
              </div>
              <Button onClick={() => navigate({ to: '/submit' })}>
                Submit a Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission: SubmissionStatus) => {
              const isPending = submission.status === Variant_pending_published.pending;
              const isExpanded = expandedPending === submission.story.title;
              const authorDisplay = submission.story.isAnonymous 
                ? 'Anonymous' 
                : submission.story.authorName || submission.story.authorPseudonym;

              return (
                <Card key={submission.story.title} className={isPending ? 'border-amber-200 bg-amber-50/30' : 'border-green-200 bg-green-50/30'}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="font-serif text-xl">
                            {submission.story.title}
                          </CardTitle>
                          <Badge 
                            variant={isPending ? 'secondary' : 'default'}
                            className={isPending ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}
                          >
                            {isPending ? 'Pending' : 'Published'}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(submission.story.timestamp)}
                        </CardDescription>
                        <CardDescription>
                          By: {authorDisplay}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isPending ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Your submission is awaiting admin approval. It will appear in the public feed once published.
                        </p>
                        <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(submission.story.title)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-2" />
                                  Hide Story
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  View Story
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4">
                            <div className="p-4 rounded-lg border border-border bg-background">
                              <p className="text-sm whitespace-pre-wrap font-serif">
                                {submission.story.story}
                              </p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Your story has been published and is now visible to everyone.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPublished(submission.story.title)}
                        >
                          View Published Story
                        </Button>
                      </>
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
