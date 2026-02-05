import { useNavigate } from '@tanstack/react-router';
import { useGetPublishedStories } from '../hooks/useStories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Calendar } from 'lucide-react';

export default function FeedPage() {
  const navigate = useNavigate();
  const { data: stories, isLoading, error } = useGetPublishedStories();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-muted/50 to-background border-b border-border overflow-hidden">
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
                src="/assets/generated/paper-stories-hero-warm.dim_1400x400.png" 
                alt="Stories" 
                className="w-full max-w-3xl mx-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stories Feed */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
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

          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">Failed to load stories. Please try again later.</p>
              </CardContent>
            </Card>
          )}

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

          {!isLoading && !error && stories && stories.length > 0 && (
            <>
              {stories.map((story) => (
                <Card 
                  key={story.title} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
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
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
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
