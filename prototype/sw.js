// SPDX-License-Identifier: AGPL-3.0-only
const CACHE = "eudila-shell-v8";
const FILES = ["./", "./index.html", "./ayuda.html", "./help.js", "./style.css", "./app.js", "./config.js", "./catalog.js", "./flow-state.js", "./moods.js", "./fonts/Figtree.ttf", "../shared/visual/tokens.css", "../shared/visual/actions.css", "../shared/visual/orb.css", "../shared/visual/moods.js", "../shared/visual/orb.js", "../shared/visual/motion.js", "../shared/visual/controller.js", "../shared/visual/intro.js"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
