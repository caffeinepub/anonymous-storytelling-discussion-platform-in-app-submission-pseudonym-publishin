import { useGetComments } from '../hooks/useStories';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Calendar, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CommentThreadProps {
  storyTitle: string;
}

export default function CommentThread({ storyTitle }: CommentThreadProps) {
  const { data: comments, isLoading } = useGetComments(storyTitle);

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1_000_000);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Comments are being saved but cannot be displayed yet. The backend needs to be updated to support comment retrieval.
          </AlertDescription>
        </Alert>
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-3">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground">No comments to display.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <Card key={index}>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{comment.commenterHandle}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(comment.timestamp)}
              </span>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {comment.comment}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
