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
import { CheckCircle2, Loader2, Calendar, ShieldAlert, PlusCircle, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import AccessDeniedState from '../components/AccessDeniedState';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { isUnauthorizedError, getErrorMessage } from '../utils/authErrors';
import type { Story } from '../backend';

export default function AdminModerationPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
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
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (error: any) {
      console.error('Publish error:', error);
      setPublishError(getErrorMessage(error));
    }
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
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (error: any) {
      console.error('Create article error:', error);
      setCreateError(getErrorMessage(error));
    }
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
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {publishError}
                </AlertDescription>
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
                          className="gap-2"
                        >
                          {selectedStory?.title === story.title ? 'Selected' : 'Select'}
                        </Button>
                        {selectedStory?.title === story.title && (
                          <Button
                            onClick={handlePublish}
                            disabled={publishMutation.isPending}
                            className="gap-2"
                          >
                            {publishMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Approve & Publish
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {createError}
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Create & Publish Article</CardTitle>
                <CardDescription>
                  Create a new article directly without going through the submission process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter article title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorPseudonym">Author Pseudonym *</Label>
                  <Input
                    id="authorPseudonym"
                    value={newAuthorPseudonym}
                    onChange={(e) => setNewAuthorPseudonym(e.target.value)}
                    placeholder="Enter author pseudonym"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Story Content *</Label>
                  <Textarea
                    id="story"
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    placeholder="Enter the story content"
                    rows={12}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={newIsAnonymous}
                    onCheckedChange={setNewIsAnonymous}
                  />
                  <Label htmlFor="anonymous">Publish as Anonymous</Label>
                </div>

                {!newIsAnonymous && (
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name (Optional)</Label>
                    <Input
                      id="authorName"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="Enter author's real name (optional)"
                    />
                  </div>
                )}

                <Button
                  onClick={handleCreateArticle}
                  disabled={createArticleMutation.isPending}
                  className="w-full gap-2"
                  size="lg"
                >
                  {createArticleMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      Create & Publish Article
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Published Articles Tab */}
          <TabsContent value="published" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {publishedStories?.length || 0} published articles
              </p>
              {publishedStories && publishedStories.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete All Articles
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all {publishedStories.length} published articles and all associated comments and reviews.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllArticles}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteAllMutation.isPending ? 'Deleting...' : 'Delete All'}
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
              <div className="grid gap-6">
                {publishedStories.map((story) => (
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-2">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{story.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArticle(story.title)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap line-clamp-4">
                          {story.story}
                        </p>
                      </div>
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
