<<<<<<< HEAD
const CACHE="pitchiq-asset-reliability-v20260618";
const ASSETS=[
  "./",
  "./index.html",
  "./css/style.css?v=asset-audit-20260618",
  "./css/splash-fit.css?v=asset-audit-20260618",
  "./css/onboarding-fix.css?v=asset-audit-20260618",
  "./css/academy-hero-asset.css?v=asset-audit-20260618",
  "./css/visual-layout-studio.css?v=asset-audit-20260618",
  "./js/app/main.js?v=asset-audit-20260618",
  "./js/app/routes.js?v=asset-audit-20260618",
  "./assets/brand/logo.svg",
  "./assets/brand/welltrack-performance-logo.png",
  "./assets/onboarding/position-marker-grey.png",
  "./assets/onboarding/position-marker-active.png",
  "./assets/controls/swipe-bar.png",
  "./assets/controls/swipe-ball.png",
  "./assets/backgrounds/splash-poster.png"
];
=======
const CACHE="pitchiq-live-rep-cue-simplification-v2";
const ASSETS=["./","./index.html","./css/style.css","./css/tokens.css","./js/app/main.js","./js/app/routes.js","./js/app/uxScreens.js","./assets/brand/logo.svg"];
>>>>>>> 7f65d71 (Improve asset cache reliability for splash and onboarding)

self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));

self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
<<<<<<< HEAD

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const url=new URL(e.request.url);
  const live=/\.(?:html|css|js|png|svg|jpg|jpeg|webp)$/i.test(url.pathname)||url.pathname.endsWith("/");
  if(live){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
=======
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  const live=/\.(?:html|css|js)$/i.test(url.pathname)||url.pathname.endsWith("/");
  const image=/\.(?:png|jpe?g|webp|svg)$/i.test(url.pathname);
  if(live||image){
    e.respondWith(fetch(e.request).then(r=>{
>>>>>>> 7f65d71 (Improve asset cache reliability for splash and onboarding)
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("./index.html"))));
});
