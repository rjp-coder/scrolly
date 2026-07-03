// __SW_CACHE_VERSION__ is replaced at build time by Vite's `define` option,
// so every new build gets a unique cache key and old caches are pruned.
const CACHE = typeof __SW_CACHE_VERSION__ !== 'undefined'
  ? __SW_CACHE_VERSION__
  : 'lyric-scroller-dev'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './index.html']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) return

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()))
          return res
        })
        .catch(() => caches.match('./index.html'))
    )
  } else {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            caches.open(CACHE).then((c) => c.put(request, res.clone()))
            return res
          })
      )
    )
  }
})
