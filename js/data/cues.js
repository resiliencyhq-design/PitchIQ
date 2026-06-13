export const CORE_CUES = [
  { id:"red", type:"colour", label:"Red", acceptedResponses:["red"], display:"🔴", xpBase:20 },
  { id:"blue", type:"colour", label:"Blue", acceptedResponses:["blue"], display:"🔵", xpBase:20 },
  { id:"left", type:"direction", label:"Left", acceptedResponses:["left"], display:"←", xpBase:25 },
  { id:"right", type:"direction", label:"Right", acceptedResponses:["right"], display:"→", xpBase:25 },
  { id:"check", type:"scan", label:"Check", acceptedResponses:["check","scan"], display:"CHECK", xpBase:30 },
  { id:"turn", type:"command", label:"Turn", acceptedResponses:["turn"], display:"TURN", xpBase:30 },
  { id:"drive", type:"command", label:"Drive", acceptedResponses:["drive"], display:"DRIVE", xpBase:30 },
  { id:"math-five", type:"math", label:"8 minus 3", acceptedResponses:["5","five"], display:"8 - 3", xpBase:35 }
];

export const POSITION_DRILLS = {
  CB: ["scan", "turn", "left", "right"],
  FB: ["left", "right", "drive", "check"],
  CDM: ["check", "turn", "math-five", "left"],
  CM: ["check", "red", "blue", "math-five"],
  CAM: ["drive", "turn", "red", "blue"],
  Winger: ["drive", "left", "right", "check"],
  Striker: ["drive", "turn", "red", "blue"],
  GK: ["left", "right", "red", "blue"]
};