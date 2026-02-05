import { useState } from 'react';
import { useAddComment } from '../hooks/useStories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send } from 'lucide-react';

interface CommentComposerProps {
  storyTitle: string;
}

export default function CommentComposer({ storyTitle }: CommentComposerProps) {
  const [commenterHandle, setCommenterHandle] = useState('');
  const [comment, setComment] = useState('');
  const addCommentMutation = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commenterHandle.trim() || !comment.trim()) {
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        storyTitle,
        commenterHandle: commenterHandle.trim(),
        comment: comment.trim(),
      });
      setCommenterHandle('');
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commenterHandle">Your Name (optional)</Label>
            <Input
              id="commenterHandle"
              placeholder="Anonymous"
              value={commenterHandle}
              onChange={(e) => setCommenterHandle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Thoughts</Label>
            <Textarea
              id="comment"
              placeholder="Share your perspective..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          {addCommentMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to post comment. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={addCommentMutation.isPending || !comment.trim()}
            className="w-full gap-2"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Post Comment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
