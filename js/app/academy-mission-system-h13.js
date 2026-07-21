import { coachSnapshot } from "./coach-intelligence-h12.js?v=sprint-h12-coach-intelligence-20260721";
import { getCompletedExercises } from "./mindiq-engine-h11.js?v=sprint-h11-mindiq-world-20260721";
import { getReflections } from "./reflection-engine-h10.js?v=sprint-h10-reflect-world-20260721";

const ACADEMY_STATE_KEY="pitchiq.academy.state.v1";
const ACADEMY_REVIEW_KEY="pitchiq.academy.reviews.v1";
const PATHWAYS=Object.freeze([
  {id:"foundation",title:"Foundation Player",focus:"Build a reliable baseline",threshold:0},
  {id:"game-intelligence",title:"Game Intelligence",focus:"See earlier and decide clearly",threshold:3},
  {id:"decision-maker",title:"Decision Maker",focus:"Recognise cues under pressure",threshold:7},
  {id:"pressure-performer",title:"Pressure Performer",focus:"Stay calm, brave and effective",threshold:12},
  {id:"match-leader",title:"Match Leader",focus:"Connect decisions and influence others",threshold:18},
]);
const SEASONS=Object.freeze([
  {id:"foundation",title:"Foundation",threshold:0}, {id:"bronze",title:"Bronze",threshold:20},
  {id:"silver",title:"Silver",threshold:45}, {id:"gold",title:"Gold",threshold:70}, {id:"elite",title:"Elite",threshold:90},
]);
function parse(value,fallback){try{return value?JSON.parse(value):fallback;}catch{return fallback;}}
function dateKey(date=new Date()){return date.toISOString().slice(0,10);}
function weekKey(date=new Date()){const start=new Date(date);start.setHours(0,0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7));return dateKey(start);}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function evidence(profile){return profile.completed+profile.reflections.reviewed+Math.min(7,profile.mind.total||0);}
function readiness(profile){const activity=Math.min(45,evidence(profile)*4);const quality=Math.min(35,Math.round((profile.averageScore||0)*.35));const reflection=Math.min(20,(profile.reflections.reviewed||0)*4);return clamp(activity+quality+reflection,0,100);}
function selectByThreshold(items,value){return items.filter(item=>value>=item.threshold).at(-1)||items[0];}
function weeklyItems(recommendation){return [
  {id:"fiq-1",type:"football-iq",title:recommendation.mission.title,route:`football-iq-mission/${recommendation.mission.id}`},
  {id:"fiq-2",type:"football-iq",title:"Repeat with one earlier scan",route:`football-iq-mission/${recommendation.mission.id}`},
  {id:"fiq-3",type:"football-iq",title:"Apply the cue under pressure",route:`football-iq-mission/${recommendation.mission.id}`},
  {id:"technical-1",type:"technical",title:"Ball mastery foundation",route:"training"},
  {id:"technical-2",type:"technical",title:"First-touch repetition",route:"training"},
  {id:"mind-1",type:"mindiq",title:recommendation.mental?.title||"Stay in the moment",route:"mindiq-world"},
  {id:"mind-2",type:"mindiq",title:"Reset and recommit",route:"mindiq-world"},
  {id:"reflect-1",type:"reflect",title:"Midweek learning check",route:"reflect-world"},
  {id:"reflect-2",type:"reflect",title:"Weekly Academy review",route:"reflect-world"},
];}
export function buildAcademyState(storage=globalThis.localStorage){
  const coach=coachSnapshot();const score=readiness(coach.profile);const pathway=selectByThreshold(PATHWAYS,evidence(coach.profile));const season=selectByThreshold(SEASONS,score);
  const previous=parse(storage?.getItem?.(ACADEMY_STATE_KEY),{});const currentWeek=weekKey();
  const completedIds=previous.weekKey===currentWeek&&Array.isArray(previous.completedIds)?previous.completedIds:[];
  const items=weeklyItems(coach.recommendation).map(item=>({...item,completed:completedIds.includes(item.id)}));
  const nextPath=PATHWAYS[PATHWAYS.findIndex(item=>item.id===pathway.id)+1]||null;
  const state={version:1,weekKey:currentWeek,pathway,season,seasonProgress:score,nextUnlock:nextPath?{title:nextPath.title,remaining:Math.max(0,nextPath.threshold-evidence(coach.profile))}:{title:"Academy mastery",remaining:0},coach,items,completedIds,weeklyCompleted:items.filter(item=>item.completed).length,updatedAt:new Date().toISOString()};
  storage?.setItem?.(ACADEMY_STATE_KEY,JSON.stringify(state));return state;
}
export function completeAcademyItem(id,storage=globalThis.localStorage){const state=buildAcademyState(storage);if(!state.items.some(item=>item.id===id))return state;state.completedIds=[...new Set([...state.completedIds,id])];storage?.setItem?.(ACADEMY_STATE_KEY,JSON.stringify(state));globalThis.dispatchEvent?.(new CustomEvent("pitchiq:academy-updated",{detail:state}));return buildAcademyState(storage);}
export function createAcademyReview(storage=globalThis.localStorage){const state=buildAcademyState(storage);const reviews=parse(storage?.getItem?.(ACADEMY_REVIEW_KEY),[]);const review={id:`review-${Date.now()}`,createdAt:new Date().toISOString(),pathway:state.pathway.title,season:state.season.title,strength:state.coach.profile.strongest?.id||"Consistent engagement",growth:state.coach.recommendation.focus,nextFocus:state.nextUnlock.title};storage?.setItem?.(ACADEMY_REVIEW_KEY,JSON.stringify([review,...reviews].slice(0,24)));return review;}
export function academySnapshot(storage=globalThis.localStorage){const state=buildAcademyState(storage);return {...state,reviews:parse(storage?.getItem?.(ACADEMY_REVIEW_KEY),[]),mentalSessions:getCompletedExercises(storage).length,reflections:getReflections(storage).length};}
if(typeof window!=="undefined")window.PitchIQAcademy=Object.freeze({snapshot:academySnapshot,complete:completeAcademyItem,review:createAcademyReview,pathways:PATHWAYS,seasons:SEASONS});
export {ACADEMY_STATE_KEY,ACADEMY_REVIEW_KEY,PATHWAYS,SEASONS};