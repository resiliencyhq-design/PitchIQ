const STORAGE_KEY = "pitchiq.footballIq.progress.v1";
const ACTIVE_MISSION_KEY = "pitchiq.footballIq.activeMission";
const XP_PER_LEVEL = 100;

const DEFAULT_PROGRESS = Object.freeze({
  totalXp: 0,
  level: 1,
  completedMissionIds: [],
  missions: {},
});

function safeParse(value, fallback){
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function normalise(raw={}){
  const totalXp = Math.max(0, Number(raw.totalXp || 0));
  return {
    totalXp,
    level: Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1),
    completedMissionIds: Array.isArray(raw.completedMissionIds) ? [...new Set(raw.completedMissionIds)] : [],
    missions: raw.missions && typeof raw.missions === "object" ? raw.missions : {},
  };
}

export function getFootballIqProgress(){
  return normalise(safeParse(localStorage.getItem(STORAGE_KEY), DEFAULT_PROGRESS));
}

export function saveFootballIqProgress(progress){
  const next = normalise(progress);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("pitchiq:football-iq-progress", { detail: next }));
  return next;
}

export function xpToNextLevel(progress=getFootballIqProgress()){
  const levelFloor = (progress.level - 1) * XP_PER_LEVEL;
  return {
    earned: progress.totalXp - levelFloor,
    required: XP_PER_LEVEL,
    remaining: Math.max(0, progress.level * XP_PER_LEVEL - progress.totalXp),
    percent: Math.min(100, Math.round(((progress.totalXp - levelFloor) / XP_PER_LEVEL) * 100)),
  };
}

export function isMissionUnlocked(mission, progress=getFootballIqProgress()){
  return !mission || mission.status !== "locked" || progress.level >= Number(mission.unlockLevel || 2);
}

export function missionProgress(missionId, progress=getFootballIqProgress()){
  return progress.missions[missionId] || null;
}

export function rememberActiveMission(missionId){
  if(missionId) sessionStorage.setItem(ACTIVE_MISSION_KEY, missionId);
}

export function activeMissionId(){
  return sessionStorage.getItem(ACTIVE_MISSION_KEY) || "";
}

export function recordFootballIqCompletion({ missionId=activeMissionId(), score=0, xp=0, completedAt=new Date().toISOString() }={}){
  if(!missionId) return getFootballIqProgress();
  const current = getFootballIqProgress();
  const previous = current.missions[missionId] || { attempts:0, personalBest:0, xpAwarded:false };
  const firstCompletion = !previous.xpAwarded;
  const missionXp = firstCompletion ? Math.max(0, Number(xp || 0)) : 0;
  const missions = {
    ...current.missions,
    [missionId]: {
      attempts: Number(previous.attempts || 0) + 1,
      personalBest: Math.max(Number(previous.personalBest || 0), Number(score || 0)),
      lastPlayed: completedAt,
      completed: true,
      xpAwarded: previous.xpAwarded || firstCompletion,
    },
  };
  sessionStorage.removeItem(ACTIVE_MISSION_KEY);
  return saveFootballIqProgress({
    ...current,
    totalXp: current.totalXp + missionXp,
    completedMissionIds: [...new Set([...current.completedMissionIds, missionId])],
    missions,
  });
}

window.addEventListener("pitchiq:mission-complete", event => {
  recordFootballIqCompletion(event.detail || {});
});

window.PitchIQFootballIqProgress = Object.freeze({
  get: getFootballIqProgress,
  complete: recordFootballIqCompletion,
  activeMissionId,
});
