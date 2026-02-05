import { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import AppHeader from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <nav className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
              >
                About
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/troubleshooting" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
              >
                Troubleshooting
              </Link>
            </nav>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Contact: <span className="font-medium">Sana Khan</span> – <a href="mailto:authorsanakhan@gmail.com" className="text-primary hover:underline transition-colors">authorsanakhan@gmail.com</a>
              </p>
              <p className="text-sm text-muted-foreground">
                © 2026. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">caffeine.ai</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
