/* iPhone Safari landing input bridge.
   main.js remains the single owner of completion and routing. This module only:
   1. recognises a valid native touch swipe when pointer events are incomplete;
   2. forwards that gesture to the swipe element's existing Enter handler; and
   3. retries the same in-memory handler only while the completed splash remains visible. */

const SWIPE_SELECTOR = "[data-splash-swipe]";
const MIN_DISTANCE = 72;
const MIN_RATIO = 0.42;
const RECOVERY_DELAY_MS = 900;

function isLandingVisible() {
  return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]"));
}

function activatePrimaryLandingController(swipe) {
  if (!swipe || !isLandingVisible()) return;
  swipe.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    bubbles: true,
    cancelable: true
  }));
}

function bindLandingFallback() {
  const swipe = document.querySelector(SWIPE_SELECTOR);
  if (!swipe || swipe.dataset.iphoneTouchFallback === "true") return;
  swipe.dataset.iphoneTouchFallback = "true";

  let startX = 0;
  let startY = 0;
  let tracking = false;
  let recoveryTimer = null;

  const armRecovery = () => {
    window.clearTimeout(recoveryTimer);
    recoveryTimer = window.setTimeout(() => {
      if (swipe.classList.contains("complete") && isLandingVisible()) {
        activatePrimaryLandingController(swipe);
      }
    }, RECOVERY_DELAY_MS);
  };

  new MutationObserver(armRecovery).observe(swipe, {
    attributes: true,
    attributeFilter: ["class", "style"]
  });

  swipe.addEventListener("pointerup", armRecovery, { passive: true });

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
    activatePrimaryLandingController(swipe);
    armRecovery();
  }, { passive: false });
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
