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

    setPublishError(null);

    try {
      await publishMutation.mutateAsync(selectedStory.title);
      setPublishSuccess(true);
      setTimeout(() => {
        setSelectedStory(null);
        setPublishSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to publish story:', error);
      const errorMsg = getErrorMessage(error);
      if (isUnauthorizedError(error)) {
        setPublishError('Unauthorized: You do not have permission to publish stories. Please verify your admin access.');
      } else {
        setPublishError(`Failed to publish: ${errorMsg}`);
      }
    }
  };

  const handleCreateArticle = async () => {
    if (!newTitle.trim() || !newAuthorPseudonym.trim() || !newStory.trim()) {
      return;
    }

    if (!newIsAnonymous && !newAuthorName.trim()) {
      return;
    }

    setCreateError(null);

    try {
      await createArticleMutation.mutateAsync({
        title: newTitle.trim(),
        authorPseudonym: newAuthorPseudonym.trim(),
        story: newStory.trim(),
        isAnonymous: newIsAnonymous,
        authorName: newIsAnonymous ? null : newAuthorName.trim(),
        authorPrincipal: null,
      });
      setCreateSuccess(true);
      setTimeout(() => {
        setNewTitle('');
        setNewAuthorPseudonym('');
        setNewStory('');
        setNewIsAnonymous(false);
        setNewAuthorName('');
        setCreateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to create article:', error);
      const errorMsg = getErrorMessage(error);
      if (isUnauthorizedError(error)) {
        setCreateError('Unauthorized: You do not have permission to create articles. Please verify your admin access.');
      } else {
        setCreateError(`Failed to create article: ${errorMsg}`);
      }
    }
  };

  const handleDeleteArticle = async (title: string) => {
    try {
      await deleteMutation.mutateAsync(title);
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const handleDeleteAllArticles = async () => {
    try {
      await deleteAllMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to delete all articles:', error);
    }
  };

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <div>
              <h1 className="font-serif text-3xl font-bold">Checking Access...</h1>
              <p className="text-muted-foreground">Verifying admin permissions</p>
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show access denied if unauthorized or not admin
  if (isAdminCheckUnauthorized || isAdmin === false) {
    return <AccessDeniedState principalId={principalId} />;
  }

  // Show error state for non-authorization errors
  if (adminCheckError && !isAdminCheckUnauthorized) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-12 pb-12 space-y-6">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <div className="space-y-2 text-center">
                <h2 className="font-serif text-2xl font-bold">Error Loading Admin Page</h2>
                <p className="text-muted-foreground">
                  Unable to verify admin access. Please try again.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline"
                  onClick={() => navigate({ to: '/troubleshooting' })}
                  className="w-full"
                >
                  Troubleshooting
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => navigate({ to: '/stories' })}
                  className="w-full"
                >
                  Return to Stories
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-serif text-3xl font-bold">Admin Moderation</h1>
            <p className="text-muted-foreground">Review submissions, publish articles, and manage published content</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Article</TabsTrigger>
            <TabsTrigger value="pending">
              Awaiting Approval {pendingStories && `(${pendingStories.length})`}
            </TabsTrigger>
            <TabsTrigger value="published">
              Published Articles {publishedStories && `(${publishedStories.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Create New Article Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="shadow-soft border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Create & Publish Article</CardTitle>
                </div>
                <CardDescription>Create a new article and publish it directly</CardDescription>
              </CardHeader>
              <CardContent>
                {createSuccess ? (
                  <div className="text-center py-12 space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                    <div>
                      <h3 className="font-semibold text-lg">Article Published!</h3>
                      <p className="text-muted-foreground text-sm">It's now live on the Articles page</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {createError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{createError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newTitle">Article Title</Label>
                      <Input
                        id="newTitle"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Enter article title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPseudonym">Author Pseudonym</Label>
                      <Input
                        id="newPseudonym"
                        value={newAuthorPseudonym}
                        onChange={(e) => setNewAuthorPseudonym(e.target.value)}
                        placeholder="Enter author pseudonym"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="newAnonymous"
                        checked={newIsAnonymous}
                        onCheckedChange={setNewIsAnonymous}
                      />
                      <Label htmlFor="newAnonymous" className="cursor-pointer">
                        Publish as Anonymous
                      </Label>
                    </div>

                    {!newIsAnonymous && (
                      <div className="space-y-2">
                        <Label htmlFor="newAuthorName">Author Name</Label>
                        <Input
                          id="newAuthorName"
                          value={newAuthorName}
                          onChange={(e) => setNewAuthorName(e.target.value)}
                          placeholder="Enter author name"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newStory">Article Content</Label>
                      <Textarea
                        id="newStory"
                        value={newStory}
                        onChange={(e) => setNewStory(e.target.value)}
                        placeholder="Write your article here..."
                        className="min-h-[300px] font-serif"
                      />
                    </div>

                    <Button
                      onClick={handleCreateArticle}
                      disabled={
                        createArticleMutation.isPending ||
                        !newTitle.trim() ||
                        !newAuthorPseudonym.trim() ||
                        !newStory.trim() ||
                        (!newIsAnonymous && !newAuthorName.trim())
                      }
                      className="w-full"
                    >
                      {createArticleMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create & Publish Article
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Submissions Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="shadow-soft border-primary/20">
              <CardHeader>
                <CardTitle>Awaiting Approval</CardTitle>
                <CardDescription>Review and publish submitted stories</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : pendingError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {isUnauthorizedError(pendingError)
                        ? 'Unauthorized: You do not have permission to view pending submissions.'
                        : `Error loading pending submissions: ${getErrorMessage(pendingError)}`}
                    </AlertDescription>
                  </Alert>
                ) : !pendingStories || pendingStories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No pending submissions</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {pendingStories.map((story) => (
                      <Card
                        key={story.title}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedStory?.title === story.title ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectStory(story)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{story.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(story.timestamp)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {story.story}
                          </p>
                          <div className="mt-3 text-xs text-muted-foreground">
                            By: {story.authorPseudonym}
                            {!story.isAnonymous && story.authorName && ` (${story.authorName})`}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedStory && (
              <Card className="shadow-soft border-primary/20">
                <CardHeader>
                  <CardTitle>Selected Story</CardTitle>
                  <CardDescription>{selectedStory.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {publishError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{publishError}</AlertDescription>
                    </Alert>
                  )}

                  {publishSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                      <div>
                        <h3 className="font-semibold text-lg">Story Published!</h3>
                        <p className="text-muted-foreground text-sm">
                          The story is now live on the Articles page
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap font-serif">{selectedStory.story}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handlePublish}
                          disabled={publishMutation.isPending}
                          className="flex-1"
                        >
                          {publishMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve & Publish
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedStory(null)}
                          disabled={publishMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Published Articles Tab */}
          <TabsContent value="published" className="space-y-6">
            <Card className="shadow-soft border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Published Articles</CardTitle>
                    <CardDescription>Manage published content</CardDescription>
                  </div>
                  {publishedStories && publishedStories.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All Articles
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete All Articles?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all {publishedStories.length} published articles and all associated discussions (comments and reviews).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllArticles}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteAllMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Delete All Articles'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingPublished ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : !publishedStories || publishedStories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No published articles yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publishedStories.map((story) => (
                      <Card key={story.title} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{story.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                By: {story.authorPseudonym}
                                {!story.isAnonymous && story.authorName && ` (${story.authorName})`}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {formatDate(story.timestamp)}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{story.title}"? This action cannot be undone.
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
