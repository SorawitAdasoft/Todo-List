'use client';

import * as React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';

export default function OfflinePage() {
  const { t } = useTranslation();
  const { isOnline } = useOnlineStatus();
  
  // Redirect to home if back online
  React.useEffect(() => {
    if (isOnline) {
      window.location.href = '/';
    }
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className=\"min-h-screen bg-background flex items-center justify-center p-4\">
      <div className=\"max-w-md w-full text-center space-y-6\">
        {/* Offline icon */}
        <div className=\"flex justify-center\">
          <div className=\"w-24 h-24 bg-muted rounded-full flex items-center justify-center\">
            <WifiOff className=\"w-12 h-12 text-muted-foreground\" />
          </div>
        </div>

        {/* Title and description */}
        <div className=\"space-y-2\">
          <h1 className=\"text-2xl font-bold\">
            {t('offline.title')}
          </h1>
          <p className=\"text-muted-foreground\">
            {t('offline.description')}
          </p>
        </div>

        {/* Status indicator */}
        <div className=\"flex items-center justify-center space-x-2 text-sm\">
          <div className=\"w-2 h-2 bg-red-500 rounded-full animate-pulse\"></div>
          <span className=\"text-muted-foreground\">
            {t('common.offline')}
          </span>
        </div>

        {/* Actions */}
        <div className=\"space-y-3\">
          <Button
            onClick={handleRetry}
            className=\"w-full\"
            size=\"lg\"
          >
            <RefreshCw className=\"w-4 h-4 mr-2\" />
            Try Again
          </Button>
          
          <Link href=\"/\" className=\"block\">
            <Button
              variant=\"outline\"
              className=\"w-full\"
              size=\"lg\"
            >
              <Home className=\"w-4 h-4 mr-2\" />
              {t('offline.backToApp')}
            </Button>
          </Link>
        </div>

        {/* Tips for offline usage */}
        <div className=\"bg-muted/50 rounded-lg p-4 text-left space-y-2\">
          <h3 className=\"font-medium text-sm\">Offline Features:</h3>
          <ul className=\"text-sm text-muted-foreground space-y-1\">
            <li>• View and edit existing todos</li>
            <li>• Create new todos</li>
            <li>• Search through your todos</li>
            <li>• Mark todos as complete</li>
          </ul>
          <p className=\"text-xs text-muted-foreground mt-3\">
            All changes are saved locally and will sync when you're back online.
          </p>
        </div>

        {/* App info */}
        <div className=\"text-xs text-muted-foreground\">
          Todo PWA • Version 1.0.0
        </div>
      </div>
    </div>
  );
}"