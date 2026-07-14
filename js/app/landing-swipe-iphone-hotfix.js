/* Sprint 9.1 hotfix — reliable iPhone Safari landing swipe fallback.
   The primary landing control remains owned by main.js. This module only
   translates native touch gestures into the existing keyboard activation path
   when Pointer Events do not complete reliably on iOS Safari/PWA. */

const SWIPE_SELECTOR = "[data-splash-swipe]";
const MIN_DISTANCE = 72;
const MIN_RATIO = 0.42;

function bindTouchFallback() {
  const swipe = document.querySelector(SWIPE_SELECTOR);
  if (!swipe || swipe.dataset.iphoneTouchFallback === "true") return;

  swipe.dataset.iphoneTouchFallback = "true";
  let startX = 0;
  let startY = 0;
  let tracking = false;

  swipe.addEventListener("touchstart", event => {
    const touch = event.touches?.[0];
    if (!touch || swipe.classList.contains("complete")) return;
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
  }, { passive: true });

  swipe.addEventListener("touchend", event => {
    if (!tracking || swipe.classList.contains("complete")) return;
    tracking = false;
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const dx = touch.clientX - startX;
    const dy = Math.abs(touch.clientY - startY);
    const width = Math.max(1, swipe.getBoundingClientRect().width);
    const completed = dx >= Math.max(MIN_DISTANCE, width * MIN_RATIO) && dx > dy * 1.35;
    if (!completed) return;

    event.preventDefault();
    swipe.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true
    }));
  }, { passive: false });
}

function initialise() {
  bindTouchFallback();
  const app = document.getElementById("app");
  if (app) new MutationObserver(bindTouchFallback).observe(app, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialise, { once: true });
} else {
  initialise();
}
