function reducedMotionEnabled() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
}

function animateScore(element) {
  const target = Number(element.dataset.scoreTarget);
  if (!Number.isFinite(target) || reducedMotionEnabled()) {
    element.textContent = Number.isFinite(target) ? String(target) : element.textContent;
    return;
  }

  const duration = 900;
  const startedAt = performance.now();
  const start = 0;

  function tick(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(start + (target - start) * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function activateResultsHero(root = document) {
  root.querySelectorAll?.('[data-score-animate="true"]:not([data-score-animated])').forEach(element => {
    element.dataset.scoreAnimated = "true";
    animateScore(element);
  });
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(() => activateResultsHero(app))).observe(app, {
      childList: true,
      subtree: true,
    });
  }
  window.addEventListener("pageshow", () => activateResultsHero(document));
  activateResultsHero(document);
}
