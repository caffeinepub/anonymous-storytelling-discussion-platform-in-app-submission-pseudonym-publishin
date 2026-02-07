import { useState } from 'react';
import { useGetPendingStories, usePublishStory, useCreateAndPublishArticle, useIsCallerAdmin, useDeletePublishedArticle, useDeleteAllArticles } from '../hooks/useAdmin';
import { useGetPublishedStories } from '../hooks/useStories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle2, Loader2, Calendar, ShieldAlert, PlusCircle, Trash2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import AccessDeniedState from '../components/AccessDeniedState';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { isUnauthorizedError, getErrorMessage } from '../utils/authErrors';
import type { Story } from '../backend';

export default function AdminModerationPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin, error: adminCheckError } = useIsCallerAdmin();
  const { data: pendingStories, isLoading: loadingPending, error: pendingError } = useGetPendingStories(isAdmin);
  const { data: publishedStories, isLoading: loadingPublished } = useGetPublishedStories();
  const publishMutation = usePublishStory();
  const createArticleMutation = useCreateAndPublishArticle();
  const deleteMutation = useDeletePublishedArticle();
  const deleteAllMutation = useDeleteAllArticles();
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // New article creation state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorPseudonym, setNewAuthorPseudonym] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newIsAnonymous, setNewIsAnonymous] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();
  const principalId = identity && !isAnonymous ? identity.getPrincipal().toString() : undefined;

  // Check for unauthorized errors
  const isAdminCheckUnauthorized = isUnauthorizedError(adminCheckError);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setPublishSuccess(false);
    setPublishError(null);
  };

  const handlePublish = async () => {
    if (!selectedStory) {
      return;
    }

    setPublishSuccess(false);
    setPublishError(null);

    try {
      await publishMutation.mutateAsync(selectedStory.title);
      setPublishSuccess(true);
      setSelectedStory(null);
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (error: any) {
      console.error('Publish error:', error);
      setPublishError(getErrorMessage(error));
    }
  };

  const handleDismissPublishError = () => {
    setPublishError(null);
  };

  const handleCreateArticle = async () => {
    if (!newTitle.trim() || !newAuthorPseudonym.trim() || !newStory.trim()) {
      setCreateError('Please fill in all required fields');
      return;
    }

    setCreateSuccess(false);
    setCreateError(null);

    try {
      await createArticleMutation.mutateAsync({
        title: newTitle,
        authorPseudonym: newAuthorPseudonym,
        story: newStory,
        isAnonymous: newIsAnonymous,
        authorName: newAuthorName.trim() || null,
        authorPrincipal: null,
      });

      setCreateSuccess(true);
      setNewTitle('');
      setNewAuthorPseudonym('');
      setNewStory('');
      setNewIsAnonymous(false);
      setNewAuthorName('');
      setTimeout(() => setCreateSuccess(false), 5000);
    } catch (error: any) {
      console.error('Create article error:', error);
      setCreateError(getErrorMessage(error));
    }
  };

  const handleDismissCreateError = () => {
    setCreateError(null);
  };

  const handleDeleteArticle = async (title: string) => {
    try {
      await deleteMutation.mutateAsync(title);
    } catch (error: any) {
      console.error('Delete article error:', error);
    }
  };

  const handleDeleteAllArticles = async () => {
    try {
      await deleteAllMutation.mutateAsync();
    } catch (error: any) {
      console.error('Delete all articles error:', error);
    }
  };

  // Show access denied for anonymous users
  if (isAnonymous) {
    return <AccessDeniedState principalId={principalId} showLoginButton={true} />;
  }

  // Show access denied for authenticated non-admin users
  if (!isCheckingAdmin && isAdmin === false) {
    return <AccessDeniedState principalId={principalId} showLoginButton={false} />;
  }

  // Show loading state while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Show unauthorized error if admin check failed
  if (isAdminCheckUnauthorized) {
    return <AccessDeniedState principalId={principalId} showLoginButton={false} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Admin Moderation</h1>
          <p className="text-muted-foreground">Review submissions, create articles, and manage published content</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Awaiting Approval</TabsTrigger>
            <TabsTrigger value="create">Create Article</TabsTrigger>
            <TabsTrigger value="published">Published Articles</TabsTrigger>
          </TabsList>

          {/* Awaiting Approval Tab */}
          <TabsContent value="pending" className="space-y-6">
            {publishSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Story published successfully!
                </AlertDescription>
              </Alert>
            )}

            {publishError && (
              <Alert className="bg-destructive/10 border-destructive/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <AlertDescription className="text-destructive">
                      {isUnauthorizedError(publishError)
                        ? 'You must be an admin to publish stories. Please log in with an admin account.'
                        : publishError}
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissPublishError}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {isUnauthorizedError(publishError) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={login}
                    className="mt-2"
                  >
                    Log In Again
                  </Button>
                )}
              </Alert>
            )}

            {loadingPending ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : pendingError ? (
              <Alert className="bg-destructive/10 border-destructive/50">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {getErrorMessage(pendingError)}
                </AlertDescription>
              </Alert>
            ) : !pendingStories || pendingStories.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending submissions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingStories.map((story) => (
                  <Card key={story.title} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="font-serif text-2xl">{story.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(story.timestamp)}
                          </CardDescription>
                          <CardDescription>
                            By: {story.isAnonymous ? 'Anonymous' : story.authorName || story.authorPseudonym}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap line-clamp-4">
                          {story.story}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSelectStory(story)}
                          variant={selectedStory?.title === story.title ? 'default' : 'outline'}
                          size="sm"
                        >
                          {selectedStory?.title === story.title ? 'Selected' : 'Select to Publish'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedStory && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Ready to Publish</CardTitle>
                  <CardDescription>
                    Review the selected story before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/20 border border-border">
                    <h3 className="font-serif text-xl font-bold mb-2">{selectedStory.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      By: {selectedStory.isAnonymous ? 'Anonymous' : selectedStory.authorName || selectedStory.authorPseudonym}
                    </p>
                    <p className="text-sm whitespace-pre-wrap font-serif">
                      {selectedStory.story}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePublish}
                      disabled={publishMutation.isPending}
                      className="flex-1"
                    >
                      {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Publish Story
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedStory(null)}
                      disabled={publishMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Article Tab */}
          <TabsContent value="create" className="space-y-6">
            {createSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Article created and published successfully!
                </AlertDescription>
              </Alert>
            )}

            {createError && (
              <Alert className="bg-destructive/10 border-destructive/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <AlertDescription className="text-destructive">
                      {isUnauthorizedError(createError)
                        ? 'You must be an admin to create articles. Please log in with an admin account.'
                        : createError}
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissCreateError}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {isUnauthorizedError(createError) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={login}
                    className="mt-2"
                  >
                    Log In Again
                  </Button>
                )}
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Create New Article
                </CardTitle>
                <CardDescription>
                  Create and publish an article directly without user submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateArticle(); }} className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-anonymous" className="text-base font-medium">
                        Anonymous Article
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Publish without author attribution
                      </p>
                    </div>
                    <Switch
                      id="new-anonymous"
                      checked={newIsAnonymous}
                      onCheckedChange={setNewIsAnonymous}
                    />
                  </div>

                  {!newIsAnonymous && (
                    <div className="space-y-2">
                      <Label htmlFor="new-author-name">Author Name (Optional)</Label>
                      <Input
                        id="new-author-name"
                        placeholder="Real author name"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="new-pseudonym">Author Pseudonym *</Label>
                    <Input
                      id="new-pseudonym"
                      placeholder="Display name for the article"
                      value={newAuthorPseudonym}
                      onChange={(e) => setNewAuthorPseudonym(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-title">Article Title *</Label>
                    <Input
                      id="new-title"
                      placeholder="Give your article a title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-story">Article Content *</Label>
                    <Textarea
                      id="new-story"
                      placeholder="Write your article content..."
                      value={newStory}
                      onChange={(e) => setNewStory(e.target.value)}
                      required
                      rows={12}
                      className="resize-none font-serif"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createArticleMutation.isPending || !newTitle.trim() || !newAuthorPseudonym.trim() || !newStory.trim()}
                      className="flex-1"
                    >
                      {createArticleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create & Publish Article
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewTitle('');
                        setNewAuthorPseudonym('');
                        setNewStory('');
                        setNewIsAnonymous(false);
                        setNewAuthorName('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Published Articles Tab */}
          <TabsContent value="published" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold">Published Articles</h2>
                <p className="text-sm text-muted-foreground">
                  {publishedStories?.length || 0} article{publishedStories?.length !== 1 ? 's' : ''} published
                </p>
              </div>
              {publishedStories && publishedStories.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Articles?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {publishedStories.length} published articles. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllArticles}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {loadingPublished ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !publishedStories || publishedStories.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No published articles</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {publishedStories.map((story) => (
                  <Card key={story.title}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="font-serif text-xl">{story.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(story.timestamp)}
                          </CardDescription>
                          <CardDescription>
                            By: {story.isAnonymous ? 'Anonymous' : story.authorName || story.authorPseudonym}
                          </CardDescription>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{story.title}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArticle(story.title)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                        {story.story}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
