/* OFFSHORE OS · service worker — the app shell lives on the device.
   Network-first so updates always win; cache fallback keeps it opening offline. */
const CACHE = "offshore-os-v19";
const SHELL = ["./", "./index.html", "./core.css?v=4", "./config.js?v=14", "./bus.js?v=3",
  "./mod-home.js?v=8", "./mod-roundtable.js?v=4", "./mod-claude.js?v=5", "./mod-livemind.js?v=7",
  "./mod-botlab.js?v=2", "./mod-academy.js?v=3", "./mod-clients.js?v=4", "./mod-agency.js?v=5",
  "./mod-agents.js?v=3", "./mod-showcase.js?v=2", "./boot.js?v=13", "./fx.js?v=8", "./manifest.json", "./icon.svg", "./icon-maskable.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: false }).then(m => m || caches.match("./index.html")))
  );
});
