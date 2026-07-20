/* iPhone Safari landing recovery.
   main.js remains the normal pointer/keyboard owner. This module provides a
   complete native-touch path when Safari does not deliver the pointer drag
   sequence reliably, then guarantees that a completed swipe reaches onboarding. */

const SWIPE_SELECTOR = "[data-splash-swipe]";
const COMPLETE_THRESHOLD = 0.82;
const DIRECT_ROUTE_DELAY_MS = 450;

function isLandingVisible() {
  return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]"));
}

function activateExistingLanding(swipe) {
  if (!swipe || !isLandingVisible()) return;
  swipe.dispatchEvent(new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 1
  }));
}

function advanceToOnboardingFallback() {
  if (!isLandingVisible()) return;
  const url = new URL(window.location.href);
  url.searchParams.set("dev", "1");
  url.searchParams.set("autoOnboard", "1");
  url.searchParams.set("v", "landing-completion-race-fix-20260720");
  url.hash = "onboard";
  window.location.replace(url.toString());
}

function bindLandingFallback() {
  const swipe = document.querySelector(SWIPE_SELECTOR);
  const track = swipe?.querySelector(".splash-swipe-track");
  const handle = swipe?.querySelector(".splash-swipe-handle");
  if (!swipe || !track || !handle || swipe.dataset.iphoneTouchFallback === "true") return;
  swipe.dataset.iphoneTouchFallback = "true";

  let startX = 0;
  let startY = 0;
  let tracking = false;
  let progress = 0;
  let directRouteTimer = null;

  const metrics = () => {
    const trackRect = track.getBoundingClientRect();
    const handleRect = handle.getBoundingClientRect();
    const startOffset = Math.max(0, handleRect.left - trackRect.left);
    const rightPadding = Math.max(6, startOffset);
    return {
      maxTravel: Math.max(1, trackRect.width - handleRect.width - startOffset - rightPadding)
    };
  };

  const setProgress = value => {
    progress = Math.max(0, Math.min(1, value));
    const maxTravel = metrics().maxTravel;
    swipe.style.setProperty("--swipe-progress", String(progress));
    swipe.style.setProperty("--swipe-reveal", `${progress * 100}%`);
    swipe.style.setProperty("--swipe-x", `${maxTravel * progress}px`);
    swipe.style.setProperty("--swipe-rotate", `${360 * progress}deg`);
  };

  const reset = () => {
    tracking = false;
    swipe.classList.remove("dragging");
    if (!swipe.classList.contains("complete")) setProgress(0);
  };

  const requestAdvance = () => {
    if (!isLandingVisible()) return;
    activateExistingLanding(swipe);
    window.clearTimeout(directRouteTimer);
    directRouteTimer = window.setTimeout(() => {
      if (isLandingVisible()) advanceToOnboardingFallback();
    }, DIRECT_ROUTE_DELAY_MS);
  };

  const complete = () => {
    tracking = false;
    setProgress(1);
    swipe.classList.remove("dragging");
    swipe.classList.add("complete");
    requestAdvance();
  };

  new MutationObserver(() => {
    if (swipe.classList.contains("complete") && isLandingVisible()) requestAdvance();
  }).observe(swipe, {
    attributes: true,
    attributeFilter: ["class"]
  });

  swipe.addEventListener("pointerup", () => {
    if (swipe.classList.contains("complete")) requestAdvance();
  }, { passive: true });

  swipe.addEventListener("click", () => {
    if (swipe.classList.contains("complete")) requestAdvance();
  }, { passive: true });

  swipe.addEventListener("keydown", () => {
    if (swipe.classList.contains("complete")) requestAdvance();
  });

  swipe.addEventListener("touchstart", event => {
    const touch = event.touches?.[0];
    if (!touch || swipe.classList.contains("complete")) return;
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
    swipe.classList.add("dragging");
    setProgress(0);
  }, { passive: true });

  swipe.addEventListener("touchmove", event => {
    if (!tracking) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = Math.abs(touch.clientY - startY);
    if (dx > 4 && dx > dy) event.preventDefault();
    setProgress(dx / metrics().maxTravel);
  }, { passive: false });

  swipe.addEventListener("touchend", event => {
    if (!tracking) {
      if (swipe.classList.contains("complete")) requestAdvance();
      return;
    }
    const touch = event.changedTouches?.[0];
    if (touch) setProgress((touch.clientX - startX) / metrics().maxTravel);
    event.preventDefault();
    progress >= COMPLETE_THRESHOLD || swipe.classList.contains("complete") ? complete() : reset();
  }, { passive: false });

  swipe.addEventListener("touchcancel", reset, { passive: true });
}

function initialise() {
  bindLandingFallback();
  const app = document.getElementById("app");
  if (app) new MutationObserver(bindLandingFallback).observe(app, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialise, { once: true });
} else {
  initialise();
}
