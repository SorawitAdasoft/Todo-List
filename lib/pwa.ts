import { useState, useEffect } from 'react';

/**
 * PWA utilities for service worker registration and management
 */

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isOnline: boolean;
}

type PWAEventListener = (state: PWAState) => void;

class PWAManager {
  private state: PWAState = {
    isInstallable: false,
    isInstalled: false,
    isUpdateAvailable: false,
    isOnline: true,
  };

  private listeners: PWAEventListener[] = [];
  private installPromptEvent: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    // Check if already installed
    this.state.isInstalled = this.isAppInstalled();
    
    // Setup online/offline detection
    this.state.isOnline = navigator.onLine;
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);

    // Setup install prompt detection
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);

    // Setup app installed detection
    window.addEventListener('appinstalled', this.handleAppInstalled);

    // Register service worker
    await this.registerServiceWorker();

    this.notifyListeners();
  }

  private handleOnlineStatusChange = () => {
    this.state.isOnline = navigator.onLine;
    this.notifyListeners();
  };

  private handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    this.installPromptEvent = e as PWAInstallPrompt;
    this.state.isInstallable = true;
    this.notifyListeners();
  };

  private handleAppInstalled = () => {
    this.installPromptEvent = null;
    this.state.isInstallable = false;
    this.state.isInstalled = true;
    this.notifyListeners();
  };

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service worker registered:', this.registration);

      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.state.isUpdateAvailable = true;
              this.notifyListeners();
            }
          });
        }
      });

      // Listen for waiting service worker
      if (this.registration.waiting) {
        this.state.isUpdateAvailable = true;
        this.notifyListeners();
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      this.state.isUpdateAvailable = true;
      this.notifyListeners();
    }
  };

  private isAppInstalled(): boolean {
    // Check if running in standalone mode (installed as PWA)
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Public API
  getState(): PWAState {
    return { ...this.state };
  }

  subscribe(listener: PWAEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPromptEvent) {
      return false;
    }

    try {
      await this.installPromptEvent.prompt();
      const result = await this.installPromptEvent.userChoice;
      this.installPromptEvent = null;
      this.state.isInstallable = false;
      
      if (result.outcome === 'accepted') {
        this.state.isInstalled = true;
      }
      
      this.notifyListeners();
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // Send message to waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to activate the new service worker
    window.location.reload();
  }

  async checkForUpdates(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      this.state.isUpdateAvailable = false;
      this.notifyListeners();
      return result;
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
      return false;
    }
  }

  // Cleanup
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnlineStatusChange);
      window.removeEventListener('offline', this.handleOnlineStatusChange);
      window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', this.handleAppInstalled);
      
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage);
      }
    }
    
    this.listeners = [];
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// React hook for PWA state
export function usePWA() {
  const [state, setState] = useState<PWAState>(pwaManager.getState());

  useEffect(() => {
    const unsubscribe = pwaManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    promptInstall: pwaManager.promptInstall.bind(pwaManager),
    updateApp: pwaManager.updateServiceWorker.bind(pwaManager),
    checkForUpdates: pwaManager.checkForUpdates.bind(pwaManager),
  };
}

// Utility functions
export function isBrowserSupported(): boolean {
  return 'serviceWorker' in navigator && 'Cache' in window && 'indexedDB' in window;
}

export function isPWAInstalled(): boolean {
  return pwaManager.getState().isInstalled;
}