import { FOOTBALL_IQ_MISSIONS } from "../data/football-iq-missions.js?v=s21-1-module-progress-20260719";

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

function asTime(value){
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time) ? time : 0;
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

export function missionSnapshot(mission, progress=getFootballIqProgress()){
  if(!mission) return null;
  const saved = missionProgress(mission.id, progress) || {};
  const unlocked = isMissionUnlocked(mission, progress);
  const completed = Boolean(saved.completed);
  return Object.freeze({
    ...mission,
    status: unlocked ? (completed ? "completed" : "available") : "locked",
    attempts: Number(saved.attempts || 0),
    personalBest: Number(saved.personalBest || 0),
    lastPlayed: saved.lastPlayed || null,
    completed,
    unlocked,
  });
}

export function formatFootballIqDate(value, now=new Date()){
  const time = asTime(value);
  if(!time) return "Not recorded";
  const elapsed = Math.max(0, now.getTime() - time);
  const days = Math.floor(elapsed / 86400000);
  if(days === 0) return "today";
  if(days === 1) return "yesterday";
  if(days < 7) return `${days} days ago`;
  return new Date(time).toLocaleDateString(undefined, { day:"numeric", month:"short" });
}

export function moduleProgressSnapshot(moduleId, progress=getFootballIqProgress()){
  const missions = FOOTBALL_IQ_MISSIONS
    .filter(mission => mission.category === moduleId)
    .map(mission => missionSnapshot(mission, progress));
  const eligible = missions.filter(mission => mission.unlocked);
  const completed = eligible.filter(mission => mission.completed);
  const performance = eligible.length
    ? Math.round(eligible.reduce((sum, mission) => sum + mission.personalBest, 0) / eligible.length)
    : 0;
  const mastery = performance >= 90 ? "Mastered" : performance >= 70 ? "Strong" : performance >= 40 ? "Developing" : "Foundation";
  const latestTime = Math.max(...completed.map(mission => asTime(mission.lastPlayed)), 0);
  const nextMission = eligible
    .slice()
    .sort((a,b) => Number(a.completed) - Number(b.completed) || a.personalBest - b.personalBest || asTime(a.lastPlayed) - asTime(b.lastPlayed))[0] || null;
  return Object.freeze({
    missions,
    total: eligible.length,
    completed: completed.length,
    percent: performance,
    mastery,
    totalMinutes: eligible.reduce((sum, mission) => sum + Number(mission.minutes || 0), 0),
    lastTrained: latestTime ? new Date(latestTime).toISOString() : null,
    nextMission,
  });
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
  module: moduleProgressSnapshot,
});