import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, CheckCircle2, ExternalLink, Globe } from 'lucide-react';
import { getCanisterInfo } from '../utils/canisterUrls';

/**
 * Reusable diagnostics panel showing canister information with copy/open actions
 * Used in error states to help users troubleshoot connectivity issues
 */
export function FeedDiagnosticsPanel() {
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

  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          Canister Information
        </CardTitle>
        <CardDescription className="text-sm">
          Your deployment details for troubleshooting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canisterInfo.frontendCanisterId && (
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
              Frontend Canister ID
            </label>
            <div className="flex gap-2">
              <Input 
                value={canisterInfo.frontendCanisterId} 
                readOnly 
                className="font-mono text-xs h-8"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(canisterInfo.frontendCanisterId!, 'frontend')}
              >
                {copiedUrl === 'frontend' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {canisterInfo.backendCanisterId && (
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
              Backend Canister ID
            </label>
            <div className="flex gap-2">
              <Input 
                value={canisterInfo.backendCanisterId} 
                readOnly 
                className="font-mono text-xs h-8"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(canisterInfo.backendCanisterId!, 'backend')}
              >
                {copiedUrl === 'backend' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {canisterInfo.rawUrl && (
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
              Raw URL (Alternative Access)
            </label>
            <div className="flex gap-2">
              <Input 
                value={canisterInfo.rawUrl} 
                readOnly 
                className="font-mono text-xs h-8"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(canisterInfo.rawUrl!, 'raw')}
              >
                {copiedUrl === 'raw' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href={canisterInfo.rawUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Try this URL if the standard URL isn't working
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
