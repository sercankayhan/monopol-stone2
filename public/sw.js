// Service Worker for Monopol Stone
const CACHE_NAME = 'monopol-stone-v1.0.0';
const STATIC_CACHE = 'monopol-stone-static-v1.0.0';
const DYNAMIC_CACHE = 'monopol-stone-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.jpeg',
  '/siyahlogo.png',
  '/tr.svg',
  '/gb.svg',
  '/images/product-placeholder.svg',
  // Critical CSS will be inlined, so no need to cache here
];

// API endpoints and dynamic content
const DYNAMIC_ASSETS = [
  '/api/analytics',
  '/api/error-logging',
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/api/',
  '/urun/',
  '/en/product/',
];

// Cache-first resources (serve from cache, update in background)
const CACHE_FIRST = [
  '/images/',
  '/header/',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.css',
  '.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Static assets cached successfully');
      return self.skipWaiting(); // Force activation
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Network-first strategy for API calls and dynamic content
    if (NETWORK_FIRST.some(path => pathname.includes(path))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHE_FIRST.some(ext => pathname.includes(ext))) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    updateCache(request);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request.clone(), networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to update cache in background
  const networkPromise = updateCache(request);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cached version, wait for network
  return await networkPromise;
}

// Update cache in background
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Background update failed:', error);
    throw error;
  }
}

// Offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return cached home page or offline page
  if (request.headers.get('Accept')?.includes('text/html')) {
    const cachedHome = await caches.match('/');
    if (cachedHome) {
      return cachedHome;
    }
    
    // Return basic offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monopol Stone - Çevrimdışı</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .container { 
              max-width: 400px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            }
            h1 { color: #FD7E14; margin-bottom: 20px; }
            button { 
              background: #FD7E14; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-size: 16px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔌 Çevrimdışı</h1>
            <p>İnternet bağlantınızı kontrol edin ve tekrar deneyin.</p>
            <button onclick="window.location.reload()">Yeniden Dene</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // For images, return placeholder
  if (request.url.includes('/images/') || request.headers.get('Accept')?.includes('image/')) {
    const placeholderResponse = await caches.match('/images/product-placeholder.svg');
    if (placeholderResponse) {
      return placeholderResponse;
    }
  }
  
  // Default fallback
  return new Response('Offline', { status: 503 });
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  try {
    // Get pending analytics data from IndexedDB or localStorage
    const pendingData = await getPendingAnalytics();
    
    for (const data of pendingData) {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        // Remove from pending queue
        await removePendingAnalytics(data.id);
      } catch (error) {
        console.error('[SW] Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function getPendingAnalytics() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingAnalytics(id) {
  // This would typically remove from IndexedDB
  console.log('[SW] Removing pending analytics:', id);
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Yeni güncelleme mevcut!',
    icon: '/siyahlogo.png',
    badge: '/siyahlogo.png',
    tag: 'monopol-stone-notification',
    actions: [
      {
        action: 'open',
        title: 'Aç',
        icon: '/siyahlogo.png'
      },
      {
        action: 'close',
        title: 'Kapat'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Monopol Stone', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});