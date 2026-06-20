const CACHE="pitchiq-step1-lower-controls-up-20260620";
const ASSETS=[
  "./",
  "./index.html",
  "./css/style.css?v=861bbe4",
  "./css/splash-fit.css?v=landing-title-spacing-20260620",
  "./css/onboarding-fix.css?v=step1-lower-controls-up-20260620",
  "./css/academy-hero-asset.css?v=asset-audit-20260618",
  "./css/visual-layout-studio.css?v=asset-audit-20260618",
  "./js/app/main.js?v=landing-logo-crop-20260620",
  "./js/app/routes.js?v=landing-logo-crop-20260620",
  "./assets/controls/your-name.png?v=861bbe23",
  "./assets/controls/continue-button.png?v=861bbe23",
  "./assets/controls/enter-academy.png?v=861bbe23",
  "./assets/brand/logo.svg",
  "./assets/brand/welltrack-performance-logo.png?v=landing-logo-crop-20260620",
  "./assets/onboarding/position-marker-grey.png",
  "./assets/onboarding/position-marker-active.png",
  "./assets/onboarding/name-person-icon.png?v=861bbe24",
  "./assets/backgrounds/onboarding-background.png?v=861bbe23",
  "./assets/controls/swipe-bar.png",
  "./assets/controls/swipe-ball.png",
  "./assets/backgrounds/splash-poster.png"
];

self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const url=new URL(e.request.url);
  const live=/\.(?:html|css|js|png|svg|jpg|jpeg|webp)$/i.test(url.pathname)||url.pathname.endsWith("/");
  if(live){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("./index.html"))));
});
