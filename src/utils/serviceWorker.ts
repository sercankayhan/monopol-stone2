"use client";

// Service Worker Registration and Management

interface SwRegistrationResult {
  success: boolean;
  registration?: ServiceWorkerRegistration;
  error?: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private onUpdateCallbacks: Array<() => void> = [];

  async register(): Promise<SwRegistrationResult> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return { 
        success: false, 
        error: 'Service Worker not supported' 
      };
    }

    try {
      console.log('[SW] Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      this.registration = registration;
      
      console.log('[SW] Service Worker registered successfully');

      // Handle updates
      this.setupUpdateHandling(registration);

      // Handle installation
      this.setupInstallHandling(registration);

      return { 
        success: true, 
        registration 
      };

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  private setupUpdateHandling(registration: ServiceWorkerRegistration) {
    // Check for updates on page load
    registration.addEventListener('updatefound', () => {
      console.log('[SW] Update found');
      
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] Update available');
          this.updateAvailable = true;
          this.notifyUpdateAvailable();
        }
      });
    });

    // Listen for controller change (new SW took over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] New Service Worker took control');
      window.location.reload();
    });
  }

  private setupInstallHandling(registration: ServiceWorkerRegistration) {
    // Handle waiting worker (update ready to install)
    if (registration.waiting) {
      console.log('[SW] Service Worker waiting');
      this.updateAvailable = true;
      this.notifyUpdateAvailable();
    }

    // Handle installing worker
    if (registration.installing) {
      console.log('[SW] Service Worker installing');
      this.trackInstallation(registration.installing);
    }

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute
  }

  private trackInstallation(worker: ServiceWorker) {
    worker.addEventListener('statechange', () => {
      console.log('[SW] Installation state:', worker.state);
      
      if (worker.state === 'installed') {
        console.log('[SW] Service Worker installed');
        
        // Show install prompt if appropriate
        this.showInstallPrompt();
      }
    });
  }

  private notifyUpdateAvailable() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }

  private showInstallPrompt() {
    // This will be handled by the PWA install prompt
    console.log('[SW] App ready for offline use');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('sw-ready', {
      detail: { type: 'ready' }
    }));
  }

  // Public methods
  onUpdateAvailable(callback: () => void) {
    this.onUpdateCallbacks.push(callback);
  }

  async skipWaiting() {
    if (!this.registration?.waiting) return;

    console.log('[SW] Skipping waiting');
    
    // Send message to waiting SW to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  async getVersion(): Promise<string> {
    if (!this.registration?.active) return 'unknown';

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || 'unknown');
      };

      this.registration!.active!.postMessage(
        { type: 'GET_VERSION' }, 
        [messageChannel.port2]
      );
    });
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('[SW] Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('[SW] Failed to unregister:', error);
      return false;
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[SW] All caches cleared');
    } catch (error) {
      console.error('[SW] Failed to clear caches:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[SW] Failed to calculate cache size:', error);
      return 0;
    }
  }

  // Network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (online: boolean) => void) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }
}

// Singleton instance
const swManager = new ServiceWorkerManager();

export default swManager;

// Utility functions
export const formatCacheSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// PWA Install prompt
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button
  window.dispatchEvent(new CustomEvent('pwa-installable', {
    detail: { canInstall: true }
  }));
});

export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;

  try {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    console.log('[PWA] Install prompt result:', result.outcome);
    
    deferredPrompt = null;
    return result.outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt error:', error);
    return false;
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    swManager.register();
  });
}