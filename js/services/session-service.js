import { adaptiveDifficulty, createSession, nextCue } from "../game/session.js";

/** Canonical owner of the mutable state for one live training session. */
export class SessionService {
  constructor() {
    this.reset();
  }

  reset() {
    this.session = null;
    this.time = 45;
    this.score = 0;
    this.combo = 0;
    this.countdown = null;
    this.timer = null;
  }

  start({ position, drillId, level }) {
    this.stopTimer();
    this.reset();
    this.session = createSession({ position, drillId, level });
    this.time = this.session.timeLeft;
    return this.session;
  }

  get currentCue() {
    return this.session?.currentCue ?? null;
  }

  answer(correct, xpAwarded = correct ? 20 : 0) {
    if (!this.session) return null;
    const result = { correct, xpAwarded, timestamp: Date.now() };
    this.session.results.push(result);
    this.combo = correct ? this.combo + 1 : 0;
    this.session.combo = this.combo;
    this.session.bestCombo = Math.max(this.session.bestCombo, this.combo);
    this.score += xpAwarded;
    this.session.score = this.score;
    this.session.currentCue = nextCue(this.session.drill);
    return result;
  }

  summary() {
    const session = this.session;
    if (!session) return null;
    const attempts = session.results.length;
    const correct = session.results.filter((result) => result.correct).length;
    return {
      drillId: session.drill.id,
      attempts,
      correct,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      score: this.score,
      xp: this.score,
      combo: session.bestCombo,
      difficulty: adaptiveDifficulty(session),
      endedAt: Date.now(),
    };
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
