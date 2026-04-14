importScripts('./workbox-sw.js')

if (workbox) {
    console.info('yay! workbox is loaded ૮ • ᴥ • ა')

    workbox.core.setCacheNameDetails({
        prefix: 'danre-vcard',
        suffix: 'v2.0.6',
        precache: 'precache',
        runtime: 'runtime',
    })

    workbox.navigationPreload.enable()

    // provide revision information for each asset to allow Workbox to properly manage updates.
    const PRECACHE_ASSETS = [
        { url: './', revision: '2.0.6' }, // alias for index.html
        { url: './index.html', revision: '2.0.6' },
        { url: './style.css', revision: '2.0.6' },
        { url: './index.mjs', revision: '2.0.6' },
        { url: './haptics.js', revision: '2.0.6' },
        { url: './confetti.min.js', revision: '2.0.6' },
        { url: './waving.webp', revision: '2.0.6' },
        { url: './manifest.json', revision: '2.0.6' },
        { url: '../img/qr.webp', revision: '2.0.6' },
    ]

    workbox.precaching.precacheAndRoute(PRECACHE_ASSETS)

    // strategy 1: network first for navigation requests (HTML pages)
    // using NetworkFirst strategy directly lets Workbox handle preloadResponse internally
    workbox.routing.registerRoute(
        new workbox.routing.NavigationRoute(
            new workbox.strategies.NetworkFirst({
                cacheName: 'danre-vcard-runtime-html',
            })
        )
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
