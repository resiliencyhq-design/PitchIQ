export type CueType = "colour" | "direction" | "scan" | "math" | "command";
export type TrainingCue = { id:string; type:CueType; label:string; acceptedResponses:string[]; display:string; xpBase:number; };
export type ReactionResult = { cueId:string; reactionMs:number|null; detected:boolean; correct:boolean; xpAwarded:number; timestamp:number; };
export type CameraMode = "user" | "environment";
export type CameraEngineStatus = "idle"|"permission-needed"|"ready"|"countdown"|"cue-active"|"detected"|"missed"|"error";
export type VoiceEngineStatus = "idle"|"permission-needed"|"listening"|"recognized"|"not-supported"|"error";
