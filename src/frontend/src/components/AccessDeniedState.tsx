import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedState() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/' })}>
              Return to Stories
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
