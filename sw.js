const CACHE="pitchiq-onboarding-tag-independent-type-20260714";
const ASSETS=[
  "./",
  "./index.html",
  "./css/style.css?v=onboarding-architecture-lock-20260628",
  "./css/onboard-step1-lock.css?v=step1-mvp-locked-20260628",
  "./css/onboard-step2-lock.css?v=step2-preferred-position-prompt-20260703",
  "./css/onboard-step2-tactical-web.css?v=step2-selected-only-web-20260703",
  "./css/splash-fit.css?v=logo-down-20260628",
  "./css/onboarding-fix.css?v=hero-bg-top-20260623",
  "./css/academy-hero-asset.css?v=hero-bg-top-20260623",
  "./css/visual-layout-studio.css?v=hero-bg-top-20260623",
  "./css/onboard-step2-spawn.css?v=step2-inactive-after-spawn-20260703",
  "./css/onboard-step2-final-polish.css?v=step2-remove-heading-overrides-20260714",
  "./css/onboard-step2-layout.css?v=step2-heading-consolidated-20260714",
  "./css/onboard-step2-marker.css?v=step2-direct-selected-puck-20260714",
  "./css/onboard-step2-web.css?v=step2-refactor-web-20260703",
  "./css/onboard-step2-animation.css?v=sprint-8-4-1-marker-consolidation-20260712",
  "./css/onboard-jersey.css?v=sprint-8-4-number-flow-fix-20260710",
  "./css/onboard-number.css?v=sprint-8-3-4-hero-jersey-20260711",
  "./css/onboard-typography-lock.css?v=onboarding-tag-independent-type-20260714",
  "./css/onboard-step3-layout.css?v=step3-centred-layout-20260713",
  "./js/app/main.js?v=step2-refactor-phase1-20260703",
  "./js/app/onboard-jersey.js?v=sprint-8-4-number-flow-fix-20260710",
  "./js/app/onboard-number.js?v=sprint-8-3-2-iphone-wheel-20260710",
  "./js/app/onboard-step2-spawn.js?v=step2-direct-selected-puck-20260714",
  "./js/app/onboard-haptics.js?v=step2-haptics-20260702",
  "./js/app/onboard-tactical-web.js?v=sprint-8-4-1-marker-consolidation-20260712",
  "./js/dev/visual-layout-studio.js?v=hero-bg-top-20260623",
  "./js/dev/dev-floating-panels.js?v=hero-bg-top-20260623",
  "./assets/onboarding/jersey-back.png?v=sprint-8-4-number-flow-fix-20260710",
  "./assets/onboarding/jersey-glow.png?v=sprint-8-4-number-flow-fix-20260710",
  "./assets/onboarding/jersey-shadow.png?v=sprint-8-4-number-flow-fix-20260710",
  "./assets/controls/your-name.png?v=hero-bg-top-20260623",
  "./assets/controls/continue-button.png?v=hero-bg-top-20260623",
  "./assets/controls/enter-academy.png?v=hero-bg-top-20260623",
  "./assets/brand/logo.svg",
  "./assets/brand/welltrack-performance-logo.png?v=hero-bg-top-20260623",
  "./assets/onboarding/position-marker-grey.png",
  "./assets/onboarding/position-marker-active.png?v=direct-selected-puck-20260714",
  "./assets/onboarding/position-pitch.png?v=hero-bg-top-20260623",
  "./assets/onboarding/position-pitch-inactive.png?v=hero-bg-top-20260623",
  "./assets/onboarding/position-pitch-active.png?v=hero-bg-top-20260623",
  "./assets/backgrounds/onboarding-background-V1.png?v=20260627-v2",
  "./assets/Home/hero-home-bg.png?v=hero-bg-top-20260623",
  "./assets/Home/player-profile-card-skin.png?v=hero-bg-top-20260623",
  "./assets/controls/swipe-bar.png",
  "./assets/controls/swipe-ball.png",
  "./assets/backgrounds/splash-poster.png"
];

self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE)
    .then(cache=>cache.addAll(ASSETS))
    .then(()=>self.skipWaiting())
));

self.addEventListener("activate",event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;

  const url=new URL(event.request.url);
  const live=/\.(?:html|css|js|png|svg|jpg|jpeg|webp)$/i.test(url.pathname)||url.pathname.endsWith("/");

  if(live){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request).then(response=>response||caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response=>response||fetch(event.request).catch(()=>caches.match("./index.html")))
  );
});