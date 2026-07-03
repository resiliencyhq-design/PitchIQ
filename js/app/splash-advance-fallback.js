/* ==========================================================
   SPLASH — Advance Fallback
   Prevents the landing swipe from freezing at the completed state.
   If the swipe completes but the app remains on splash, reopen directly
   on onboarding through the existing dev hash route, then hide dev UI.
   ========================================================== */

const AUTO_ONBOARD_PARAM = "autoOnboard";
const FALLBACK_DELAY_MS = 1250;

function isSplashVisible(){
  return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]"));
}

function hideRecoveryDevUi(){
  if(!new URLSearchParams(window.location.search).has(AUTO_ONBOARD_PARAM)) return;

  try{
    localStorage.setItem("pitchiqDevBorderEnabled", "false");
    document.body.classList.remove("pitchiq-dev-border");
    document.querySelector(".app-shell")?.classList.remove("DeveloperIPhoneFrame");

    const style = document.createElement("style");
    style.textContent = `#pitchiq-dev-toggle,#pitchiq-dev-panel{display:none!important}`;
    document.head.appendChild(style);

    const cleanUrl = `${window.location.origin}${window.location.pathname}?v=step2-favorite-position-spacing-20260703#onboard`;
    window.history.replaceState({}, "", cleanUrl);
  }catch{}
}

function goToOnboardingFallback(){
  if(!isSplashVisible()) return;

  try{
    localStorage.setItem("pitchiqDevBorderEnabled", "false");
  }catch{}

  const target = `${window.location.origin}${window.location.pathname}?dev=1&${AUTO_ONBOARD_PARAM}=1&v=splash-swipe-fallback-20260703#onboard`;
  window.location.replace(target);
}

function armSplashFallback(){
  const swipe = document.querySelector("[data-splash-swipe]");
  if(!swipe) return;

  let fallbackTimer = null;

  const arm = () => {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => {
      if(swipe.classList.contains("complete") && isSplashVisible()){
        goToOnboardingFallback();
      }
    }, FALLBACK_DELAY_MS);
  };

  const observer = new MutationObserver(arm);
  observer.observe(swipe, { attributes:true, attributeFilter:["class", "style"] });

  swipe.addEventListener("pointerup", arm, { passive:true });
  swipe.addEventListener("click", arm, { passive:true });
  swipe.addEventListener("keydown", arm);
}

hideRecoveryDevUi();
window.addEventListener("DOMContentLoaded", armSplashFallback);
window.addEventListener("load", armSplashFallback);
setTimeout(armSplashFallback, 400);
