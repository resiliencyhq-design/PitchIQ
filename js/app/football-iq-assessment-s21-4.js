import { FOOTBALL_IQ_CATEGORY_LABELS, FOOTBALL_IQ_MODULES } from "../data/football-iq-missions.js?v=s21-4-assessment-benchmarks-20260719";
import { getFootballIqProgress, moduleProgressSnapshot } from "./football-iq-progression-w1-4.js?v=s21-4-assessment-benchmarks-20260719";
import { footballIqSeason } from "./football-iq-curriculum-s21-3.js?v=s21-4-assessment-benchmarks-20260719";

const BENCHMARK_BANDS = Object.freeze([
  Object.freeze({ min:90, label:"Elite", badge:"Gold" }),
  Object.freeze({ min:75, label:"Advanced", badge:"Silver" }),
  Object.freeze({ min:55, label:"Developing", badge:"Bronze" }),
  Object.freeze({ min:0, label:"Foundation", badge:"Starter" }),
]);

function benchmarkBand(score){
  return BENCHMARK_BANDS.find(item => score >= item.min) || BENCHMARK_BANDS[BENCHMARK_BANDS.length - 1];
}

function moduleBenchmarks(progress){
  return Object.keys(FOOTBALL_IQ_MODULES).map(moduleId => {
    const snapshot = moduleProgressSnapshot(moduleId, progress);
    return Object.freeze({
      id:moduleId,
      label:FOOTBALL_IQ_CATEGORY_LABELS[moduleId] || FOOTBALL_IQ_MODULES[moduleId]?.title || moduleId,
      score:snapshot.percent,
      completed:snapshot.completed,
      total:snapshot.total,
      mastery:snapshot.mastery,
    });
  });
}

export function footballIqAssessment(progress=getFootballIqProgress()){
  const season = footballIqSeason(progress);
  const modules = moduleBenchmarks(progress);
  const eligible = modules.filter(module => module.total > 0);
  const score = eligible.length ? Math.round(eligible.reduce((sum,module)=>sum + module.score,0) / eligible.length) : 0;
  const ranked = eligible.slice().sort((a,b)=>b.score-a.score || a.label.localeCompare(b.label));
  const strengths = ranked.filter(module => module.score >= 70).slice(0,2);
  const priorities = ranked.slice().sort((a,b)=>a.score-b.score || a.label.localeCompare(b.label)).slice(0,2);
  const band = benchmarkBand(score);
  const checkpoints = season.phases.map((phase,index) => {
    const passed = phase.status === "complete";
    const ready = phase.completed === phase.total && phase.total > 0;
    return Object.freeze({
      id:phase.id,
      title:`Phase ${index + 1} Benchmark`,
      phase:phase.title,
      score:phase.percent,
      status:passed ? "passed" : ready ? "ready" : index === season.activeIndex ? "in-progress" : "locked",
      badge:passed ? benchmarkBand(phase.percent).badge : null,
    });
  });
  const nextCheckpoint = checkpoints.find(item => item.status !== "passed") || null;
  return Object.freeze({
    score,
    band:band.label,
    badge:band.badge,
    strengths,
    priorities,
    checkpoints,
    nextCheckpoint,
    seasonPercent:season.percent,
    currentPhase:season.activePhase?.title || "Season complete",
  });
}

window.PitchIQFootballIqAssessment = Object.freeze({ get:footballIqAssessment, bands:BENCHMARK_BANDS });
