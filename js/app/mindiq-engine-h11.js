import { getReflections } from "./reflection-engine-h10.js?v=sprint-h11-mindiq-world-20260721";

const CHECKIN_KEY = "pitchiq.mindiq.checkins.v1";
const EXERCISE_KEY = "pitchiq.mindiq.exercises.v1";

const EXERCISES = Object.freeze([
  { id:"reset", title:"Reset after mistakes", skill:"resilience", minutes:2, cue:"Breathe out, name the next job, move again." },
  { id:"calm", title:"Pre-match calm", skill:"calm", minutes:3, cue:"Slow your breathing and picture your first simple action." },
  { id:"confidence", title:"Confidence under pressure", skill:"confidence", minutes:3, cue:"Recall one thing you do well, then commit to the next action." },
  { id:"focus", title:"Stay in the moment", skill:"focus", minutes:2, cue:"Notice one cue: ball, space, teammate, then decide." },
  { id:"risk", title:"Brave decisions", skill:"confidence", minutes:3, cue:"Choose one useful risk you are willing to take today." },
]);

function parse(value, fallback){ try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function clamp(value){ return Math.max(1, Math.min(5, Number(value || 3))); }

export function getMindIqCheckins(storage=globalThis.localStorage){
  const raw = parse(storage?.getItem?.(CHECKIN_KEY), []);
  return Array.isArray(raw) ? raw.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) : [];
}

export function saveMindIqCheckin(input={}, storage=globalThis.localStorage){
  const entry = {
    id:`checkin-${Date.now()}`,
    createdAt:new Date().toISOString(),
    confidence:clamp(input.confidence), focus:clamp(input.focus), calm:clamp(input.calm),
    energy:clamp(input.energy), resilience:clamp(input.resilience), note:String(input.note || ""),
  };
  const next=[entry,...getMindIqCheckins(storage)].slice(0,60);
  storage?.setItem?.(CHECKIN_KEY, JSON.stringify(next));
  globalThis.dispatchEvent?.(new CustomEvent("pitchiq:mindiq-updated", { detail:entry }));
  return entry;
}

export function getCompletedExercises(storage=globalThis.localStorage){
  const raw=parse(storage?.getItem?.(EXERCISE_KEY), []);
  return Array.isArray(raw) ? raw : [];
}

export function completeMindIqExercise(id, note="", storage=globalThis.localStorage){
  const exercise=EXERCISES.find(item=>item.id===id);
  if(!exercise) return null;
  const entry={ id:`${id}-${Date.now()}`, exerciseId:id, title:exercise.title, skill:exercise.skill, note:String(note), completedAt:new Date().toISOString() };
  storage?.setItem?.(EXERCISE_KEY, JSON.stringify([entry,...getCompletedExercises(storage)].slice(0,60)));
  globalThis.dispatchEvent?.(new CustomEvent("pitchiq:mindiq-updated", { detail:entry }));
  return entry;
}

export function mindIqProfile(checkins=getMindIqCheckins()){
  const recent=checkins.slice(0,7);
  const avg=key=>recent.length ? Math.round((recent.reduce((sum,item)=>sum+clamp(item[key]),0)/recent.length)*10)/10 : 0;
  return { confidence:avg("confidence"), focus:avg("focus"), calm:avg("calm"), energy:avg("energy"), resilience:avg("resilience"), total:checkins.length };
}

export function recommendMindIqExercise(checkins=getMindIqCheckins(), reflections=getReflections()){
  const profile=mindIqProfile(checkins);
  const scores=["confidence","focus","calm","resilience"].map(skill=>({skill,value:profile[skill] || 3})).sort((a,b)=>a.value-b.value);
  const latestReflection=reflections[0];
  let skill=scores[0]?.skill || "focus";
  if(latestReflection?.confidence <= 3) skill="confidence";
  return EXERCISES.find(item=>item.skill===skill) || EXERCISES[0];
}

export function mindIqSummary(){
  const checkins=getMindIqCheckins();
  const completed=getCompletedExercises();
  return { profile:mindIqProfile(checkins), checkins:checkins.length, exercises:completed.length, recommendation:recommendMindIqExercise(checkins) };
}

if(typeof window!=="undefined") window.PitchIQMindIq=Object.freeze({ checkins:getMindIqCheckins, saveCheckin:saveMindIqCheckin, completeExercise:completeMindIqExercise, profile:mindIqProfile, recommend:recommendMindIqExercise, summary:mindIqSummary, exercises:EXERCISES });

export { CHECKIN_KEY, EXERCISE_KEY, EXERCISES };
