import { useState } from 'react';
import { useGetAllStories, usePublishStory, useCreateAndPublishArticle } from '../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Loader2, Calendar, ShieldAlert, PlusCircle } from 'lucide-react';
import AccessDeniedState from '../components/AccessDeniedState';
import type { Story } from '../backend';

export default function AdminModerationPage() {
  const { data: stories, isLoading, error } = useGetAllStories();
  const publishMutation = usePublishStory();
  const createArticleMutation = useCreateAndPublishArticle();
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [rewordedTitle, setRewordedTitle] = useState('');
  const [rewordedStory, setRewordedStory] = useState('');
  const [rewordedPseudonym, setRewordedPseudonym] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // New article creation state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthorPseudonym, setNewAuthorPseudonym] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newIsAnonymous, setNewIsAnonymous] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const isUnauthorized = error && (error as Error).message.includes('Unauthorized');

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setRewordedTitle(story.title);
    setRewordedStory(story.story);
    setRewordedPseudonym(story.authorPseudonym);
    setPublishSuccess(false);
  };

  const handlePublish = async () => {
    if (!selectedStory || !rewordedTitle.trim() || !rewordedStory.trim() || !rewordedPseudonym.trim()) {
      return;
    }

    try {
      await publishMutation.mutateAsync({
        title: selectedStory.title,
        rewordedStory: rewordedStory.trim(),
        rewordedPseudonym: rewordedPseudonym.trim(),
      });
      setPublishSuccess(true);
      setTimeout(() => {
        setSelectedStory(null);
        setRewordedTitle('');
        setRewordedStory('');
        setRewordedPseudonym('');
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

  if (isUnauthorized) {
    return <AccessDeniedState />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-serif text-3xl font-bold">Story Moderation</h1>
            <p className="text-muted-foreground">Review and publish submitted stories, or create new articles</p>
          </div>
        </div>

        {isLoading && (
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

        {error && !isUnauthorized && (
          <Alert variant="destructive">
            <AlertDescription>Failed to load submissions. Please try again.</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && stories && (
          <>
            {/* Create New Article Section */}
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

            {/* Existing Moderation Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Submissions List */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Pending Submissions ({stories.length})</CardTitle>
                  <CardDescription>Select a story to review and publish</CardDescription>
                </CardHeader>
                <CardContent>
                  {stories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending submissions</p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {stories.map((story) => (
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

              {/* Publishing Editor */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Publish Story</CardTitle>
                  <CardDescription>Edit and publish the selected story</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedStory ? (
                    <p className="text-muted-foreground text-center py-12">
                      Select a story from the left to begin editing
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
                    <Tabs defaultValue="original" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="original">Original</TabsTrigger>
                        <TabsTrigger value="edit">Edit & Publish</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="original" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Original Title</Label>
                          <p className="font-semibold">{selectedStory.title}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Submitted By</Label>
                          <p>{selectedStory.isAnonymous ? 'Anonymous' : selectedStory.authorName || selectedStory.authorPseudonym}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Original Story</Label>
                          <div className="p-4 rounded-lg border bg-accent/10 max-h-[400px] overflow-y-auto">
                            <p className="whitespace-pre-wrap text-sm">{selectedStory.story}</p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="edit" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="pseudonym">Published Pseudonym</Label>
                          <Input
                            id="pseudonym"
                            value={rewordedPseudonym}
                            onChange={(e) => setRewordedPseudonym(e.target.value)}
                            placeholder="Author name for publication"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="rewordedStory">Published Story</Label>
                          <Textarea
                            id="rewordedStory"
                            value={rewordedStory}
                            onChange={(e) => setRewordedStory(e.target.value)}
                            rows={12}
                            className="resize-none font-serif"
                            placeholder="Edit the story for publication..."
                          />
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
                          disabled={publishMutation.isPending || !rewordedStory.trim() || !rewordedPseudonym.trim()}
                          className="w-full"
                        >
                          {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Publish Story
                        </Button>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
