const CACHE="pitchiq-sprint-5-5-player-compact";
const ASSETS=["./","./index.html","./css/style.css","./css/tokens.css","./js/app/main.js","./js/app/routes.js","./js/app/uxScreens.js","./assets/brand/logo.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("./index.html")))));
