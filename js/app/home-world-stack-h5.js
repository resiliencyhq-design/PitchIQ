const HOME_SELECTOR = "#home";
const ACTIONS_SELECTOR = ".home-actions-grid";

function setCopy(button, icon, title, description, world) {
  if (!button) return;
  button.classList.add("home-world-card");
  button.dataset.homeWorld = world;
  const iconNode = button.querySelector("b");
  const titleNode = button.querySelector("span");
  const descriptionNode = button.querySelector("small");
  if (iconNode) iconNode.textContent = icon;
  if (titleNode) titleNode.textContent = title;
  if (descriptionNode) descriptionNode.textContent = description;
}

export function applyHomeWorldStack(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!home || !actions) return false;

  actions.classList.add("home-world-stack");
  actions.setAttribute("aria-label", "PitchIQ training worlds");

  const training = actions.querySelector('[data-route="training"]');
  const results = actions.querySelector('[data-route="results"]');
  const player = actions.querySelector('[data-route="player"], [data-home-world="lab"]');

  setCopy(training, "⚽", "Technical Training", "Build touch, control and ball mastery", "technical-training");
  setCopy(results, "▮▮▮", "Results", "Track progress and review your latest rep", "results");

  if (player) {
    player.removeAttribute("data-route");
    player.dataset.homeLabRoute = "lab-juggling";
    setCopy(player, "⚗", "PitchIQ Lab", "Try experimental tools and camera features", "lab");
  }

  return true;
}

function refreshWorldStack() {
  applyHomeWorldStack(document);
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const lab = event.target.closest?.('[data-home-lab-route="lab-juggling"]');
    if (!lab) return;
    event.preventDefault();
    window.location.hash = "lab-juggling";
  });
  window.addEventListener("pageshow", refreshWorldStack);
  refreshWorldStack();
}
