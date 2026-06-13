import { scoreReaction } from "../game/scoring.js";

export class PitchIQCameraEngine {
  constructor(video, canvas, callbacks = {}){
    this.video = video; this.canvas = canvas; this.callbacks = callbacks;
    this.ctx = canvas.getContext("2d", { willReadFrequently:true });
    this.stream = null; this.previousFrame = null; this.rafId = null; this.activeCue = null;
    this.waiting = false; this.startedAt = 0; this.sensitivity = 24; this.timeoutId = null;
  }
  setSensitivity(value){ this.sensitivity = Math.max(8, Math.min(80, value)); }
  async start(mode="environment"){
    if(!navigator.mediaDevices?.getUserMedia) throw new Error("Camera API not supported");
    this.stop();
    this.callbacks.onStatus?.("permission-needed");
    this.stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:mode, width:{ideal:1280}, height:{ideal:720} }, audio:false });
    this.video.srcObject = this.stream;
    this.video.setAttribute("playsinline","true"); this.video.muted = true;
    await this.video.play();
    this.callbacks.onStatus?.("ready");
    this.loop();
  }
  stop(){
    if(this.rafId) cancelAnimationFrame(this.rafId);
    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.stream?.getTracks().forEach(t=>t.stop());
    this.stream = null; this.previousFrame = null; this.waiting = false;
    this.callbacks.onStatus?.("idle");
  }
  beginCue(cue, timeoutMs=2500){
    this.activeCue = cue; this.startedAt = performance.now(); this.waiting = true;
    this.callbacks.onStatus?.("cue-active");
    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(()=>{
      if(!this.waiting || !this.activeCue) return;
      this.waiting = false;
      const result = { cueId:this.activeCue.id, reactionMs:null, detected:false, correct:false, xpAwarded:0, timestamp:Date.now() };
      this.callbacks.onStatus?.("missed"); this.callbacks.onResult?.(result);
    }, timeoutMs);
  }
  loop(){
    const w=160,h=90; this.canvas.width=w; this.canvas.height=h;
    const step=()=>{
      if(this.video.readyState >= 2){
        this.ctx.drawImage(this.video,0,0,w,h);
        const frame = this.ctx.getImageData(0,0,w,h);
        const motion = this.motion(frame.data);
        this.callbacks.onMotionScore?.(motion);
        if(this.waiting && this.activeCue && motion > this.sensitivity && performance.now()-this.startedAt > 120) this.detected();
        this.previousFrame = new Uint8ClampedArray(frame.data);
      }
      this.rafId = requestAnimationFrame(step);
    };
    step();
  }
  motion(data){
    if(!this.previousFrame) return 0;
    let total=0,n=0;
    for(let i=0;i<data.length;i+=16){
      total += (Math.abs(data[i]-this.previousFrame[i]) + Math.abs(data[i+1]-this.previousFrame[i+1]) + Math.abs(data[i+2]-this.previousFrame[i+2]))/3;
      n++;
    }
    return total/n;
  }
  detected(){
    if(!this.activeCue) return;
    this.waiting = false; if(this.timeoutId) clearTimeout(this.timeoutId);
    const reactionMs = Math.round(performance.now()-this.startedAt);
    const result = { cueId:this.activeCue.id, reactionMs, detected:true, correct:true, xpAwarded:scoreReaction(reactionMs,true), timestamp:Date.now() };
    this.callbacks.onStatus?.("detected"); this.callbacks.onResult?.(result);
  }
}