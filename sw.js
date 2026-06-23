const CACHE="pitchiq-hero-bg-75-20260623";
const ASSETS=[
  "./",
  "./index.html",
  "./css/style.css?v=hero-bg-75-20260623",
  "./css/splash-fit.css?v=hero-bg-75-20260623",
  "./css/onboarding-fix.css?v=hero-bg-75-20260623",
  "./css/academy-hero-asset.css?v=hero-bg-75-20260623",
  "./css/visual-layout-studio.css?v=hero-bg-75-20260623",
  "./js/app/main.js?v=hero-bg-75-20260623",
  "./js/app/routes.js?v=hero-bg-75-20260623",
  "./js/dev/visual-layout-studio.js?v=hero-bg-75-20260623",
  "./js/dev/dev-floating-panels.js?v=hero-bg-75-20260623",
  "./assets/controls/your-name.png?v=hero-bg-75-20260623",
  "./assets/controls/continue-button.png?v=hero-bg-75-20260623",
  "./assets/controls/enter-academy.png?v=hero-bg-75-20260623",
  "./assets/brand/logo.svg",
  "./assets/brand/welltrack-performance-logo.png?v=hero-bg-75-20260623",
  "./assets/onboarding/position-marker-grey.png",
  "./assets/onboarding/position-marker-active.png",
  "./assets/onboarding/position-pitch.png?v=hero-bg-75-20260623",
  "./assets/onboarding/position-pitch-inactive.png?v=hero-bg-75-20260623",
  "./assets/onboarding/position-pitch-active.png?v=hero-bg-75-20260623",
  "./assets/onboarding/name-person-icon.png?v=hero-bg-75-20260623",
  "./assets/backgrounds/onboarding-background.png?v=hero-bg-75-20260623",
  "./assets/Home/hero-home-bg.png?v=hero-bg-75-20260623",
  "./assets/Home/player-profile-card-skin.png?v=hero-bg-75-20260623",
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
