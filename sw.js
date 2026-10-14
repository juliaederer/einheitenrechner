const CACHE_NAME = "einheitenrechner-v7";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept") &&
      request.headers.get("accept").includes("text/html"))
  ) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then(cached => cached || caches.match("./"));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
