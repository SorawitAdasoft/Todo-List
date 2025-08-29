/**
 * Service Worker for Todo PWA
 * Implements offline-first caching strategy
 */

const CACHE_NAME = 'todo-pwa-v1';
const OFFLINE_URL = '/offline';

// Files to cache for offline access
const STATIC_CACHE_FILES = [
  '/',
  '/offline',
  '/today',
  '/completed',
  '/manifest.webmanifest',
];

// Runtime cache names
const RUNTIME_CACHE = {
  pages: 'pages-cache-v1',
  api: 'api-cache-v1',
  static: 'static-cache-v1',
  images: 'images-cache-v1',
};

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
};

/**
 * Install event - cache static files
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching static files');
        await cache.addAll(STATIC_CACHE_FILES);
        console.log('[SW] Static files cached successfully');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[SW] Failed to cache static files:', error);
      }
    })()
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletionPromises = cacheNames
          .filter(name => name !== CACHE_NAME && !Object.values(RUNTIME_CACHE).includes(name))
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          });
        
        await Promise.all(deletionPromises);
        
        // Take control of all clients
        await self.clients.claim();
        console.log('[SW] Service worker activated and took control');
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Handle request with appropriate caching strategy
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // API routes - Network first with cache fallback
    if (pathname.startsWith('/api/')) {
      return await networkFirst(request, RUNTIME_CACHE.api);
    }
    
    // Next.js static assets - Cache first
    if (pathname.startsWith('/_next/static/')) {
      return await cacheFirst(request, RUNTIME_CACHE.static);
    }
    
    // Images and icons - Cache first
    if (pathname.startsWith('/icons/') || pathname.match(/\\.(png|jpg|jpeg|svg|webp|gif)$/)) {
      return await cacheFirst(request, RUNTIME_CACHE.images);
    }
    
    // Manifest - Stale while revalidate
    if (pathname === '/manifest.webmanifest') {
      return await staleWhileRevalidate(request, CACHE_NAME);
    }
    
    // App pages - Network first with offline fallback
    return await networkFirstWithOfflineFallback(request);
    
  } catch (error) {
    console.error('[SW] Request handling failed:', error);
    return await getOfflineFallback();
  }
}

/**
 * Cache first strategy
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

/**
 * Network first strategy
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale while revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.error('[SW] Background update failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await fetchPromise;
}

/**
 * Network first with offline fallback for pages
 */
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(RUNTIME_CACHE.pages);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for page, trying cache:', error);
    
    // Try to get from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as last resort
    return await getOfflineFallback();
  }
}

/**
 * Get offline fallback page
 */
async function getOfflineFallback() {
  const cache = await caches.open(CACHE_NAME);
  const offlineResponse = await cache.match(OFFLINE_URL);
  
  if (offlineResponse) {
    return offlineResponse;
  }
  
  // Create a minimal offline response if offline page is not cached
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Offline - Todo PWA</title>
        <meta charset=\"utf-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
          .offline { color: #666; }
        </style>
      </head>
      <body>
        <div class=\"offline\">
          <h1>You're offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick=\"window.location.reload()\">Retry</button>
        </div>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    }
  );
}

/**
 * Message event - handle messages from main thread
 */
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data && data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

/**
 * Background sync event (for future use)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    // TODO: Implement background sync for todos
  }
});

/**
 * Push event (for future use)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  // TODO: Implement push notifications
});

/**
 * Notification click event (for future use)
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');
  event.notification.close();
  
  // TODO: Handle notification click
});

console.log('[SW] Service worker script loaded');"