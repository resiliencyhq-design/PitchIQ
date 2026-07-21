import { getFootballIqProgress } from "./football-iq-progression-w1-4.js?v=sprint-h12-coach-intelligence-20260721";
import { primaryFootballIqRecommendation } from "./football-iq-recommendations-w1-5.js?v=sprint-h12-coach-intelligence-20260721";
import { getReflections, reflectionSummary } from "./reflection-engine-h10.js?v=sprint-h12-coach-intelligence-20260721";
import { mindIqSummary } from "./mindiq-engine-h11.js?v=sprint-h12-coach-intelligence-20260721";

const COACH_MEMORY_KEY = "pitchiq.coach.memory.v1";
const COACH_PLAN_KEY = "pitchiq.coach.plan.v1";

function parse(value, fallback){ try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function average(values){ return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0; }
function labelSkill(skill="focus"){ return skill.charAt(0).toUpperCase()+skill.slice(1); }

export function getCoachMemory(storage=globalThis.localStorage){
  const raw=parse(storage?.getItem?.(COACH_MEMORY_KEY), { strengths:{}, priorities:{}, advice:[], updatedAt:null });
  return { strengths:raw.strengths||{}, priorities:raw.priorities||{}, advice:Array.isArray(raw.advice)?raw.advice:[], updatedAt:raw.updatedAt||null };
}

export function buildCoachProfile(){
  const progress=getFootballIqProgress();
  const reflections=getReflections();
  const reflection=reflectionSummary(reflections);
  const mind=mindIqSummary();
  const missionScores=Object.entries(progress.missions||{}).map(([id,item])=>({ id, score:Number(item.personalBest||0), completed:Boolean(item.completed), lastPlayed:item.lastPlayed||null }));
  const completed=missionScores.filter(item=>item.completed);
  const strongest=completed.slice().sort((a,b)=>b.score-a.score)[0]||null;
  const priority=completed.slice().sort((a,b)=>a.score-b.score)[0]||null;
  const readiness=average([mind.profile.confidence,mind.profile.focus,mind.profile.calm,mind.profile.resilience].filter(Boolean).map(value=>value*20));
  return { totalXp:progress.totalXp, level:progress.level, missions:missionScores.length, completed:completed.length, averageScore:average(completed.map(item=>item.score)), strongest, priority, reflections:reflection, mind:mind.profile, readiness, latestReflection:reflections[0]||null };
}

export function resolveCoachRecommendation(profile=buildCoachProfile()){
  const mission=primaryFootballIqRecommendation();
  const mental=mindIqSummary().recommendation;
  const newPlayer=profile.completed===0 && profile.reflections.total===0 && profile.mind.total===0;
  const lowReadiness=profile.readiness>0 && profile.readiness<60;
  const focus=lowReadiness ? labelSkill(mental?.skill||"calm") : profile.priority ? "Earlier, clearer decisions" : "Build your first development baseline";
  const reason=newPlayer
    ? "Complete one short mission and check-in so your coach can learn what helps you most."
    : lowReadiness
      ? `Your recent check-ins suggest ${mental?.skill||"calm"} support will help you get more from today's football work.`
      : profile.priority
        ? `Your current mission results show the clearest opportunity for improvement while preserving your stronger habits.`
        : "Your recent activity supports continuing the next recommended Football IQ mission.";
  return {
    mission:mission ? { id:mission.id, title:mission.title, minutes:Number(mission.minutes||8), xp:Number(mission.xp||20), route:"football-iq", world:"Coach Intelligence" } : { id:"technical-foundation", title:"Build your technical foundation", minutes:8, xp:20, route:"training", world:"Coach Intelligence" },
    mental:mental||null,
    focus,
    reason,
    reflectionPrompt:profile.latestReflection ? `What will you repeat from “${profile.latestReflection.missionTitle}”?` : "What did you notice before your best action today?",
    weeklyGoal:newPlayer ? "Create your first player baseline" : `Complete 3 focused sessions around ${focus.toLowerCase()}`,
    fourWeekTheme:lowReadiness ? "Calm, commit, recover" : "See earlier, decide clearly, reflect honestly",
  };
}

export function refreshCoachMemory(storage=globalThis.localStorage){
  const profile=buildCoachProfile();
  const recommendation=resolveCoachRecommendation(profile);
  const current=getCoachMemory(storage);
  const strength=profile.strongest?.id||"engagement";
  const priority=recommendation.focus.toLowerCase();
  const next={
    strengths:{...current.strengths,[strength]:(current.strengths[strength]||0)+1},
    priorities:{...current.priorities,[priority]:(current.priorities[priority]||0)+1},
    advice:[recommendation.reason,...current.advice.filter(item=>item!==recommendation.reason)].slice(0,8),
    updatedAt:new Date().toISOString(),
  };
  storage?.setItem?.(COACH_MEMORY_KEY,JSON.stringify(next));
  storage?.setItem?.(COACH_PLAN_KEY,JSON.stringify({ profile,recommendation,updatedAt:next.updatedAt }));
  globalThis.dispatchEvent?.(new CustomEvent("pitchiq:coach-updated",{detail:{profile,recommendation,memory:next}}));
  return {profile,recommendation,memory:next};
}

export function coachSnapshot(){
  const profile=buildCoachProfile();
  return { profile, recommendation:resolveCoachRecommendation(profile), memory:getCoachMemory() };
}

if(typeof window!=="undefined"){
  window.PitchIQCoach=Object.freeze({ snapshot:coachSnapshot, profile:buildCoachProfile, recommend:resolveCoachRecommendation, refresh:refreshCoachMemory, memory:getCoachMemory });
  ["pitchiq:mission-complete","pitchiq:reflections-updated","pitchiq:mindiq-updated","pitchiq:football-iq-progress"].forEach(name=>window.addEventListener(name,()=>refreshCoachMemory()));
}

export { COACH_MEMORY_KEY, COACH_PLAN_KEY };