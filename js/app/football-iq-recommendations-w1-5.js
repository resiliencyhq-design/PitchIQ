import { FOOTBALL_IQ_MISSIONS, FOOTBALL_IQ_CATEGORY_LABELS } from "../data/football-iq-missions.js?v=s21-2-adaptive-plan-20260719";
import { getFootballIqProgress, isMissionUnlocked, xpToNextLevel } from "./football-iq-progression-w1-4.js?v=s21-1-module-progress-20260719";

const DAY_MS = 86400000;

function asTime(value){
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time) ? time : 0;
}

function categoryCounts(progress){
  return FOOTBALL_IQ_MISSIONS.reduce((counts, mission) => {
    const attempts = Number(progress.missions?.[mission.id]?.attempts || 0);
    counts[mission.category] = (counts[mission.category] || 0) + attempts;
    return counts;
  }, {});
}

function categoryPerformance(progress){
  return FOOTBALL_IQ_MISSIONS.reduce((summary, mission) => {
    if(!isMissionUnlocked(mission, progress)) return summary;
    const saved = progress.missions?.[mission.id];
    const current = summary[mission.category] || { attempts:0, completed:0, total:0, scoreTotal:0, latest:0 };
    current.total += 1;
    current.attempts += Number(saved?.attempts || 0);
    if(saved?.completed){
      current.completed += 1;
      current.scoreTotal += Number(saved.personalBest || 0);
    }
    current.latest = Math.max(current.latest, asTime(saved?.lastPlayed));
    summary[mission.category] = current;
    return summary;
  }, {});
}

function recommendationReason(mission, progress, counts){
  const saved = progress.missions?.[mission.id];
  const best = Number(saved?.personalBest || 0);
  if(saved?.completed && best < 70) return `Revisit this mission to improve your ${best}% personal best.`;
  if(!saved?.completed && mission.recommended) return "Build a core Football IQ habit with your next first attempt.";
  const least = Math.min(...Object.values(counts).concat(0));
  if((counts[mission.category] || 0) === least) return `${FOOTBALL_IQ_CATEGORY_LABELS[mission.category]} has had the least training recently.`;
  if(mission.status === "locked" && isMissionUnlocked(mission, progress)) return `Newly unlocked at Academy Level ${progress.level}.`;
  const next = xpToNextLevel(progress);
  if(next.remaining <= mission.xp) return `Complete this mission to reach Level ${progress.level + 1}.`;
  return `Selected to strengthen ${FOOTBALL_IQ_CATEGORY_LABELS[mission.category] || "Football IQ"}.`;
}

function missionScore(mission, progress, counts){
  if(!isMissionUnlocked(mission, progress)) return -Infinity;
  const saved = progress.missions?.[mission.id];
  const best = Number(saved?.personalBest || 0);
  const attempts = Number(saved?.attempts || 0);
  const lastPlayed = asTime(saved?.lastPlayed);
  let score = 0;
  if(saved?.completed && best < 70) score += 1000 + (70 - best) * 5;
  if(!saved?.completed && mission.recommended) score += 800;
  if(!saved?.completed) score += 300;
  const maxCategory = Math.max(...Object.values(counts).concat(0));
  score += (maxCategory - (counts[mission.category] || 0)) * 35;
  if(mission.status === "locked" && isMissionUnlocked(mission, progress)) score += 250;
  score += Number(mission.xp || 0) * 3;
  if(lastPlayed) score += Math.min(180, Math.floor((Date.now() - lastPlayed) / DAY_MS) * 12);
  score -= attempts * 8;
  return score;
}

export function footballIqRecommendations(limit=3, progress=getFootballIqProgress()){
  const counts = categoryCounts(progress);
  return FOOTBALL_IQ_MISSIONS
    .map(mission => ({ mission, score:missionScore(mission, progress, counts) }))
    .filter(item => Number.isFinite(item.score))
    .sort((a,b) => b.score - a.score || a.mission.title.localeCompare(b.mission.title))
    .slice(0, limit)
    .map(({mission}) => ({ ...mission, recommendationReason:recommendationReason(mission, progress, counts) }));
}

export function adaptiveFootballIqPlan(progress=getFootballIqProgress(), limit=3){
  const recommendations = footballIqRecommendations(Math.max(limit, 3), progress);
  const performance = categoryPerformance(progress);
  const categories = Object.entries(performance).map(([category, item]) => ({
    category,
    attempts:item.attempts,
    completion:item.total ? item.completed / item.total : 0,
    average:item.completed ? Math.round(item.scoreTotal / item.completed) : 0,
    latest:item.latest,
  }));
  categories.sort((a,b) => a.average - b.average || a.completion - b.completion || a.attempts - b.attempts || a.category.localeCompare(b.category));
  const focus = categories[0]?.category || recommendations[0]?.category || "awareness";
  const focusLabel = FOOTBALL_IQ_CATEGORY_LABELS[focus] || "Football IQ";
  const focusStats = categories.find(item => item.category === focus);
  const totalMinutes = recommendations.slice(0,limit).reduce((sum, mission) => sum + Number(mission.minutes || 0), 0);
  const completedCount = Object.values(progress.missions || {}).filter(item => item?.completed).length;
  const headline = completedCount ? `Strengthen your ${focusLabel.toLowerCase()}.` : "Build your Football IQ foundation.";
  const rationale = !focusStats?.attempts
    ? `${focusLabel} has not been trained yet, so it is the priority in this plan.`
    : focusStats.average < 70
      ? `${focusLabel} is the clearest improvement opportunity based on current personal-best scores.`
      : `${focusLabel} is the least-developed area across your unlocked modules.`;
  return {
    focus,
    focusLabel,
    headline,
    rationale,
    totalMinutes,
    missions:recommendations.slice(0,limit),
    generatedAt:new Date().toISOString(),
  };
}

export function footballIqActivity(progress=getFootballIqProgress(), now=new Date()){
  const dates = Object.values(progress.missions || {})
    .map(item => asTime(item?.lastPlayed))
    .filter(Boolean)
    .sort((a,b) => b-a);
  const uniqueDays = [...new Set(dates.map(time => new Date(time).toISOString().slice(0,10)))];
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0,0,0,0);
  for(let index=0; index<365; index += 1){
    const key = cursor.toISOString().slice(0,10);
    if(uniqueDays.includes(key)) streak += 1;
    else break;
    cursor.setDate(cursor.getDate()-1);
  }
  const weekStart = new Date(now);
  weekStart.setHours(0,0,0,0);
  weekStart.setDate(weekStart.getDate()-6);
  const weekly = dates.filter(time => time >= weekStart.getTime()).length;
  const mostRecent = dates[0] || 0;
  const daysSince = mostRecent ? Math.floor((Date.now()-mostRecent)/DAY_MS) : Infinity;
  const readiness = daysSince <= 1 ? "High Focus" : daysSince <= 4 ? "Building" : "Recovering";
  return { streak, weekly, readiness };
}

export function primaryFootballIqRecommendation(){
  return footballIqRecommendations(1)[0] || null;
}

window.PitchIQFootballIqRecommendations = Object.freeze({
  get: footballIqRecommendations,
  plan: adaptiveFootballIqPlan,
  activity: footballIqActivity,
  primary: primaryFootballIqRecommendation,
});