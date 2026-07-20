/* iPhone Safari landing input bridge.
 * main.js owns completion and routing through PitchIQApp.enterFromLanding().
 * This module only recognises a valid native touch swipe when pointer events
 * are incomplete, then calls that direct application API.
 */

const SWIPE_SELECTOR = "[data-splash-swipe]";
const MIN_DISTANCE = 72;
const MIN_RATIO = 0.42;
const RECOVERY_DELAY_MS = 900;

function isLandingVisible() {
  return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]"));
}

function activatePrimaryLandingController() {
  if (!isLandingVisible()) return;
  const enterFromLanding = window.PitchIQApp?.enterFromLanding;
  if (typeof enterFromLanding === "function") {
    enterFromLanding();
  } else {
    console.error("[PitchIQ iPhone landing] Direct app router API is unavailable.");
  }
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
        activatePrimaryLandingController();
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
