import type { ReactionResult, TrainingCue } from "../types/training";

export function scoreReaction(reactionMs:number|null, correct=true):number {
  if (!correct) return 0;
  if (reactionMs === null) return 20;
  if (reactionMs < 300) return 100;
  if (reactionMs < 450) return 80;
  if (reactionMs < 650) return 60;
  if (reactionMs < 900) return 40;
  return 20;
}

export function scoreVoiceAnswer(cue:TrainingCue, transcript:string) {
  const normalized = transcript.toLowerCase().trim();
  const matchedResponse = cue.acceptedResponses.find(r => normalized.includes(r.toLowerCase())) ?? null;
  return { correct: Boolean(matchedResponse), matchedResponse, xpAwarded: matchedResponse ? cue.xpBase : 0 };
}

export function summarizeSession(results:ReactionResult[]) {
  const completed = results.length;
  const correct = results.filter(r => r.correct).length;
  const detected = results.filter(r => r.detected && r.reactionMs !== null);
  const bestReactionMs = detected.length ? Math.min(...detected.map(r => r.reactionMs as number)) : null;
  const averageReactionMs = detected.length ? Math.round(detected.reduce((s,r)=>s+(r.reactionMs as number),0)/detected.length) : null;
  const totalXp = results.reduce((s,r)=>s+r.xpAwarded,0);
  return { completed, correct, accuracy: completed ? Math.round((correct/completed)*100) : 0, bestReactionMs, averageReactionMs, totalXp };
}
