importScripts('./workbox-sw.js', './precache-manifest.js')

if (workbox) {
    console.info('yay! workbox is loaded ૮ • ᴥ • ა')

    workbox.core.setCacheNameDetails({
        prefix: 'danre-vcard',
        suffix: 'vcard',
        precache: 'precache',
        runtime: 'runtime',
    })

    const precacheAssets = self.__VCARD_PRECACHE_MANIFEST || []

    workbox.precaching.cleanupOutdatedCaches()
    workbox.precaching.precacheAndRoute(precacheAssets)

    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
    })

    self.addEventListener('activate', (event) => {
        event.waitUntil(self.clients.claim())
    })
} else {
    console.warn("boo! workbox didn't load ⊙︿⊙")
}
