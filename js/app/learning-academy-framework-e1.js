import { getUnifiedPlayerProfile } from "./academy-unified-profile-a1.js?v=a1-unified-profile-20260719";
import { LEARNING_ACADEMY_PATHWAYS, LEARNING_ACADEMY_LESSONS } from "../data/learning-academy-curriculum-e1.js?v=e1-learning-academy-20260720";

const STORAGE_KEY="pitchiq.learningAcademy.progress.v1";
const safeParse=value=>{try{return JSON.parse(value||"{}")||{}}catch{return {}}};
const readProgress=(storage=globalThis.localStorage)=>safeParse(storage?.getItem?.(STORAGE_KEY));
const writeProgress=(progress,storage=globalThis.localStorage)=>storage?.setItem?.(STORAGE_KEY,JSON.stringify(progress));
const pathwayForSource=source=>source==="Technical"?"technical":"football-iq";

function recommendedLesson(profile,progress){
  const incomplete=LEARNING_ACADEMY_LESSONS.filter(lesson=>!progress[lesson.id]?.completed);
  if(!incomplete.length)return null;
  const priority=profile.developmentAreas?.[0];
  if(priority){
    const pathway=pathwayForSource(priority.source);
    const exact=incomplete.find(lesson=>lesson.pathway===pathway&&lesson.skill.toLowerCase().includes(String(priority.label||"").toLowerCase()));
    if(exact)return exact;
    const samePathway=incomplete.find(lesson=>lesson.pathway===pathway);
    if(samePathway)return samePathway;
  }
  return incomplete[0];
}

export function getLearningAcademy(){
  const profile=getUnifiedPlayerProfile(),progress=readProgress();
  const lessons=LEARNING_ACADEMY_LESSONS.map(lesson=>Object.freeze({...lesson,completed:Boolean(progress[lesson.id]?.completed),completedAt:progress[lesson.id]?.completedAt||null}));
  const completed=lessons.filter(lesson=>lesson.completed).length;
  const pathways=LEARNING_ACADEMY_PATHWAYS.map(pathway=>{const items=lessons.filter(lesson=>lesson.pathway===pathway.id),done=items.filter(lesson=>lesson.completed).length;return Object.freeze({...pathway,total:items.length,completed:done,progress:items.length?Math.round(done/items.length*100):0})});
  const recommendation=recommendedLesson(profile,progress);
  return Object.freeze({version:"1.0",generatedAt:new Date().toISOString(),model:"Learn → Watch → Train → Reflect → Improve",completed,total:lessons.length,progress:lessons.length?Math.round(completed/lessons.length*100):0,pathways,lessons,recommended:recommendation?lessons.find(lesson=>lesson.id===recommendation.id):null,guardrails:{educational:true,adaptiveRecommendationUsesRecordedEvidence:true,noClinicalInterpretation:true,completionDoesNotChangeScores:true,completionDoesNotAwardXp:true}});
}

export function completeLearningLesson(id,storage=globalThis.localStorage){
  const lesson=LEARNING_ACADEMY_LESSONS.find(item=>item.id===id);if(!lesson)return false;
  const progress=readProgress(storage);progress[id]={completed:true,completedAt:new Date().toISOString()};writeProgress(progress,storage);return true;
}

export function resetLearningLesson(id,storage=globalThis.localStorage){const progress=readProgress(storage);if(!progress[id])return false;delete progress[id];writeProgress(progress,storage);return true}

window.PitchIQLearningAcademy=Object.freeze({get:getLearningAcademy,complete:completeLearningLesson,reset:resetLearningLesson});
