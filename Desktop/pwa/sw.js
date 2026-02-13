const CACHE_NAME = "sistem-pabrik-v1.3";
// Only cache local app assets. Avoid caching external CDNs which can
// fail on some mobile networks and cause the service worker install
// to fail (manifested as ERR_CONNECTION_RESET on some devices).
const urlsToCache = [
  "./",
  "index.html",
  "form.html",
  "bank_data.html",
  "stok_barang.html",
  "form_borongan.html",
  "form_injectbusa.html",
  "form_kardus.html",
  "form_ambilbarang.html",
  "form_produksi.html",
  "form_komponen.html",
  "bankdata_borongan.html",
  "bankdata_injectbusa.html",
  "bankdata_kardus.html",
  "bankdata_ambilbarang.html",
  "bankdata_produksi.html",
  "bankdata_komponen.html",
  "js/config.js",
  "js/common.js",
  "js/index-script.js",
  "js/form-handler.js",
  "js/form-config.js",
  "js/data-fetcher.js",
  "manifest.json",
];

self.addEventListener("install", function (event) {
  // Use a tolerant install: try to cache local resources, but don't
  // fail the install if some items fail to fetch (e.g. network reset).
  event.waitUntil(
    (async function () {
      const cache = await caches.open(CACHE_NAME);
      // Use Promise.allSettled so one failing request doesn't fail the whole install
      const results = await Promise.allSettled(
        urlsToCache.map((url) => cache.add(url)),
      );

      // Optionally log failures for debugging
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.warn("SW: cache failed for", urlsToCache[i], r.reason);
        }
      });
      return;
    })(),
  );
});

self.addEventListener("fetch", function (event) {
  // Network first strategy untuk API calls (spreadsheet data)
  if (event.request.url.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Fallback ke cache jika network gagal
          return caches.match(event.request);
        }),
    );
  } else {
    // Cache first strategy untuk app assets
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Offline fallback
          if (event.request.destination === "document") {
            return caches.match("index.html");
          }
        });
      }),
    );
  }
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
