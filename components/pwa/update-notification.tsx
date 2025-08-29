import * as React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { usePWA } from '@/lib/pwa';
import { cn } from '@/lib/utils';

interface UpdateNotificationProps {
  className?: string;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ className }) => {
  const { t } = useTranslation();
  const { isUpdateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  // Don't show if no update available or dismissed
  if (!isUpdateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateApp();
      // The page will reload automatically
    } catch (error) {
      console.error('Update failed:', error);
      setUpdating(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('updateNotificationDismissed', 'true');
  };

  // Check if already dismissed this session
  React.useEffect(() => {
    const wasDismissed = sessionStorage.getItem('updateNotificationDismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  return (
    <div
      className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50',
        'bg-primary text-primary-foreground rounded-lg shadow-lg p-4',
        'animate-slide-down',
        className
      )}
    >
      <div className=\"flex items-start space-x-3\">
        <div className=\"flex-shrink-0\">
          <div className=\"w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center\">
            <RefreshCw className=\"w-4 h-4\" />
          </div>
        </div>
        
        <div className=\"flex-1 min-w-0\">
          <h3 className=\"text-sm font-medium mb-1\">
            {t('pwa.updateAvailable')}
          </h3>
          <p className=\"text-xs opacity-90 mb-3\">
            A new version of the app is available.
          </p>
          
          <div className=\"flex space-x-2\">
            <Button
              size=\"sm\"
              variant=\"secondary\"
              onClick={handleUpdate}
              disabled={updating}
              className=\"flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90\"
            >
              {updating ? (
                <>
                  <div className=\"w-3 h-3 mr-2 border border-current border-t-transparent rounded-full animate-spin\" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className=\"w-3 h-3 mr-2\" />
                  {t('pwa.updateNow')}
                </>
              )}
            </Button>
            
            <Button
              variant=\"ghost\"
              size=\"sm\"
              onClick={handleDismiss}
              className=\"flex-shrink-0 text-primary-foreground hover:bg-primary-foreground/20\"
              aria-label=\"Dismiss update notification\"
            >
              <X className=\"w-3 h-3\" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

UpdateNotification.displayName = 'UpdateNotification';

export { UpdateNotification };"