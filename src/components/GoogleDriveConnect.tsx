/**
 * GoogleDriveConnect Component
 *
 * A React component for connecting and managing Google Drive integration.
 * This is an OPTIONAL feature - the system works fully with local storage.
 *
 * Provides UI for:
 * - Connecting to Google Drive via OAuth (OPTIONAL)
 * - Displaying connection status
 * - Showing connected Google email
 * - Disconnecting from Google Drive
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Drive, Loader2, CheckCircle, XCircle, ExternalLink, HardDrive, Info } from 'lucide-react';

interface ConnectionStatus {
  success: boolean;
  connected: boolean;
  googleEmail: string | null;
  hasToken: boolean;
  hasRefreshToken: boolean;
  error?: string;
}

export function GoogleDriveConnect() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Fetch connection status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Check for success/error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'google_drive_connected') {
      toast.success('Google Drive connected successfully!');
      fetchStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      const errorMessage = decodeURIComponent(error);
      toast.error(`Google Drive connection failed: ${errorMessage}`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-drive/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching Google Drive status:', error);
      setStatus({
        success: false,
        connected: false,
        googleEmail: null,
        hasToken: false,
        hasRefreshToken: false,
        error: 'Failed to fetch status',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);

      // Get OAuth URL
      const response = await fetch('/api/google-drive/auth');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get OAuth URL');
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Google Drive');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);

      const response = await fetch('/api/google-drive/disconnect', {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to disconnect');
      }

      toast.success('Google Drive disconnected successfully');
      fetchStatus();
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to disconnect Google Drive');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Google Drive Integration
          </CardTitle>
          <CardDescription>Loading connection status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Google Drive Integration (Optional)
        </CardTitle>
        <CardDescription>
          Connect your Google Drive to store and share project files (Optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300 text-sm">
            Google Drive is optional - You can still use the system fully without connecting Google Drive.
            Files can be stored locally on the server.
          </AlertDescription>
        </Alert>

        {status?.connected ? (
          <>
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">
                  Connected
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {status.googleEmail || 'Google Drive'}
                </p>
              </div>
              <Badge variant="outline" className="border-green-600 text-green-600">
                Active
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Connected Account:</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{status.googleEmail}</span>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full"
            >
              {disconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Disconnect Google Drive
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Not Connected
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Optional: Connect to enable file storage in Google Drive
                </p>
              </div>
              <Badge variant="secondary">Inactive</Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>By connecting your Google Drive (optional), you'll be able to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Upload project documents and images</li>
                <li>Share files with team members</li>
                <li>Organize files in project folders</li>
                <li>Access files from anywhere</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Note: You don't need to connect Google Drive to use this system.
                Local storage is available by default.
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <HardDrive className="mr-2 h-4 w-4" />
                  Connect Google Drive (Optional)
                </>
              )}
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full"
            >
              <a
                href="https://support.google.com/drive/answer/2453713"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Learn More About Google Drive
              </a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
