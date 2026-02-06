import { useState } from 'react';
import { useGetPendingStories, usePublishStory, useCreateAndPublishArticle, useIsCallerAdmin, useDeletePublishedArticle } from '../hooks/useAdmin';
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
import { CheckCircle2, Loader2, Calendar, ShieldAlert, PlusCircle, Trash2 } from 'lucide-react';
import AccessDeniedState from '../components/AccessDeniedState';
import type { Story } from '../backend';

export default function AdminModerationPage() {
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const { data: pendingStories, isLoading: loadingPending, error: pendingError } = useGetPendingStories();
  const { data: publishedStories, isLoading: loadingPublished } = useGetPublishedStories();
  const publishMutation = usePublishStory();
  const createArticleMutation = useCreateAndPublishArticle();
  const deleteMutation = useDeletePublishedArticle();
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // New article creation state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorPseudonym, setNewAuthorPseudonym] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newIsAnonymous, setNewIsAnonymous] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const isUnauthorized = pendingError && (pendingError as Error).message.includes('Unauthorized');

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setPublishSuccess(false);
  };

  const handlePublish = async () => {
    if (!selectedStory) {
      return;
    }

    try {
      await publishMutation.mutateAsync(selectedStory.title);
      setPublishSuccess(true);
      setTimeout(() => {
        setSelectedStory(null);
        setPublishSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to publish story:', error);
    }
  };

  const handleCreateArticle = async () => {
    if (!newTitle.trim() || !newAuthorPseudonym.trim() || !newStory.trim()) {
      return;
    }

    if (!newIsAnonymous && !newAuthorName.trim()) {
      return;
    }

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
    }
  };

  const handleDeleteArticle = async (title: string) => {
    try {
      await deleteMutation.mutateAsync(title);
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (isAdmin === false || isUnauthorized) {
    return <AccessDeniedState />;
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
              Pending Submissions {pendingStories && `(${pendingStories.length})`}
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
                <CardDescription>Create a new article directly without submission</CardDescription>
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
                          placeholder="Enter author's real name"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newStory">Article Content</Label>
                      <Textarea
                        id="newStory"
                        value={newStory}
                        onChange={(e) => setNewStory(e.target.value)}
                        rows={10}
                        className="resize-none font-serif"
                        placeholder="Write your article content here..."
                      />
                    </div>

                    {createArticleMutation.isError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Failed to create article. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}

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
                      {createArticleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create & Publish Article
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Submissions Tab */}
          <TabsContent value="pending" className="space-y-6">
            {loadingPending && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            )}

            {pendingError && !isUnauthorized && (
              <Alert variant="destructive">
                <AlertDescription>Failed to load pending submissions. Please try again.</AlertDescription>
              </Alert>
            )}

            {!loadingPending && !pendingError && pendingStories && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Submissions List */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Pending Submissions ({pendingStories.length})</CardTitle>
                    <CardDescription>Select a story to review and publish</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingStories.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No pending submissions</p>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {pendingStories.map((story) => (
                          <Card
                            key={story.title}
                            className={`cursor-pointer transition-all hover:shadow-soft hover:border-primary/30 ${
                              selectedStory?.title === story.title ? 'ring-2 ring-primary border-primary' : ''
                            }`}
                            onClick={() => handleSelectStory(story)}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{story.title}</CardTitle>
                              <CardDescription className="flex flex-col gap-1 text-xs">
                                <span>
                                  {story.isAnonymous ? 'Anonymous' : `by ${story.authorName || story.authorPseudonym}`}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(story.timestamp)}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {story.story}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Publishing Preview */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Publish Story</CardTitle>
                    <CardDescription>Review and publish the selected story</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedStory ? (
                      <p className="text-muted-foreground text-center py-12">
                        Select a story from the left to review
                      </p>
                    ) : publishSuccess ? (
                      <div className="text-center py-12 space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                        <div>
                          <h3 className="font-semibold text-lg">Story Published!</h3>
                          <p className="text-muted-foreground text-sm">It's now live on the feed</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <p className="font-semibold">{selectedStory.title}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Author</Label>
                          <p>{selectedStory.isAnonymous ? 'Anonymous' : selectedStory.authorName || selectedStory.authorPseudonym}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Story Content</Label>
                          <div className="p-4 rounded-lg border bg-accent/10 max-h-[400px] overflow-y-auto">
                            <p className="whitespace-pre-wrap text-sm">{selectedStory.story}</p>
                          </div>
                        </div>

                        {publishMutation.isError && (
                          <Alert variant="destructive">
                            <AlertDescription>
                              Failed to publish story. Please try again.
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          onClick={handlePublish}
                          disabled={publishMutation.isPending}
                          className="w-full"
                        >
                          {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Publish Story
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Published Articles Tab */}
          <TabsContent value="published" className="space-y-6">
            {loadingPublished && (
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
            )}

            {!loadingPublished && publishedStories && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Published Articles ({publishedStories.length})</CardTitle>
                  <CardDescription>Manage published articles - you can remove articles if needed</CardDescription>
                </CardHeader>
                <CardContent>
                  {publishedStories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No published articles yet</p>
                  ) : (
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                      {publishedStories.map((story) => (
                        <Card key={story.title} className="hover:shadow-soft transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{story.title}</CardTitle>
                                <CardDescription className="flex flex-col gap-1 text-xs mt-2">
                                  <span>
                                    {story.isAnonymous ? 'Anonymous' : `by ${story.authorName || story.authorPseudonym}`}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(story.timestamp)}
                                  </span>
                                </CardDescription>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Published Article?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove "{story.title}" from the published articles. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteArticle(story.title)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {deleteMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Removing...
                                        </>
                                      ) : (
                                        'Remove Article'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {story.story}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
