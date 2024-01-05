const originalUrl = "https://svc.streame.cloud"

self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()))
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("mediasegment")) {
    event.respondWith(
      (async (request) => {
        try {
          const res = await fetch(request.url)
          return res
        } catch (error) {
          const { pathname, search } = new URL(request.url)
          return fetch(originalUrl + pathname + search)
        }
      })(event.request)
    )
  }
})
