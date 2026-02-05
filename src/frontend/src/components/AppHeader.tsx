import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-serif font-bold text-foreground">
            Genuine-Being Real
          </span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/' })}
            className="hover:text-primary"
          >
            Home
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/stories' })}
            className="hover:text-primary"
          >
            Stories
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/about' })}
            className="hover:text-primary"
          >
            About
          </Button>
          <Button 
            variant="default"
            onClick={() => navigate({ to: '/submit' })}
            className="gap-2 ml-2"
          >
            <PenLine className="h-4 w-4" />
            Share Your Story
          </Button>
        </nav>
      </div>
    </header>
  );
}
