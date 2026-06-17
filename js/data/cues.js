export const CORE_CUES = [
  { id:"red", type:"colour", label:"Red", acceptedResponses:["red"], display:"🔴", xpBase:3 },
  { id:"blue", type:"colour", label:"Blue", acceptedResponses:["blue"], display:"🔵", xpBase:3 },
  { id:"left", type:"direction", label:"Left", acceptedResponses:["left"], display:"←", xpBase:4 },
  { id:"right", type:"direction", label:"Right", acceptedResponses:["right"], display:"→", xpBase:4 },
  { id:"check", type:"scan", label:"Check", acceptedResponses:["check","scan"], display:"CHECK", xpBase:4 },
  { id:"turn", type:"command", label:"Turn", acceptedResponses:["turn"], display:"TURN", xpBase:4 },
  { id:"drive", type:"command", label:"Drive", acceptedResponses:["drive"], display:"DRIVE", xpBase:4 },
  { id:"math-five", type:"math", label:"8 minus 3", acceptedResponses:["5","five"], display:"8 - 3", xpBase:5 },
  { id:"math-four", type:"math", label:"7 minus 3", acceptedResponses:["4","four"], display:"7 - 3", xpBase:5 },
  { id:"math-seven", type:"math", label:"4 plus 3", acceptedResponses:["7","seven"], display:"4 + 3", xpBase:5 }
];

export function getCue(id){ return CORE_CUES.find(c => c.id === id) || CORE_CUES[0]; }
