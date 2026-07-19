import { FOOTBALL_IQ_MISSIONS, FOOTBALL_IQ_MODULES } from "../data/football-iq-missions.js?v=s21-3-season-curriculum-20260719";
import { getFootballIqProgress, missionSnapshot, moduleProgressSnapshot } from "./football-iq-progression-w1-4.js?v=s21-3-season-curriculum-20260719";

export const FOOTBALL_IQ_CURRICULUM = Object.freeze([
  Object.freeze({ id:"foundation", title:"Foundation", weeks:"Weeks 1–3", objective:"Build the habits that help you collect information before the ball arrives.", modules:["awareness","scanning"] }),
  Object.freeze({ id:"read-the-game", title:"Read the Game", weeks:"Weeks 4–6", objective:"Recognise patterns, pressure and the options that will open next.", modules:["vision","anticipation"] }),
  Object.freeze({ id:"act-early", title:"Act Early", weeks:"Weeks 7–9", objective:"Turn information into quicker, more purposeful decisions and movement.", modules:["decision","positioning"] }),
  Object.freeze({ id:"lead-the-picture", title:"Lead the Picture", weeks:"Weeks 10–12", objective:"Use communication and repeatable game intelligence to improve teammates around you.", modules:["communication"] }),
]);

function phaseMissions(phase){
  return FOOTBALL_IQ_MISSIONS.filter(mission => phase.modules.includes(mission.category));
}

function phaseSnapshot(phase, progress){
  const missions = phaseMissions(phase).map(mission => missionSnapshot(mission, progress));
  const unlocked = missions.filter(mission => mission.unlocked);
  const completed = unlocked.filter(mission => mission.completed);
  const mastery = unlocked.length
    ? Math.round(unlocked.reduce((sum, mission) => sum + mission.personalBest, 0) / unlocked.length)
    : 0;
  const status = !unlocked.length ? "locked" : completed.length === unlocked.length && mastery >= 70 ? "complete" : completed.length ? "active" : "ready";
  return Object.freeze({
    ...phase,
    missions,
    total:unlocked.length,
    completed:completed.length,
    percent:mastery,
    status,
    totalMinutes:unlocked.reduce((sum, mission) => sum + Number(mission.minutes || 0), 0),
  });
}

export function footballIqSeason(progress=getFootballIqProgress()){
  const phases = FOOTBALL_IQ_CURRICULUM.map(phase => phaseSnapshot(phase, progress));
  const activeIndex = Math.max(0, phases.findIndex(phase => phase.status !== "complete"));
  const activePhase = phases[activeIndex] || phases[phases.length - 1] || null;
  const completedPhases = phases.filter(phase => phase.status === "complete").length;
  const totalMissionCount = phases.reduce((sum, phase) => sum + phase.total, 0);
  const completedMissionCount = phases.reduce((sum, phase) => sum + phase.completed, 0);
  return Object.freeze({
    title:"Football IQ Season",
    subtitle:"A 12-week pathway from scanning habits to game leadership.",
    phases,
    activePhase,
    activeIndex,
    completedPhases,
    percent:totalMissionCount ? Math.round((completedMissionCount / totalMissionCount) * 100) : 0,
  });
}

export function curriculumModuleState(moduleId, progress=getFootballIqProgress()){
  const phaseIndex = FOOTBALL_IQ_CURRICULUM.findIndex(phase => phase.modules.includes(moduleId));
  const phase = phaseIndex >= 0 ? phaseSnapshot(FOOTBALL_IQ_CURRICULUM[phaseIndex], progress) : null;
  const module = FOOTBALL_IQ_MODULES[moduleId] || null;
  const moduleProgress = module ? moduleProgressSnapshot(moduleId, progress) : null;
  return Object.freeze({ phaseIndex, phase, module, moduleProgress });
}

window.PitchIQFootballIqCurriculum = Object.freeze({ season:footballIqSeason, module:curriculumModuleState });
