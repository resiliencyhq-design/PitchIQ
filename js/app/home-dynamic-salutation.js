const HOME_GREETING_SELECTOR = ".home-greeting > span";

export function homeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

export function applyHomeDynamicSalutation(root = document, date = new Date()) {
  const greeting = root.querySelector?.(HOME_GREETING_SELECTOR);
  if (!greeting) return false;
  greeting.textContent = `${homeGreeting(date)},`;
  return true;
}

function refreshGreeting() {
  applyHomeDynamicSalutation(document, new Date());
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(refreshGreeting)).observe(app, {
      childList: true,
      subtree: false,
    });
  }

  window.addEventListener("pageshow", refreshGreeting);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshGreeting();
  });

  refreshGreeting();
}
