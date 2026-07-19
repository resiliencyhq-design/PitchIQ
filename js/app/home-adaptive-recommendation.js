import "./home-content-composition.js?v=sprint-h4-football-iq-world-card-20260719";
import "./football-iq-library-w1-1.js?v=w1-1-mission-library-shell-20260719";
import "./football-iq-progression-ui-w1-4.js?v=w1-4-progression-20260719";
import "./football-iq-adaptive-ui-w1-5.js?v=w1-5-adaptive-recommendations-20260719";
import "./technical-training-library-w2-1.js?v=w2-2-technical-catalogue-20260719";
import "./technical-training-detail-w2-3.js?v=w2-3-technical-detail-20260719";
import "./technical-training-progression-w2-4.js?v=w2-4-technical-progression-20260719";
import "./technical-training-progression-ui-w2-4.js?v=w2-4-technical-progression-20260719";
import "./technical-training-adaptive-w2-5.js?v=w2-5-adaptive-technical-20260719";
import "./technical-training-adaptive-ui-w2-5.js?v=w2-5-adaptive-technical-20260719";
import "./academy-unified-profile-ui-a1.js?v=a1-unified-profile-20260719";
import "./academy-performance-index-ui-a2.js?v=a2-performance-index-20260719";
import "./academy-skill-radar-ui-a3.js?v=a3-skill-radar-20260719";
import "./academy-ai-coach-ui-b1.js?v=b1-academy-ai-coach-20260719";
import "./academy-session-builder-ui-b2.js?v=b2-session-builder-20260719";
import "./academy-dynamic-difficulty-ui-b3.js?v=b3-dynamic-difficulty-20260719";

const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";
const CARD_SELECTOR = "[data-home-adaptive-recommendation]";
const TRAINING_ROUTE_SELECTOR = `${CARD_SELECTOR} [data-route="training"]`;
const DRILL_LABELS = Object.freeze({scanning:"Scanning",vision:"Vision",decision:"Decision",reaction:"Reaction",dual:"Dual Task",position:"Positioning"});
export function readHomeAdaptiveRecommendation(storage=globalThis.localStorage){try{const value=JSON.parse(storage?.getItem?.(ADAPTIVE_CURRENT_KEY)||"null");return value?.mission?value:null}catch{return null}}
export function homeRecommendationView(selection){const mission=selection?.mission;if(!mission)return{mode:"empty",eyebrow:"Football IQ Training",title:"Build your football brain",description:"Choose a mission to train scanning, vision, decision-making and positioning.",focus:"Mission library"};return{mode:selection.mode||"balanced_evidence_building",eyebrow:"Football IQ Training",title:mission.title||"Football IQ Mission",description:mission.description||"Complete a short Football IQ training rep.",focus:`Recommended · ${DRILL_LABELS[mission.drillId]||"Football IQ"}`}}
export function renderHomeAdaptiveRecommendation(home,selection){if(!home)return false;const view=homeRecommendationView(selection),signature=JSON.stringify(view);let card=home.querySelector(CARD_SELECTOR);if(!card){card=document.createElement("article");card.className="home-adaptive-recommendation";card.dataset.homeAdaptiveRecommendation="true";const mission=home.querySelector(".home-mock-mission");if(mission)mission.insertAdjacentElement("afterend",card);else home.querySelector(".home-v7-grid")?.prepend(card)}if(!card||card.dataset.signature===signature)return Boolean(card);card.dataset.signature=signature;card.dataset.recommendationMode=view.mode;card.setAttribute("aria-label","Football IQ Training");card.innerHTML=`<div class="home-adaptive-copy"><span>${view.eyebrow}</span><small>${view.focus}</small><h2>${view.title}</h2><p>${view.description}</p></div><button type="button" data-route="training">Explore missions →</button>`;return true}
export function routeAdaptiveTrainingClick(event,root=document){const trigger=event?.target?.closest?.(TRAINING_ROUTE_SELECTOR);if(!trigger)return false;const canonicalTrainingButton=root.querySelector?.('#nav [data-route="training"]');if(!canonicalTrainingButton||canonicalTrainingButton===trigger)return false;event.preventDefault?.();event.stopImmediatePropagation?.();canonicalTrainingButton.click();return true}
function refreshHomeRecommendation(){const home=document.querySelector("#home.active, #home");if(home)renderHomeAdaptiveRecommendation(home,readHomeAdaptiveRecommendation())}
if(typeof document!=="undefined"){const app=document.getElementById("app");if(app)new MutationObserver(()=>queueMicrotask(refreshHomeRecommendation)).observe(app,{childList:true});document.addEventListener("click",event=>{if(routeAdaptiveTrainingClick(event))return;if(event.target.closest?.('[data-route="home"]'))setTimeout(refreshHomeRecommendation,0)},true);window.addEventListener("pageshow",refreshHomeRecommendation);refreshHomeRecommendation()}
export { ADAPTIVE_CURRENT_KEY, TRAINING_ROUTE_SELECTOR };