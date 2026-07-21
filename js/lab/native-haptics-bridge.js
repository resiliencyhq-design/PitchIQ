const PLUGIN_NAME = "PitchIQHaptics";
const INTENSITIES = Object.freeze({ gentle: 0.3, medium: 0.6, strong: 0.9 });
let enabled = true;
let intensity = "medium";
let nativeAvailable = false;
let originalVibrate = null;

function plugin() {
  return globalThis.Capacitor?.Plugins?.[PLUGIN_NAME] || null;
}

async function refreshCapability() {
  const nativePlugin = plugin();
  if (!nativePlugin) {
    nativeAvailable = false;
    return false;
  }
  try {
    const result = await nativePlugin.isAvailable();
    nativeAvailable = Boolean(result?.available);
  } catch (_) {
    nativeAvailable = false;
  }
  return nativeAvailable;
}

function patternMode(pattern) {
  const key = Array.isArray(pattern) ? pattern.join(",") : String(pattern || "");
  if (key === "180,820") return "calm";
  if (key === "120,180,120,580") return "focus";
  if (key === "90,110,90,110,220,580") return "reset";
  if (key === "240,1260") return "recover";
  return "calm";
}

async function nativeStart(pattern) {
  if (!enabled || !nativeAvailable) return false;
  try {
    await plugin().start({
      mode: patternMode(pattern),
      intensity: INTENSITIES[intensity],
      sharpness: intensity === "gentle" ? 0.15 : intensity === "strong" ? 0.65 : 0.35,
    });
    return true;
  } catch (_) {
    return false;
  }
}

async function nativeStop() {
  try { await plugin()?.stop(); } catch (_) {}
}

function installVibrateShim() {
  if (typeof navigator === "undefined") return;
  originalVibrate = typeof navigator.vibrate === "function" ? navigator.vibrate.bind(navigator) : null;
  try {
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value(pattern) {
        if (pattern === 0 || (Array.isArray(pattern) && pattern.length === 1 && pattern[0] === 0)) {
          nativeStop();
          return originalVibrate ? originalVibrate(0) : true;
        }
        if (nativeAvailable) {
          nativeStart(pattern);
          return true;
        }
        return enabled && originalVibrate ? originalVibrate(pattern) : false;
      },
    });
  } catch (_) {}
}

function controlsMarkup() {
  return `<section class="vibro-native-controls" data-native-haptics-controls>
    <div class="vibro-native-row"><span><strong>Haptics</strong><small>${nativeAvailable ? "Native iPhone Core Haptics" : "Web vibration or visual preview"}</small></span><button type="button" data-native-haptics-toggle aria-pressed="${enabled}">${enabled ? "ON" : "OFF"}</button></div>
    <h2>Intensity</h2>
    <div class="vibro-durations vibro-intensity-options">
      ${Object.keys(INTENSITIES).map(level => `<button type="button" data-native-haptics-intensity="${level}" class="${level === intensity ? "selected" : ""}">${level[0].toUpperCase() + level.slice(1)}</button>`).join("")}
    </div>
    <button type="button" class="vibro-secondary" data-native-haptics-test>${nativeAvailable ? "Test iPhone haptic" : "Test available feedback"}</button>
  </section>`;
}

function injectControls() {
  if (location.hash.replace(/^#/, "") !== "lab-vibro-focus") return;
  const intro = document.querySelector(".vibro-intro");
  if (!intro || intro.querySelector("[data-native-haptics-controls]")) return;
  const capability = intro.querySelector(".vibro-capability");
  capability?.insertAdjacentHTML("beforebegin", controlsMarkup());
  if (nativeAvailable && capability) {
    capability.className = "vibro-capability supported";
    capability.textContent = "Native Core Haptics detected. Intensity control is available in the installed iOS app.";
  }
}

async function testFeedback() {
  if (!enabled) return;
  if (nativeAvailable) {
    try { await plugin().test({ intensity: INTENSITIES[intensity] }); } catch (_) {}
    return;
  }
  originalVibrate?.([180, 100, 180]);
}

if (typeof document !== "undefined") {
  refreshCapability().finally(() => {
    installVibrateShim();
    injectControls();
  });

  const observer = new MutationObserver(injectControls);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("click", event => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.matches("[data-native-haptics-toggle]")) {
      enabled = !enabled;
      target.textContent = enabled ? "ON" : "OFF";
      target.setAttribute("aria-pressed", String(enabled));
      if (!enabled) nativeStop();
    }
    if (target.matches("[data-native-haptics-intensity]")) {
      intensity = target.dataset.nativeHapticsIntensity;
      document.querySelectorAll("[data-native-haptics-intensity]").forEach(button => button.classList.toggle("selected", button === target));
    }
    if (target.matches("[data-native-haptics-test]")) testFeedback();
  }, true);

  window.addEventListener("pagehide", nativeStop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) nativeStop(); });
}

export const PitchIQNativeHaptics = Object.freeze({
  isAvailable: () => nativeAvailable,
  stop: nativeStop,
});
