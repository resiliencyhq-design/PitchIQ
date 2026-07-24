import { SessionService } from "../../services/session-service.js";

export class TrainingController {
  constructor({ state, render, save }) {
    this.state = state;
    this.render = render;
    this.save = save;
    this.session = new SessionService();
    this.stage = "home";
    this.selectedDrillId = null;
    this.difficulty = "medium";
    this.responseMode = "coach";
    this.summary = null;
  }

  view({ selectedDrill, missionDrill, liveCueDisplay, voiceAvailable, voiceStatusMessage }) {
    const cue = this.session.currentCue;
    return {
      stage: this.stage, selectedDrillId: this.selectedDrillId,
      selectedDrill: selectedDrill(), missionDrill: missionDrill(),
      difficulty: this.difficulty, responseMode: this.responseMode,
      voiceAvailable, voiceStatusMessage, summary: this.summary,
      time: this.session.time, score: this.session.score, combo: this.session.combo,
      countdown: this.session.countdown, cueId: cue?.id, cueType: cue?.type,
      cueLabel: cue?.label, cueDisplay: cue?.display, liveCueDisplay: liveCueDisplay(cue),
      instruction: cue ? `Say or tap: ${cue.acceptedResponses[0].toUpperCase()} • ${this.difficulty.toUpperCase()}` : "Say or tap the cue.",
      rewardName: this.state.game?.dailyDone ? "Daily Academy Pack" : "Academy Training Pack",
    };
  }

  start(position) {
    this.session.start({ position, drillId: this.selectedDrillId, level: this.state.game?.level || 1 });
    this.summary = null;
    this.stage = "setup";
    this.render();
  }

  beginLive() {
    this.stage = "live";
    this.session.stopTimer();
    this.session.timer = setInterval(() => {
      this.session.time -= 1;
      if (this.session.time <= 0) this.finish();
      else this.render();
    }, 1000);
    this.render();
  }

  answer(correct) {
    if (this.stage !== "live") return;
    this.session.answer(correct);
    this.render();
  }

  finish() {
    this.session.stopTimer();
    this.summary = this.session.summary();
    if (this.summary) {
      this.state.game.lastResult = this.summary;
      this.state.game.lastXp = this.summary.xp;
    }
    this.stage = "results";
    this.save();
    this.render();
  }

  cancel() { this.session.stopTimer(); this.stage = "home"; this.session.reset(); this.render(); }
  exitPrompt() { this.session.stopTimer(); this.stage = "exit-confirm"; this.render(); }
  continue() { this.beginLive(); }
  home() { this.stage = "home"; this.session.reset(); this.render(); }
}
