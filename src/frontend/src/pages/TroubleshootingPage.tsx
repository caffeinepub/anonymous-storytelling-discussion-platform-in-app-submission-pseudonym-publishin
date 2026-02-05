import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, CheckCircle2, AlertCircle, RefreshCw, Globe, ExternalLink, AlertTriangle } from 'lucide-react';
import { getCanisterInfo } from '../utils/canisterUrls';

export default function TroubleshootingPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const canisterInfo = getCanisterInfo();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(label);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isUnknown = canisterInfo.source === 'unknown';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
          ← Back to Home
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Troubleshooting: Canister ID Not Resolved</h1>
          <p className="text-lg text-muted-foreground">
            If you're seeing a "Canister ID Not Resolved" error, this page will help you understand and fix it.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>What does this error mean?</AlertTitle>
          <AlertDescription>
            This error occurs when the Internet Computer network's edge nodes haven't finished routing your canister yet. 
            It's typically a temporary issue that resolves itself within a few minutes after deployment.
          </AlertDescription>
        </Alert>

        {isUnknown && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cannot Determine Canister ID</AlertTitle>
            <AlertDescription>
              The frontend canister ID could not be resolved from the current hostname or environment variables. 
              This usually means the application needs to be redeployed. Please refer to the DEPLOYMENT.md file 
              for step-by-step instructions on how to deploy and verify your canister IDs.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Your Canister Information
            </CardTitle>
            <CardDescription>
              {isUnknown 
                ? 'Canister information could not be determined. Please redeploy your application.'
                : 'Use these URLs to access your application on the Internet Computer'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Frontend (Asset) Canister ID
                <span className="text-xs text-muted-foreground ml-2">(This is the website you're viewing)</span>
              </label>
              <div className="flex gap-2">
                <Input 
                  value={canisterInfo.frontendCanisterId || 'Unknown - Please redeploy'} 
                  readOnly 
                  className={`font-mono text-sm ${!canisterInfo.frontendCanisterId ? 'text-destructive' : ''}`}
                />
                {canisterInfo.frontendCanisterId && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(canisterInfo.frontendCanisterId!, 'frontend-id')}
                  >
                    {copiedUrl === 'frontend-id' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Source: {canisterInfo.source === 'hostname' ? 'Detected from current URL' : canisterInfo.source === 'env' ? 'From environment variables' : 'Unknown'}
              </p>
            </div>

            {canisterInfo.backendCanisterId && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Backend (API) Canister ID
                  <span className="text-xs text-muted-foreground ml-2">(This handles data and logic)</span>
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={canisterInfo.backendCanisterId} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(canisterInfo.backendCanisterId!, 'backend-id')}
                  >
                    {copiedUrl === 'backend-id' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ⚠️ Do not use this ID to access the website - it will cause routing errors
                </p>
              </div>
            )}

            {canisterInfo.standardUrl && (
              <div>
                <label className="text-sm font-medium mb-2 block">Standard URL (icp0.io)</label>
                <div className="flex gap-2">
                  <Input 
                    value={canisterInfo.standardUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(canisterInfo.standardUrl!, 'standard')}
                  >
                    {copiedUrl === 'standard' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={canisterInfo.standardUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the primary URL for your application
                </p>
              </div>
            )}

            {canisterInfo.rawUrl && (
              <div>
                <label className="text-sm font-medium mb-2 block">Raw URL (raw.icp0.io)</label>
                <div className="flex gap-2">
                  <Input 
                    value={canisterInfo.rawUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(canisterInfo.rawUrl!, 'raw')}
                  >
                    {copiedUrl === 'raw' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={canisterInfo.rawUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alternative URL that sometimes loads faster during propagation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Quick Fixes
            </CardTitle>
            <CardDescription>
              Try these steps in order if you see the error
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-sm">
                <strong>Wait 1-3 minutes</strong> – The Internet Computer edge nodes need time to propagate your canister after deployment. This is the most common cause and usually resolves itself.
              </li>
              <li className="text-sm">
                <strong>Refresh the page</strong> – After waiting, do a hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac).
              </li>
              <li className="text-sm">
                <strong>Try the raw URL</strong> – Click the external link button next to the raw URL above. The raw.icp0.io domain sometimes propagates faster.
              </li>
              <li className="text-sm">
                <strong>Switch networks</strong> – Try using mobile data instead of WiFi, or vice versa. Different networks may have different DNS cache states.
              </li>
              <li className="text-sm">
                <strong>Try a different browser</strong> – Use an incognito/private window or a different browser to rule out local cache issues.
              </li>
              <li className="text-sm">
                <strong>Check Internet Computer status</strong> – Visit the{' '}
                <a 
                  href="https://status.internetcomputer.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Internet Computer Status Page
                </a>
                {' '}to see if there are any known network issues.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="text-primary mt-0.5">•</div>
                <div className="text-sm">
                  <strong>Recent deployment</strong> – Edge nodes haven't finished updating (wait 1-5 minutes)
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-primary mt-0.5">•</div>
                <div className="text-sm">
                  <strong>Wrong canister ID in URL</strong> – Using the backend canister ID instead of the frontend canister ID will cause this error. Always use the frontend (asset) canister ID for website URLs.
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-primary mt-0.5">•</div>
                <div className="text-sm">
                  <strong>DNS propagation delay</strong> – Your local DNS hasn't picked up the canister yet (try mobile data or different network)
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-primary mt-0.5">•</div>
                <div className="text-sm">
                  <strong>Browser cache</strong> – Old DNS records cached locally (try incognito mode or different browser)
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-primary mt-0.5">•</div>
                <div className="text-sm">
                  <strong>Network routing</strong> – Temporary routing issues on the Internet Computer (usually resolves automatically)
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Still having issues?</AlertTitle>
          <AlertDescription>
            If the error persists after 10-15 minutes and you've tried all the steps above, there may be a deployment issue. 
            Check the DEPLOYMENT.md file in the repository for detailed redeployment instructions and verification steps.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
