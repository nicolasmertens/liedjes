// Network-first for HTML so updates are picked up automatically on next visit;
// cache-first for static assets (icons, manifest) for instant load.
// MP3s from standaarduitgeverij.be are NOT cached (cross-origin, large).

const CACHE = "liedjes-v1";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon-32.png",
  "./icons/colors.json",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Don't intercept anything off-origin (MP3s on standaarduitgeverij.be)
  if (url.origin !== self.location.origin) return;

  const isHTML =
    e.request.mode === "navigate" ||
    e.request.destination === "document" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith(".html");

  if (isHTML) {
    // Network-first: always try fresh, fall back to cache offline
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match("./")))
    );
    return;
  }

  // Cache-first for static assets, but refresh in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchAndCache = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchAndCache;
    })
  );
});
