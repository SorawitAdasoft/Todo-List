import * as React from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { usePWA } from '@/lib/pwa';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  className?: string;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ className }) => {
  const { t } = useTranslation();
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);

  // Don't show if not installable, already dismissed, or already installed
  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const installed = await promptInstall();
      if (installed) {
        setDismissed(true);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Check if already dismissed this session
  React.useEffect(() => {
    const wasDismissed = sessionStorage.getItem('installPromptDismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50',
        'bg-background border border-border rounded-lg shadow-lg p-4',
        'animate-slide-up',
        className
      )}
    >
      <div className=\"flex items-start space-x-3\">
        <div className=\"flex-shrink-0\">
          <div className=\"w-10 h-10 bg-primary rounded-lg flex items-center justify-center\">
            <Download className=\"w-5 h-5 text-primary-foreground\" />
          </div>
        </div>
        
        <div className=\"flex-1 min-w-0\">
          <h3 className=\"text-sm font-medium mb-1\">
            Install Todo PWA
          </h3>
          <p className=\"text-xs text-muted-foreground mb-3\">
            {t('pwa.installPrompt')}
          </p>
          
          <div className=\"flex space-x-2\">
            <Button
              size=\"sm\"
              onClick={handleInstall}
              disabled={installing}
              className=\"flex-1\"
            >
              {installing ? (
                <>
                  <div className=\"w-3 h-3 mr-2 border border-current border-t-transparent rounded-full animate-spin\" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className=\"w-3 h-3 mr-2\" />
                  {t('pwa.install')}
                </>
              )}
            </Button>
            
            <Button
              variant=\"ghost\"
              size=\"sm\"
              onClick={handleDismiss}
              className=\"flex-shrink-0\"
              aria-label=\"Dismiss install prompt\"
            >
              <X className=\"w-3 h-3\" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

InstallPrompt.displayName = 'InstallPrompt';

export { InstallPrompt };"