import type { ReactionResult, TrainingCue } from "../../types/training";
import { PitchIQCameraEngine } from "../../services/cameraService";
import { summarizeSession } from "../../game/scoringEngine";

export class CameraReactionController {
  private engine: PitchIQCameraEngine;
  private cues: TrainingCue[];
  private results: ReactionResult[] = [];
  private cueIndex = 0;

  constructor(engine:PitchIQCameraEngine, cues:TrainingCue[]) {
    this.engine = engine;
    this.cues = cues;
  }

  getResults() { return this.results; }
  getSummary() { return summarizeSession(this.results); }

  nextCue() {
    const cue = this.cues[this.cueIndex % this.cues.length];
    this.cueIndex++;
    this.engine.beginCue(cue);
    return cue;
  }

  recordResult(result:ReactionResult) { this.results.push(result); }
  reset() { this.results = []; this.cueIndex = 0; }
}
