importScripts('./workbox-sw.js')

if (workbox) {
    console.info('yay! workbox is loaded ૮ • ᴥ • ა')

    workbox.core.setCacheNameDetails({
        prefix: 'danre-vcard',
        suffix: 'v2.0.1',
        precache: 'precache',
        runtime: 'runtime',
    })

    workbox.navigationPreload.enable()

    // provide revision information for each asset to allow Workbox to properly manage updates.
    const PRECACHE_ASSETS = [
        { url: './', revision: '2.0.1' }, // alias for index.html
        { url: './index.html', revision: '2.0.1' },
        { url: './style.css', revision: '2.0.1' },
        { url: './index.mjs', revision: '2.0.1' },
        { url: './confetti.min.js', revision: '2.0.1' },
        { url: './waving.webp', revision: '2.0.1' },
        { url: './_nervous.webp', revision: '2.0.1' },
        { url: './manifest.json', revision: '2.0.1' },
        { url: '../img/qr.webp', revision: '2.0.1' },
    ]

    workbox.precaching.precacheAndRoute(PRECACHE_ASSETS)

    // strategy 1: network first for navigation requests (HTML pages)
    workbox.routing.registerRoute(
        ({ request }) => request.mode === 'navigate',
        async ({ event, request }) => {
            try {
                // attempt to use the preloaded navigation response.
                const preloadResponse = await event.preloadResponse
                if (preloadResponse) {
                    return preloadResponse
                }

                // fallback to a network-first strategy for navigation.
                const networkFirst = new workbox.strategies.NetworkFirst({
                    cacheName: 'danre-vcard-runtime-html',
                })
                return await networkFirst.handle({ request })
            } catch (error) {
                // the catch will be triggered if both preload and network fail.
                // in this case, we fall back to the precached index page.
                console.warn('fetch failed; returning precached index.', error)
                const cache = await caches.open(workbox.core.cacheNames.precache)
                // getCacheKeyForURL will look up the correct URL, even with revisioning.
                return await cache.match(workbox.precaching.getCacheKeyForURL('./'))
            }
        }
    )

    // strategy 2: stale-while-revalidate for CSS and JavaScript
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'style' || request.destination === 'script',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'danre-vcard-runtime-css-js',
        })
    )

    // strategy 3: cache first for images
    workbox.routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new workbox.strategies.CacheFirst({
            cacheName: 'danre-vcard-runtime-images',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                }),
            ],
        })
    )

    // use standard service worker lifecycle events for skipWaiting and clientsClaim.
    self.addEventListener('install', () => {
        self.skipWaiting()
    })

    self.addEventListener('activate', (event) => {
        event.waitUntil(self.clients.claim())
    })
} else {
    console.warn("boo! workbox didn't load ⊙︿⊙")
}
