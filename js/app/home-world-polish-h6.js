const HOME_SELECTOR = "#home";
const STACK_SELECTOR = ".home-content-stack";

function moveBefore(node, reference) {
  if (!node || !reference || node === reference || node.nextElementSibling === reference) return false;
  reference.before(node);
  return true;
}

export function applyHomeWorldPolish(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const stack = home?.querySelector?.(STACK_SELECTOR);
  if (!home || !stack) return false;

  const worldStack = stack.querySelector(".home-actions-grid.home-world-quad-grid");
  const supporting = stack.querySelector(".home-secondary-row");
  const weeklyProgress = home.querySelector('[data-academy-season="true"]');

  if (worldStack) worldStack.dataset.homeSlot = "four-world-hub";

  if (weeklyProgress && supporting) {
    weeklyProgress.dataset.homeSlot = "weekly-academy-progress";
    moveBefore(weeklyProgress, supporting);
  }

  home.querySelectorAll(".home-trial-entry, .auto-juggler-home-card").forEach(entry => {
    entry.dataset.homeDuplicateLabEntry = "true";
    entry.setAttribute("aria-hidden", "true");
    entry.tabIndex = -1;
  });

  if (worldStack) home.dataset.homeComposition = "h16-four-worlds";
  return true;
}

function refreshHomeWorldPolish() {
  applyHomeWorldPolish(document);
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(refreshHomeWorldPolish)).observe(app, {
      childList: true,
      subtree: true,
    });
  }
  window.addEventListener("pageshow", refreshHomeWorldPolish);
  refreshHomeWorldPolish();
}
