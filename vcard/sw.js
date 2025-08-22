const CACHE_NAME = 'vcard-v1.0.1'
const CACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './index.mjs',
    './confetti.min.js',
    './waving.webp',
    './_nervous.webp',
    './manifest.json',
    '../img/qr.webp'
]

// Cache version for debugging
console.log('Service Worker: Cache version', CACHE_NAME)

// Install service worker and cache assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...')
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files')
                return cache.addAll(CACHE_ASSETS)
            })
            .then(() => {
                console.log('Service Worker: Cached all assets')
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting()
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error)
            })
    )
})

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...')
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        // Delete old cache versions
                        if (cache !== CACHE_NAME) {
                            console.log('Service Worker: Clearing old cache', cache)
                            return caches.delete(cache)
                        }
                    })
                )
            })
            .then(() => {
                console.log('Service Worker: Activated')
                // Ensure the service worker takes control of all pages immediately
                return self.clients.claim()
            })
    )
})

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return
    }

    // Skip non-http requests (chrome-extension, etc.)
    if (!event.request.url.startsWith('http')) {
        return
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url)
                    return cachedResponse
                }

                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network', event.request.url)
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response
                        }

                        // Clone response as it can only be consumed once
                        const responseToCache = response.clone()

                        // Cache the new response for future requests
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('Service Worker: Caching new resource', event.request.url)
                                cache.put(event.request, responseToCache)
                            })

                        return response
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error)
                        
                        // If offline and requesting a page, return the cached index.html
                        if (event.request.mode === 'navigate') {
                            console.log('Service Worker: Serving offline fallback')
                            return caches.match('./index.html')
                        }
                        
                        // For other requests, we could return a generic offline page
                        throw error
                    })
            })
    )
})

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})