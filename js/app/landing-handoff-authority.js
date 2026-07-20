/* Landing completion recovery bridge.
 * main.js owns routing and exposes PitchIQApp.enterFromLanding(). This module
 * only retries that direct router API when a visually completed swipe remains
 * on the splash screen.
 */
const SWIPE_SELECTOR = "[data-splash-swipe]";
const RECOVERY_DELAY_MS = 620;
const DIAGNOSTIC_DELAY_MS = 900;
let recoveryTimer = 0;
let observedSwipe = null;
let swipeObserver = null;
let recoverySent = false;

function landingVisible(){
  return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]"));
}

function swipeProgress(swipe){
  if(!swipe)return 0;
  if(swipe.classList.contains("complete"))return 1;
  const value=Number.parseFloat(getComputedStyle(swipe).getPropertyValue("--swipe-progress"));
  return Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;
}

function recoverThroughPrimaryController(){
  const swipe=document.querySelector(SWIPE_SELECTOR);
  if(recoverySent||!landingVisible()||swipeProgress(swipe)<0.82)return;
  recoverySent=true;

  const enterFromLanding=window.PitchIQApp?.enterFromLanding;
  if(typeof enterFromLanding==="function"){
    enterFromLanding();
  }else{
    console.error("[PitchIQ landing handoff] Direct app router API is unavailable.");
  }

  window.setTimeout(()=>{
    if(landingVisible()){
      console.error("[PitchIQ landing handoff] Swipe completed but the primary app router did not replace the splash screen.");
      document.dispatchEvent(new CustomEvent("pitchiq:landing-handoff-failed",{
        detail:{progress:swipeProgress(swipe),routerAvailable:typeof window.PitchIQApp?.enterFromLanding==="function"}
      }));
    }
  },DIAGNOSTIC_DELAY_MS);
}

function armRecovery(){
  window.clearTimeout(recoveryTimer);
  recoveryTimer=window.setTimeout(recoverThroughPrimaryController,RECOVERY_DELAY_MS);
}

function bindSwipe(){
  const swipe=document.querySelector(SWIPE_SELECTOR);
  if(!swipe||swipe===observedSwipe)return;
  observedSwipe=swipe;
  recoverySent=false;
  swipeObserver?.disconnect();
  swipeObserver=new MutationObserver(armRecovery);
  swipeObserver.observe(swipe,{attributes:true,attributeFilter:["class","style"]});
  swipe.addEventListener("pointerup",armRecovery,{passive:true});
  swipe.addEventListener("touchend",armRecovery,{passive:true});
  swipe.addEventListener("click",armRecovery,{passive:true});
}

function initialise(){
  bindSwipe();
  const app=document.getElementById("app");
  if(app)new MutationObserver(bindSwipe).observe(app,{childList:true,subtree:true});
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",initialise,{once:true});
}else{
  initialise();
}
