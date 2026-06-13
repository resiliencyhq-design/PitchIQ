import type { TrainingCue, VoiceEngineStatus } from "../types/training";
import { scoreVoiceAnswer } from "../game/scoringEngine";

type VoiceCallbacks = {
  onStatus?: (status:VoiceEngineStatus)=>void;
  onTranscript?: (transcript:string)=>void;
  onResult?: (result:{ cueId:string; transcript:string; correct:boolean; matchedResponse:string|null; xpAwarded:number; timestamp:number; })=>void;
  onError?: (error:Error)=>void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

export class PitchIQVoiceEngine {
  private recognition: SpeechRecognition | null = null;
  private activeCue: TrainingCue | null = null;
  private callbacks: VoiceCallbacks;
  private continuous: boolean;

  constructor(callbacks:VoiceCallbacks = {}, continuous = true) {
    this.callbacks = callbacks;
    this.continuous = continuous;
  }

  isSupported() { return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition); }

  start(cue:TrainingCue) {
    this.activeCue = cue;
    const SpeechRecognitionClass = (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined;
    if (!SpeechRecognitionClass) {
      this.callbacks.onStatus?.("not-supported");
      return false;
    }
    this.stop();
    this.activeCue = cue;
    this.recognition = new SpeechRecognitionClass();
    this.recognition.lang = "en-AU";
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;
    this.recognition.onstart = () => this.callbacks.onStatus?.("listening");
    this.recognition.onresult = (event:SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0]?.transcript?.toLowerCase().trim() ?? "";
      this.callbacks.onTranscript?.(transcript);
      if (!this.activeCue) return;
      const scored = scoreVoiceAnswer(this.activeCue, transcript);
      this.callbacks.onResult?.({ cueId:this.activeCue.id, transcript, correct:scored.correct, matchedResponse:scored.matchedResponse, xpAwarded:scored.xpAwarded, timestamp:Date.now() });
      this.callbacks.onStatus?.("recognized");
    };
    this.recognition.onerror = (event:SpeechRecognitionErrorEvent) => {
      this.callbacks.onStatus?.("error");
      this.callbacks.onError?.(new Error(event.error));
    };
    this.recognition.onend = () => {
      if (this.continuous && this.activeCue) {
        try { this.recognition?.start(); } catch {}
      }
    };
    try { this.recognition.start(); return true; }
    catch (error) { this.callbacks.onError?.(error as Error); this.callbacks.onStatus?.("error"); return false; }
  }

  updateCue(cue:TrainingCue) { this.activeCue = cue; }

  stop() {
    this.activeCue = null;
    try { this.recognition?.stop(); } catch {}
    this.recognition = null;
    this.callbacks.onStatus?.("idle");
  }
}
