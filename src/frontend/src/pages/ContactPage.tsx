import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiInstagram, SiLinkedin } from 'react-icons/si';
import { Mail, BookOpen } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect with the author and explore her work
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Sana Khan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Book Information */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Latest Book</h3>
              <p className="text-lg font-serif text-foreground">
                Shining Gaze - A search for the unknown
              </p>
            </div>
          </div>

          {/* Email Contact */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <a href="mailto:authorsanakhan@gmail.com">
                  authorsanakhan@gmail.com
                </a>
              </Button>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Connect on Social Media</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                asChild
                className="flex-1 justify-start gap-3"
              >
                <a
                  href="https://www.instagram.com/shining_starsana/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiInstagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
              </Button>
              <Button
                variant="outline"
                asChild
                className="flex-1 justify-start gap-3"
              >
                <a
                  href="https://www.linkedin.com/in/sana-khan-919353159/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiLinkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Feel free to reach out for inquiries, collaborations, or to discuss the book.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
