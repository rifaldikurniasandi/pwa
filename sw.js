const CACHE_NAME = "sistem-pabrik-v1.4";

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
  "js/form-handler.js",
  "js/form-config.js",
  "js/data-fetcher.js",
  "manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    (async function () {
      const cache = await caches.open(CACHE_NAME);
      const results = await Promise.allSettled(
        urlsToCache.map((url) => cache.add(url)),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn("SW: cache failed for", urlsToCache[index], result.reason);
        }
      });

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("fetch", function (event) {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.hostname.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  if (requestUrl.pathname.endsWith("/js/config.js")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response;

      return fetch(event.request).catch(() => {
        if (event.request.destination === "document") {
          return caches.match("index.html");
        }
        return undefined;
      });
    }),
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return false;
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
