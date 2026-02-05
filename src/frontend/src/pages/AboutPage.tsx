import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="border-border shadow-soft">
        <CardContent className="pt-8 pb-8 px-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">About Me</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
            <p className="leading-relaxed">
              I am an author and storyteller, and the creator of <span className="font-semibold text-primary">Genuine-Being Real</span> — a platform dedicated to sharing real, anonymous stories and emotions. My debut novel, <span className="italic">Shining Gaze – A Search for the Unknown</span>, reflects my belief in emotional resilience, self-discovery, and the power of untold stories.
            </p>
            
            <p className="leading-relaxed">
              Through this platform, I aim to create a safe space where people can share experiences they may not always be able to express openly. My goal is to build a community rooted in honesty, empathy, and meaningful conversations, where every story finds understanding and respect.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Get in Touch</h2>
            <div className="flex items-center gap-3 text-foreground/90">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Sana Khan</p>
                <a 
                  href="mailto:authorsanakhan@gmail.com" 
                  className="text-primary hover:underline transition-colors"
                >
                  authorsanakhan@gmail.com
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
