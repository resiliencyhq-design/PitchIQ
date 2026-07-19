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

  const worldStack = stack.querySelector(".home-actions-grid.home-world-stack");
  const supporting = stack.querySelector(".home-secondary-row");
  const weeklyProgress = home.querySelector('[data-academy-season="true"]');

  if (worldStack) worldStack.dataset.homeSlot = "world-stack-polished";

  // Promote the existing weekly Academy card without recreating its state or markup.
  if (weeklyProgress && supporting) {
    weeklyProgress.dataset.homeSlot = "weekly-academy-progress";
    moveBefore(weeklyProgress, supporting);
  }

  // The dedicated world card is the single Home Lab entry. Legacy entries remain
  // owned by their original controllers and are suppressed by scoped H6 CSS.
  home.querySelectorAll(".home-trial-entry, .auto-juggler-home-card").forEach(entry => {
    entry.dataset.homeDuplicateLabEntry = "true";
    entry.setAttribute("aria-hidden", "true");
    entry.tabIndex = -1;
  });

  home.dataset.homeComposition = "h6";
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
