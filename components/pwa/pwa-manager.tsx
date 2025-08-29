import * as React from 'react';
import { InstallPrompt } from './install-prompt';
import { UpdateNotification } from './update-notification';
import { usePWA } from '@/lib/pwa';

/**
 * PWA Manager component that handles install prompts and update notifications
 */
const PWAManager: React.FC = () => {
  const { isInstalled } = usePWA();

  return (
    <>
      {/* Show install prompt only if not installed */}
      {!isInstalled && <InstallPrompt />}
      
      {/* Show update notification when available */}
      <UpdateNotification />
    </>
  );
};

PWAManager.displayName = 'PWAManager';

export { PWAManager };"