import type { CameraEngineStatus, CameraMode, ReactionResult, TrainingCue } from "../types/training";
import { scoreReaction } from "../game/scoringEngine";

type CameraCallbacks = {
  onStatus?: (status:CameraEngineStatus)=>void;
  onMotionScore?: (score:number)=>void;
  onResult?: (result:ReactionResult)=>void;
  onError?: (error:Error)=>void;
};

export class PitchIQCameraEngine {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stream: MediaStream | null = null;
  private previousFrame: Uint8ClampedArray | null = null;
  private rafId: number | null = null;
  private cueStartedAt = 0;
  private activeCue: TrainingCue | null = null;
  private waitingForMovement = false;
  private sensitivity = 24;
  private timeoutId: number | null = null;
  private callbacks: CameraCallbacks;

  constructor(video:HTMLVideoElement, canvas:HTMLCanvasElement, callbacks:CameraCallbacks = {}) {
    this.video = video;
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas context unavailable");
    this.ctx = ctx;
    this.callbacks = callbacks;
  }

  setSensitivity(value:number) { this.sensitivity = Math.max(8, Math.min(80, value)); }

  async start(mode:CameraMode = "environment") {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera API not supported");
    this.stop();
    try {
      this.callbacks.onStatus?.("permission-needed");
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.video.srcObject = this.stream;
      this.video.setAttribute("playsinline", "true");
      this.video.muted = true;
      await this.video.play();
      this.callbacks.onStatus?.("ready");
      this.startFrameLoop();
    } catch (error) {
      this.callbacks.onStatus?.("error");
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.timeoutId) window.clearTimeout(this.timeoutId);
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.rafId = null;
    this.previousFrame = null;
    this.waitingForMovement = false;
    this.callbacks.onStatus?.("idle");
  }

  beginCue(cue:TrainingCue, timeoutMs = 2500) {
    this.activeCue = cue;
    this.cueStartedAt = performance.now();
    this.waitingForMovement = true;
    this.callbacks.onStatus?.("cue-active");
    if (this.timeoutId) window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      if (!this.waitingForMovement || !this.activeCue) return;
      this.waitingForMovement = false;
      const result:ReactionResult = { cueId:this.activeCue.id, reactionMs:null, detected:false, correct:false, xpAwarded:0, timestamp:Date.now() };
      this.callbacks.onStatus?.("missed");
      this.callbacks.onResult?.(result);
    }, timeoutMs);
  }

  private startFrameLoop() {
    const width = 160, height = 90;
    this.canvas.width = width; this.canvas.height = height;
    const loop = () => {
      if (this.video.readyState >= 2) {
        this.ctx.drawImage(this.video, 0, 0, width, height);
        const frame = this.ctx.getImageData(0, 0, width, height);
        const motionScore = this.calculateMotion(frame.data);
        this.callbacks.onMotionScore?.(motionScore);
        if (this.waitingForMovement && this.activeCue && motionScore > this.sensitivity && performance.now() - this.cueStartedAt > 120) {
          this.handleMovementDetected();
        }
        this.previousFrame = new Uint8ClampedArray(frame.data);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private calculateMotion(data:Uint8ClampedArray) {
    if (!this.previousFrame) return 0;
    let totalDiff = 0, samples = 0;
    for (let i=0; i<data.length; i+=16) {
      totalDiff += (Math.abs(data[i]-this.previousFrame[i]) + Math.abs(data[i+1]-this.previousFrame[i+1]) + Math.abs(data[i+2]-this.previousFrame[i+2])) / 3;
      samples++;
    }
    return totalDiff / samples;
  }

  private handleMovementDetected() {
    if (!this.activeCue) return;
    this.waitingForMovement = false;
    if (this.timeoutId) window.clearTimeout(this.timeoutId);
    const reactionMs = Math.round(performance.now() - this.cueStartedAt);
    const xpAwarded = scoreReaction(reactionMs, true);
    const result:ReactionResult = { cueId:this.activeCue.id, reactionMs, detected:true, correct:true, xpAwarded, timestamp:Date.now() };
    this.callbacks.onStatus?.("detected");
    this.callbacks.onResult?.(result);
  }
}
