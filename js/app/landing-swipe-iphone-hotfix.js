/* iPhone Safari landing input bridge.
 * main.js owns completion and routing through PitchIQApp.enterFromLanding().
 * This module recognises native touch completion and, critically, calls the
 * direct application router synchronously from the same pointer/touch event.
 */

const SWIPE_SELECTOR = "[data-splash-swipe]";
const MIN_DISTANCE = 72;
const MIN_RATIO = 0.42;
const RECOVERY_DELAY_MS = 900;

function isLandingVisible() {
  return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]"));
}

function swipeProgress(swipe) {
  if (!swipe) return 0;
  if (swipe.classList.contains("complete")) return 1;
  const value = Number.parseFloat(getComputedStyle(swipe).getPropertyValue("--swipe-progress"));
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function activatePrimaryLandingController() {
  if (!isLandingVisible()) return false;
  const enterFromLanding = window.PitchIQApp?.enterFromLanding;
  if (typeof enterFromLanding === "function") {
    enterFromLanding();
    return true;
  }
  console.error("[PitchIQ iPhone landing] Direct app router API is unavailable.");
  return false;
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
      if (swipeProgress(swipe) >= 0.82 && isLandingVisible()) {
        activatePrimaryLandingController();
      }
    }, RECOVERY_DELAY_MS);
  };

  new MutationObserver(armRecovery).observe(swipe, {
    attributes: true,
    attributeFilter: ["class", "style"]
  });

  /* main.js registers first. By the time this listener runs, a successful
   * pointerup has already applied .complete. Route immediately in this same
   * event instead of depending on an iOS timer callback. */
  swipe.addEventListener("pointerup", () => {
    if (swipeProgress(swipe) >= 0.82) activatePrimaryLandingController();
    else armRecovery();
  }, { passive: true });

  swipe.addEventListener("touchstart", event => {
    const touch = event.touches?.[0];
    if (!touch) return;
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
  }, { passive: true });

  swipe.addEventListener("touchend", event => {
    /* Pointer handling may already have marked the swipe complete. Do not
     * return in that state: this is the synchronous iPhone route opportunity. */
    if (swipeProgress(swipe) >= 0.82) {
      tracking = false;
      activatePrimaryLandingController();
      return;
    }
    if (!tracking) return;

    tracking = false;
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = Math.abs(touch.clientY - startY);
    const width = Math.max(1, swipe.getBoundingClientRect().width);
    const completed = dx >= Math.max(MIN_DISTANCE, width * MIN_RATIO) && dx > dy * 1.35;
    if (!completed) return;

    event.preventDefault();
    activatePrimaryLandingController();
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
