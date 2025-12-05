const CACHE_NAME = "sistem-pabrik-v1.2";
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
  "js/common.js",
  "manifest.json",
  "logo NFJ.webp",
  "pengecekan.webp",
  "pengemasan.webp",
  "penyimpanan.webp",
  "perakitan.webp",
];

self.addEventListener("install", function (event) {
  // Use a tolerant install: try to cache local resources, but don't
  // fail the install if some items fail to fetch (e.g. network reset).
  event.waitUntil(
    (async function () {
      const cache = await caches.open(CACHE_NAME);
      // Use Promise.allSettled so one failing request doesn't fail the whole install
      const results = await Promise.allSettled(
        urlsToCache.map((url) => cache.add(url))
      );

      // Optionally log failures for debugging
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.warn("SW: cache failed for", urlsToCache[i], r.reason);
        }
      });
      return;
    })()
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
