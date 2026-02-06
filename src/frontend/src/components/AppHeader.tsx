import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import { ShieldCheck } from 'lucide-react';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const showAdminLink = isAuthenticated && isAdmin === true && !isCheckingAdmin;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/assets/generated/genuine-being-icon.dim_512x512.png" 
            alt="Genuine-Being Real" 
            className="h-10 w-10 object-contain"
          />
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
            onClick={() => navigate({ to: '/articles' })}
            className="hover:text-primary hover:bg-primary/5 transition-colors"
          >
            Articles
          </Button>
          {showAdminLink && (
            <Button 
              variant="ghost" 
              onClick={() => navigate({ to: '/admin' })}
              className="hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
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
