import { DRILLS, recommendedDrills } from "../data/drills.js";
import { getCue } from "../data/cues.js";

export function createSession({ position="Winger", drillId=null, level=1 } = {}){
  const pool = recommendedDrills(position);
  const drill = DRILLS.find(d => d.id === drillId) || pool[Math.min(pool.length-1, Math.max(0, level % pool.length))] || DRILLS[0];
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    drill,
    startedAt: Date.now(),
    timeLeft: drill.seconds,
    score: 0,
    combo: 1,
    bestCombo: 1,
    results: [],
    currentCue: nextCue(drill)
  };
}

export function nextCue(drill){
  const id = drill.cuePool[Math.floor(Math.random()*drill.cuePool.length)];
  return getCue(id);
}

export function adaptiveDifficulty(session){
  const attempts = session.results.length || 1;
  const correct = session.results.filter(r => r.correct).length;
  const accuracy = correct / attempts;
  if(accuracy > .82 && session.bestCombo >= 5) return Math.min(5, session.drill.difficulty + 1);
  if(accuracy < .55) return Math.max(1, session.drill.difficulty - 1);
  return session.drill.difficulty;
}

export function cueTimeoutForDifficulty(difficulty){
  return Math.max(1200, 3000 - difficulty * 300);
}
