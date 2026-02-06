import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

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
            className="hover:text-primary hover:bg-primary/5 transition-colors"
          >
            Home
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/about' })}
            className="hover:text-primary hover:bg-primary/5 transition-colors"
          >
            About
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/contact' })}
            className="hover:text-primary hover:bg-primary/5 transition-colors"
          >
            Contact
          </Button>
        </nav>
      </div>
    </header>
  );
}
