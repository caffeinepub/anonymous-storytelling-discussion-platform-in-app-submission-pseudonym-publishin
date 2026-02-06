import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSubmitStory } from '../hooks/useStories';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, LogIn } from 'lucide-react';

export default function SubmitStoryPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useSubmitStory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !story.trim()) {
      return;
    }

    if (!isAnonymous && !authorName.trim()) {
      return;
    }

    try {
      await submitMutation.mutateAsync({
        title: title.trim(),
        authorPseudonym: isAnonymous ? 'Anonymous' : authorName.trim(),
        story: story.trim(),
        isAnonymous,
        authorName: isAnonymous ? null : authorName.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit story:', error);
    }
  };

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
                  Please log in to submit your story
                </p>
              </div>
              <Button 
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
              >
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoggingIn ? 'Logging in...' : 'Login to Submit'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/50 bg-accent/20">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold">Story Submitted!</h2>
                <p className="text-muted-foreground">
                  Thank you for sharing your story. Your submission will be reviewed by our team and is not publicly visible until it has been approved and published.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate({ to: '/login' })}>
                  Account
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubmitted(false);
                    setTitle('');
                    setStory('');
                    setAuthorName('');
                    setIsAnonymous(false);
                  }}
                >
                  Submit Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Share Your Story</h1>
          <p className="text-muted-foreground text-lg">
            Your experience matters. Share it anonymously or with your name.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Story</CardTitle>
            <CardDescription>
              All submissions are reviewed before publishing. Your story will not be publicly visible until it has been approved by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/10">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous" className="text-base font-medium">
                    Submit Anonymously
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your identity will remain private
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              {/* Author Name (conditional) */}
              {!isAnonymous && (
                <div className="space-y-2">
                  <Label htmlFor="authorName">Your Name</Label>
                  <Input
                    id="authorName"
                    placeholder="How should we credit you?"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required={!isAnonymous}
                  />
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Story Title</Label>
                <Input
                  id="title"
                  placeholder="Give your story a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Story Content */}
              <div className="space-y-2">
                <Label htmlFor="story">Your Story</Label>
                <Textarea
                  id="story"
                  placeholder="Share your experience..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  required
                  rows={12}
                  className="resize-none font-serif"
                />
                <p className="text-xs text-muted-foreground">
                  Your story will be reviewed before being published.
                </p>
              </div>

              {submitMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to submit your story. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitMutation.isPending || !title.trim() || !story.trim() || (!isAnonymous && !authorName.trim())}
                  className="flex-1"
                >
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Story
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/stories' })}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
