importScripts('./workbox-sw.js', './precache-manifest.js')

if (workbox) {
  console.info('yay! workbox is loaded ૮ • ᴥ • ა')

  workbox.core.setCacheNameDetails({
    prefix: 'danre-vcard',
    suffix: 'vcard',
    precache: 'precache',
    runtime: 'runtime'
  })

  workbox.precaching.cleanupOutdatedCaches()
  workbox.precaching.precacheAndRoute(self.__VCARD_PRECACHE_MANIFEST || [])

  self.addEventListener('message', e => {
    if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
  })

  self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
} else {
  console.warn("boo! workbox didn't load ⊙︿⊙")
}
