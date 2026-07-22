const CACHE_NAME = 'bjj-timer-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      try {
        const response = await fetch(event.request)
        if (response.ok) cache.put(event.request, response.clone())
        return response
      } catch (err) {
        const cached = await cache.match(event.request)
        if (cached) return cached
        throw err
      }
    })()
  )
})
