import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useBackendAvailability } from '../hooks/useBackendAvailability';

/**
 * Diagnostics component that runs an explicit backend heartbeat check
 * and displays clear reachability status with actionable feedback
 */
export function BackendHeartbeatCheck() {
  const [enabled, setEnabled] = useState(false);
  const { state, error, isChecking, refetch } = useBackendAvailability(enabled);

  const handleCheck = () => {
    setEnabled(true);
    if (state !== 'unknown') {
      refetch();
    }
  };

  const getStatusIcon = () => {
    switch (state) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'reachable':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'unreachable':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'checking':
        return 'Checking backend...';
      case 'reachable':
        return 'Backend is reachable';
      case 'unreachable':
        return 'Backend is not reachable';
      default:
        return 'Ready to check';
    }
  };

  const getStatusVariant = () => {
    switch (state) {
      case 'reachable':
        return 'default';
      case 'unreachable':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Backend Heartbeat Check
        </CardTitle>
        <CardDescription>
          Test if the backend canister is responding to requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <Button
            onClick={handleCheck}
            disabled={isChecking}
            variant={state === 'reachable' ? 'outline' : 'default'}
            size="sm"
          >
            {isChecking ? 'Checking...' : state === 'unknown' ? 'Run Check' : 'Check Again'}
          </Button>
        </div>

        {state === 'reachable' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Backend is Online</AlertTitle>
            <AlertDescription>
              The backend canister is responding correctly. If you're experiencing issues with specific features,
              they may be related to authentication, permissions, or data-specific problems rather than connectivity.
            </AlertDescription>
          </Alert>
        )}

        {state === 'unreachable' && (
          <Alert variant={getStatusVariant()}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Backend Not Responding</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>The backend canister is not reachable. This could mean:</p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                <li>The canister is still propagating after deployment (wait 1-3 minutes)</li>
                <li>There's a temporary network issue with the Internet Computer</li>
                <li>The backend canister may not be deployed or configured correctly</li>
              </ul>
              {error && (
                <p className="mt-2 text-xs font-mono bg-destructive/10 p-2 rounded">
                  Error: {error}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {state === 'unknown' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Yet Checked</AlertTitle>
            <AlertDescription>
              Click "Run Check" to test if the backend canister is responding. This will help diagnose
              connectivity issues between the frontend and backend.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
