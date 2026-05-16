// Network-first for HTML so updates are picked up automatically on next visit;
// cache-first for static assets (icons, manifest). MP3s under ./audio/ are
// same-origin so the default same-origin branch caches them after the page
// sends a "prefetch-mp3s" message.

const CORE_CACHE = "rhymes-v4";
const MP3_CACHE  = "rhymes-mp3-v4";

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon-32.png",
  "./popularity.json",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CORE_CACHE).then(c => c.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CORE_CACHE && k !== MP3_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Anything off-origin: passthrough
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
          caches.open(CORE_CACHE).then(c => c.put(e.request, copy)).catch(() => {});
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
          caches.open(CORE_CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchAndCache;
    })
  );
});

// --- Prefetch protocol ---
// Page sends: { type: "prefetch-mp3s", urls: [<relative or absolute mp3 url>, ...] }
// SW fetches each URL sequentially and stores it in MP3_CACHE.
// Sends progress back: { type: "prefetch-progress", done, total }
// At end: { type: "prefetch-done", cached, total }

let prefetching = false;

self.addEventListener("message", async e => {
  const msg = e.data;
  if (!msg || msg.type !== "prefetch-mp3s" || !Array.isArray(msg.urls)) return;
  if (prefetching) return;
  prefetching = true;

  const cache = await caches.open(MP3_CACHE);
  const total = msg.urls.length;
  let done = 0, cached = 0;

  const post = (payload) => {
    if (e.source) e.source.postMessage(payload);
  };

  for (const u of msg.urls) {
    try {
      const req = new Request(u, { mode: "no-cors", credentials: "omit" });
      const existing = await cache.match(req, { ignoreVary: true });
      if (!existing) {
        const resp = await fetch(req);
        await cache.put(req, resp);
        cached++;
      } else {
        cached++;
      }
    } catch (err) {
      // Continue on failure — next song may still cache fine.
    }
    done++;
    post({ type: "prefetch-progress", done, total });
  }

  prefetching = false;
  post({ type: "prefetch-done", cached, total });
});
