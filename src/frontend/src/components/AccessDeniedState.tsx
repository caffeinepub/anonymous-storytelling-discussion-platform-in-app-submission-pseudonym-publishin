import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, LogIn, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AccessDeniedStateProps {
  principalId?: string;
  showLoginButton?: boolean;
}

export default function AccessDeniedState({ principalId, showLoginButton = true }: AccessDeniedStateProps) {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  
  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-12 pb-12 space-y-6">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
            
            <div className="space-y-3 text-center">
              <h2 className="font-serif text-2xl font-bold">Access Denied</h2>
              
              {isAnonymous ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    You need to log in to access this page.
                  </p>
                  <Alert className="text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Admin access requires authentication with Internet Identity.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Your account does not have admin privileges.
                  </p>
                  {principalId && (
                    <Alert className="text-left">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs font-mono break-all">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">Your Principal ID:</div>
                          <div className="select-all">{principalId}</div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isAnonymous && showLoginButton && (
                <Button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full"
                >
                  {isLoggingIn ? (
                    <>Logging in...</>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Log in with Internet Identity
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate({ to: '/troubleshooting' })}
                className="w-full"
              >
                Troubleshooting
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => navigate({ to: '/stories' })}
                className="w-full"
              >
                Return to Stories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
