const CACHE = "arcadia-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./gallery.html",
  "./submit.html",
  "./about.html",
  "./accessibility.html",
  "./references.html",
  "./manifest.webmanifest",
  "./assets/styles/base.css",
  "./assets/styles/layout.css",
  "./assets/styles/components.css",
  "./assets/styles/theme.css",
  "./assets/js/app.js",
  "./assets/js/data.js",
  "./assets/js/gallery.js",
  "./assets/js/submit.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match("./index.html")))
  );
});