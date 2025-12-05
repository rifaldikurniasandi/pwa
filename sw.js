const CACHE_NAME = "sistem-pabrik-v1.2";
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
  "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
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
