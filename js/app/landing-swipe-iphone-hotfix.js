/* Sprint 9.1 hotfix — reliable iPhone Safari landing progression.
   main.js remains the primary owner of the landing interaction. This module:
   1. translates a valid native touch swipe into the existing accepted click path;
   2. watches for the visible completed state; and
   3. retries the same in-memory landing action only while splash remains visible. */

const SWIPE_SELECTOR = "[data-splash-swipe]";
const MIN_DISTANCE = 72;
const MIN_RATIO = 0.42;
const RECOVERY_DELAY_MS = 900;

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
        activateExistingLanding(swipe);
      }
    }, RECOVERY_DELAY_MS);
  };

  new MutationObserver(armRecovery).observe(swipe, {
    attributes: true,
    attributeFilter: ["class", "style"]
  });

  swipe.addEventListener("pointerup", armRecovery, { passive: true });
  swipe.addEventListener("click", armRecovery, { passive: true });
  swipe.addEventListener("keydown", armRecovery);

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
    activateExistingLanding(swipe);
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
