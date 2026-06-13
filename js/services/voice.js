import { scoreVoiceAnswer } from "../game/scoring.js";

export class PitchIQVoiceEngine {
  constructor(callbacks = {}, continuous = true){
    this.callbacks = callbacks; this.continuous = continuous; this.recognition = null; this.activeCue = null;
  }
  isSupported(){ return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition); }
  start(cue){
    this.activeCue = cue;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ this.callbacks.onStatus?.("not-supported"); return false; }
    this.stop(); this.activeCue = cue;
    this.recognition = new SR();
    this.recognition.lang = "en-AU"; this.recognition.continuous = this.continuous; this.recognition.interimResults = false; this.recognition.maxAlternatives = 3;
    this.recognition.onstart = ()=>this.callbacks.onStatus?.("listening");
    this.recognition.onresult = (event)=>{
      const last = event.results[event.results.length-1];
      const transcript = last[0]?.transcript?.toLowerCase().trim() || "";
      this.callbacks.onTranscript?.(transcript);
      if(!this.activeCue) return;
      const scored = scoreVoiceAnswer(this.activeCue, transcript);
      this.callbacks.onResult?.({ cueId:this.activeCue.id, transcript, correct:scored.correct, matchedResponse:scored.matchedResponse, xpAwarded:scored.xpAwarded, timestamp:Date.now() });
      this.callbacks.onStatus?.("recognized");
    };
    this.recognition.onerror = (e)=>{ this.callbacks.onStatus?.("error"); this.callbacks.onError?.(new Error(e.error)); };
    this.recognition.onend = ()=>{ if(this.continuous && this.activeCue){ try{ this.recognition.start(); }catch{} } };
    try{ this.recognition.start(); return true; }catch(err){ this.callbacks.onError?.(err); this.callbacks.onStatus?.("error"); return false; }
  }
  updateCue(cue){ this.activeCue = cue; }
  stop(){ this.activeCue = null; try{ this.recognition?.stop(); }catch{} this.recognition = null; this.callbacks.onStatus?.("idle"); }
}