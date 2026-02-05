import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PenLine, Heart } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-primary/10 via-accent/20 to-background border-b border-border overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              Genuine-Being Real
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A safe space for sharing authentic life experiences. Read real stories from real people, or share your own journey anonymously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg"
                onClick={() => navigate({ to: '/stories' })}
                className="gap-2 text-lg px-8 py-6"
              >
                <BookOpen className="h-5 w-5" />
                Read Stories
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/submit' })}
                className="gap-2 text-lg px-8 py-6"
              >
                <PenLine className="h-5 w-5" />
                Share Your Story
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Read Real Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Discover authentic experiences shared by people from all walks of life. Every story is real, every voice matters.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <PenLine className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Share Anonymously</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Your story, your choice. Share with your name or remain anonymous. We protect your privacy while amplifying your voice.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Connect & Reflect</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Join thoughtful discussions, find solidarity in shared experiences, and discover you're not alone in your journey.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/30">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                Start Your Journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're here to read, share, or simply connect with others, you're in the right place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate({ to: '/stories' })}
                  className="gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Go to Stories
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: '/about' })}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
