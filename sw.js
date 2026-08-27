/* OFFSHORE OS · service worker — the app shell lives on the device.
   Network-first so updates always win; cache fallback keeps it opening offline. */
const CACHE = "offshore-os-v27";
const SHELL = ["./", "./index.html", "./core.css?v=4", "./config.js?v=16", "./bus.js?v=4",
  "./mod-home.js?v=9", "./mod-roundtable.js?v=6", "./mod-claude.js?v=7", "./mod-livemind.js?v=8", "./mod-perf.js?v=2",
  "./mod-botlab.js?v=3", "./mod-academy.js?v=4", "./mod-clients.js?v=5", "./mod-agency.js?v=5",
  "./mod-agents.js?v=3", "./mod-showcase.js?v=3", "./boot.js?v=15", "./fx.js?v=9", "./manifest.json", "./icon.svg", "./icon-maskable.svg"];

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
