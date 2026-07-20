/* Authoritative landing completion handoff. */
const SWIPE_SELECTOR = "[data-splash-swipe]";
const ONBOARDING_COMPLETE_KEY = "pitchiqOnboardingComplete";
const PLAYER_NAME_KEY = "pitchiqPlayerName";
const SELECTED_POSITION_KEY = "pitchiqSelectedPosition";
const ROUTE_DELAY_MS = 520;
let routeTimer = 0;
let routing = false;
let observedSwipe = null;
let swipeObserver = null;
function landingVisible(){ return Boolean(document.querySelector("#splash, .splash-cover-v3, [data-splash-swipe]")); }
function onboardingComplete(){ return localStorage.getItem(ONBOARDING_COMPLETE_KEY)==="true" && Boolean(localStorage.getItem(PLAYER_NAME_KEY)) && Boolean(localStorage.getItem(SELECTED_POSITION_KEY)); }
function swipeProgress(swipe){ if(!swipe)return 0; if(swipe.classList.contains("complete"))return 1; const value=Number.parseFloat(getComputedStyle(swipe).getPropertyValue("--swipe-progress")); return Number.isFinite(value)?Math.max(0,Math.min(1,value)):0; }
function leaveSplash(){ if(routing||!landingVisible())return; routing=true; const target=onboardingComplete()?"home":"onboard"; const url=new URL(window.location.href); url.searchParams.set("dev","1"); url.searchParams.set("landingHandoff",String(Date.now())); url.hash=target; window.location.replace(url.toString()); }
function armHandoff(){ window.clearTimeout(routeTimer); routeTimer=window.setTimeout(()=>{ const swipe=document.querySelector(SWIPE_SELECTOR); if(landingVisible()&&swipeProgress(swipe)>=0.82)leaveSplash(); },ROUTE_DELAY_MS); }
function bindSwipe(){ const swipe=document.querySelector(SWIPE_SELECTOR); if(!swipe||swipe===observedSwipe)return; observedSwipe=swipe; swipeObserver?.disconnect(); swipeObserver=new MutationObserver(armHandoff); swipeObserver.observe(swipe,{attributes:true,attributeFilter:["class","style"]}); swipe.addEventListener("pointerup",armHandoff,{passive:true}); swipe.addEventListener("touchend",armHandoff,{passive:true}); swipe.addEventListener("click",armHandoff,{passive:true}); swipe.addEventListener("keydown",armHandoff); }
function initialise(){ bindSwipe(); const app=document.getElementById("app"); if(app)new MutationObserver(bindSwipe).observe(app,{childList:true,subtree:true}); }
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialise,{once:true}); else initialise();
