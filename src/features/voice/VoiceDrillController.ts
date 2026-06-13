import type { TrainingCue } from "../../types/training";
import { PitchIQVoiceEngine } from "../../services/voiceService";

export class VoiceDrillController {
  private engine: PitchIQVoiceEngine;
  private cues: TrainingCue[];
  private cueIndex = 0;
  private xp = 0;
  private correct = 0;
  private attempts = 0;

  constructor(engine:PitchIQVoiceEngine, cues:TrainingCue[]) {
    this.engine = engine;
    this.cues = cues;
  }

  nextCue() {
    const cue = this.cues[this.cueIndex % this.cues.length];
    this.cueIndex++;
    this.engine.updateCue(cue);
    return cue;
  }

  start() {
    const cue = this.nextCue();
    return this.engine.start(cue);
  }

  stop() { this.engine.stop(); }

  recordResult(result:{correct:boolean; xpAwarded:number}) {
    this.attempts++;
    if (result.correct) this.correct++;
    this.xp += result.xpAwarded;
  }

  summary() {
    return { attempts:this.attempts, correct:this.correct, accuracy:this.attempts ? Math.round((this.correct/this.attempts)*100) : 0, xp:this.xp };
  }
}
