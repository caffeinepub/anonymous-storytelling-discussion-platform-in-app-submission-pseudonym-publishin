import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/assets/generated/story-ink-wordmark-warm.dim_512x128.png" 
            alt="Story Ink" 
            className="h-8 w-auto"
          />
        </Link>
        
        <nav className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/' })}
          >
            Stories
          </Button>
          <Button 
            variant="default"
            onClick={() => navigate({ to: '/submit' })}
            className="gap-2"
          >
            <PenLine className="h-4 w-4" />
            Share Your Story
          </Button>
        </nav>
      </div>
    </header>
  );
}
