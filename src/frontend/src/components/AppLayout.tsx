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
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <nav className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                About
              </Link>
            </nav>
            <p className="text-center text-sm text-muted-foreground">
              © 2026. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
