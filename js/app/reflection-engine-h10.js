import { missionById } from "../data/football-iq-missions.js?v=sprint-h10-reflect-world-20260721";

const REFLECTION_KEY = "pitchiq.reflections.v1";
const MAX_REFLECTIONS = 60;

function safeParse(value, fallback){
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function normaliseEntry(raw={}){
  return {
    id:String(raw.id || `reflection-${Date.now()}`),
    missionId:String(raw.missionId || ""),
    missionTitle:String(raw.missionTitle || "Training session"),
    score:Math.max(0, Math.min(100, Number(raw.score || 0))),
    completedAt:raw.completedAt || new Date().toISOString(),
    strength:String(raw.strength || "You completed the session and stayed engaged."),
    focus:String(raw.focus || "Repeat the skill with one clear intention."),
    coachingInsight:String(raw.coachingInsight || "Notice the moment before the action, then choose early."),
    confidence:Math.max(1, Math.min(5, Number(raw.confidence || 3))),
    note:String(raw.note || ""),
    reviewed:Boolean(raw.reviewed),
  };
}

export function getReflections(storage=globalThis.localStorage){
  const raw = safeParse(storage?.getItem?.(REFLECTION_KEY), []);
  return Array.isArray(raw) ? raw.map(normaliseEntry).sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt)) : [];
}

export function saveReflections(entries, storage=globalThis.localStorage){
  const next = entries.map(normaliseEntry).slice(0, MAX_REFLECTIONS);
  storage?.setItem?.(REFLECTION_KEY, JSON.stringify(next));
  globalThis.dispatchEvent?.(new CustomEvent("pitchiq:reflections-updated", { detail:next }));
  return next;
}

function feedbackFor(score, mission){
  const category = mission?.category || "football intelligence";
  if(score >= 85) return {
    strength:`Your ${category.replaceAll("-", " ")} decisions were clear and consistent.`,
    focus:"Raise the challenge by acting a fraction earlier.",
    coachingInsight:"Keep the same calm picture, but recognise the cue before the ball arrives.",
    confidence:5,
  };
  if(score >= 65) return {
    strength:"You recognised several useful cues and made positive choices.",
    focus:"Make your first scan earlier and use it to simplify the next action.",
    coachingInsight:"Early information creates time. Scan, decide, then execute.",
    confidence:4,
  };
  return {
    strength:"You stayed with the challenge and created a useful learning attempt.",
    focus:"Slow the decision down and look for one clear cue at a time.",
    coachingInsight:"Improvement starts by noticing one repeatable moment, not fixing everything at once.",
    confidence:3,
  };
}

export function createReflection({ missionId="", score=0, completedAt=new Date().toISOString() }={}){
  const mission = missionById(missionId);
  const feedback = feedbackFor(Number(score || 0), mission);
  return normaliseEntry({
    id:`${missionId || "session"}-${completedAt}`,
    missionId,
    missionTitle:mission?.title || "Training session",
    score,
    completedAt,
    ...feedback,
  });
}

export function recordReflection(detail={}, storage=globalThis.localStorage){
  const entry = createReflection(detail);
  const current = getReflections(storage).filter(item => item.id !== entry.id);
  return saveReflections([entry, ...current], storage)[0];
}

export function updateReflection(id, changes={}, storage=globalThis.localStorage){
  const next = getReflections(storage).map(item => item.id === id ? normaliseEntry({ ...item, ...changes }) : item);
  saveReflections(next, storage);
  return next.find(item => item.id === id) || null;
}

export function reflectionSummary(entries=getReflections()){
  const reviewed = entries.filter(item => item.reviewed);
  const thisWeek = entries.filter(item => Date.now() - new Date(item.completedAt).getTime() <= 7 * 86400000);
  const averageConfidence = entries.length ? Math.round((entries.reduce((sum,item)=>sum+item.confidence,0)/entries.length)*10)/10 : 0;
  return {
    total:entries.length,
    reviewed:reviewed.length,
    pending:entries.filter(item => !item.reviewed).length,
    thisWeek:thisWeek.length,
    streak:Math.min(7, new Set(entries.map(item => item.completedAt.slice(0,10))).size),
    averageConfidence,
  };
}

if(typeof window !== "undefined"){
  window.addEventListener("pitchiq:mission-complete", event => recordReflection(event.detail || {}));
  window.PitchIQReflection = Object.freeze({ get:getReflections, record:recordReflection, update:updateReflection, summary:reflectionSummary });
}

export { REFLECTION_KEY };
