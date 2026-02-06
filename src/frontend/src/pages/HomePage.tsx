import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PenLine, MessageSquare, Star } from 'lucide-react';

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
                Read
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/submit' })}
                className="gap-2 text-lg px-8 py-6"
              >
                <PenLine className="h-5 w-5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
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
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Discuss & Engage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Join thoughtful discussions through comments and reviews. Share your perspective, find solidarity in shared experiences, and discover you're not alone.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Discuss & Engage Section */}
      <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Discuss & Engage
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore conversations and share your thoughts on stories that resonate with you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer" onClick={() => navigate({ to: '/discussions', search: { mode: 'reviews' } })}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl">Reviews</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed mb-4">
                  Rate and review stories. Share your thoughts and help others discover meaningful content.
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: '/discussions', search: { mode: 'reviews' } });
                  }}
                >
                  <Star className="h-4 w-4" />
                  View Reviews
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer" onClick={() => navigate({ to: '/discussions', search: { mode: 'comments' } })}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl">Comments</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed mb-4">
                  Join discussions and connect with others. Share your perspective and find community.
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: '/discussions', search: { mode: 'comments' } });
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  View Comments
                </Button>
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
                  Read Stories
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
