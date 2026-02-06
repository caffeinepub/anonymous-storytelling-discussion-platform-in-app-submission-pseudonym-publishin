import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, LogOut, Loader2, User, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';
  const isLoginError = loginStatus === 'loginError';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/50 bg-accent/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">You're Logged In</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Your session is active
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-border bg-background/50">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Principal ID</span>
                </div>
                <p className="text-sm text-muted-foreground font-mono break-all pl-8">
                  {identity.getPrincipal().toString()}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Login</h1>
          <p className="text-muted-foreground text-lg">
            Sign in to access your account and submit stories
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Internet Identity</CardTitle>
            <CardDescription>
              Secure, anonymous authentication powered by the Internet Computer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <LogIn className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-6">
                Click below to authenticate with Internet Identity
              </p>
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="lg"
                className="min-w-[200px]"
              >
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
              </Button>
            </div>

            {isLoginError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Login failed. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t border-border">
              <h3 className="font-medium mb-2">What is Internet Identity?</h3>
              <p className="text-sm text-muted-foreground">
                Internet Identity is a secure authentication system that doesn't require passwords or personal information. 
                Your identity is cryptographically secured and works across all Internet Computer applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
