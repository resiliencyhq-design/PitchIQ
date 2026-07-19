import { TECHNICAL_CATEGORY_LABELS, TECHNICAL_TRAINING_DRILLS } from "../data/technical-training-drills.js?v=w2-2-technical-catalogue-20260719";
import { getTechnicalProgress, technicalCategorySnapshot, technicalDrillSnapshot } from "./technical-training-progression-w2-4.js?v=w2-4-technical-progression-20260719";

const STORAGE_KEY="pitchiq.technicalTraining.adaptive.current.v1";
function time(value){const result=value?new Date(value).getTime():0;return Number.isFinite(result)?result:0}
function reasonFor(drill,category,progress){const saved=progress.drills[drill.id]||{};if(!saved.completed)return `Build your ${TECHNICAL_CATEGORY_LABELS[drill.category].toLowerCase()} foundation with a new drill.`;if(Number(saved.personalBest||0)<60)return `Repeat this drill to improve your current best of ${Number(saved.personalBest||0)}%.`;if(category.mastery==="Foundation"||category.mastery==="Developing")return `This is currently one of your biggest development areas.`;return `Keep this skill sharp and progress toward category mastery.`}
export function getAdaptiveTechnicalRecommendation(progress=getTechnicalProgress()){
  const now=Date.now();
  const candidates=TECHNICAL_TRAINING_DRILLS.map(drill=>{
    const snap=technicalDrillSnapshot(drill,progress),category=technicalCategorySnapshot(drill.category,progress),saved=progress.drills[drill.id]||{};
    if(!snap.unlocked)return null;
    const ageDays=time(saved.lastPlayed)?(now-time(saved.lastPlayed))/86400000:999;
    let score=0;
    if(!snap.completed)score+=55;else score+=Math.max(0,40-snap.personalBest*.35);
    score+=Math.max(0,35-category.percent*.35);
    score+=Math.min(18,ageDays*2);
    score+=drill.featured?6:0;
    score-=Math.abs(Number(drill.difficulty||1)-Math.min(5,progress.level))*3;
    return {drill:snap,category,score,reason:reasonFor(snap,category,progress)};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.drill.title.localeCompare(b.drill.title));
  const selected=candidates[0]||null;
  if(selected)try{localStorage.setItem(STORAGE_KEY,JSON.stringify({drillId:selected.drill.id,generatedAt:new Date().toISOString()}))}catch{}
  return selected;
}
export function adaptiveTechnicalSummary(progress=getTechnicalProgress()){
  const recommendation=getAdaptiveTechnicalRecommendation(progress);
  const categories=[...new Set(TECHNICAL_TRAINING_DRILLS.map(drill=>drill.category))].map(id=>({id,...technicalCategorySnapshot(id,progress)})).sort((a,b)=>a.percent-b.percent);
  return {recommendation,weakestCategory:categories[0]||null,strongestCategory:[...categories].sort((a,b)=>b.percent-a.percent)[0]||null};
}
window.PitchIQAdaptiveTechnical=Object.freeze({recommend:getAdaptiveTechnicalRecommendation,summary:adaptiveTechnicalSummary});