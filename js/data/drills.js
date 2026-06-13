export const DRILLS = [
  { id:"colour-scan", name:"Colour Scan", type:"colour", positions:["ALL"], seconds:45, cuePool:["red","blue"], difficulty:1 },
  { id:"left-right-react", name:"Left / Right React", type:"direction", positions:["ALL"], seconds:45, cuePool:["left","right"], difficulty:1 },
  { id:"shoulder-check", name:"Shoulder Check", type:"scan", positions:["CB","CDM","CM","Winger"], seconds:40, cuePool:["check","turn"], difficulty:2 },
  { id:"winger-drive", name:"Winger Drive", type:"position", positions:["Winger","FB"], seconds:45, cuePool:["drive","left","right","check"], difficulty:2 },
  { id:"striker-trigger", name:"Striker Trigger", type:"position", positions:["Striker","CAM"], seconds:45, cuePool:["drive","turn","red","blue"], difficulty:2 },
  { id:"cb-scan-clear", name:"CB Scan & Clear", type:"position", positions:["CB"], seconds:50, cuePool:["check","turn","left","right"], difficulty:2 },
  { id:"midfield-picture", name:"Midfield Picture", type:"decision", positions:["CM","CDM","CAM"], seconds:50, cuePool:["check","math-five","left","right"], difficulty:3 },
  { id:"math-pressure", name:"Pressure Maths", type:"math", positions:["ALL"], seconds:40, cuePool:["math-five","math-four","math-seven"], difficulty:3 },
  { id:"audio-only", name:"Audio Only", type:"voice", positions:["ALL"], seconds:40, cuePool:["red","blue","left","right","check"], difficulty:3 },
  { id:"camera-burst", name:"Camera Burst", type:"camera", positions:["ALL"], seconds:30, cuePool:["left","right","check","turn"], difficulty:2 },
  { id:"reaction-ladder", name:"Reaction Ladder", type:"mixed", positions:["ALL"], seconds:60, cuePool:["red","blue","left","right","check","drive"], difficulty:4 },
  { id:"composure-combo", name:"Composure Combo", type:"mixed", positions:["ALL"], seconds:60, cuePool:["red","blue","left","right","math-five"], difficulty:4 },
  { id:"gk-set", name:"GK Set Position", type:"position", positions:["GK"], seconds:45, cuePool:["left","right","red","blue"], difficulty:2 },
  { id:"fullback-overlap", name:"Fullback Overlap", type:"position", positions:["FB"], seconds:45, cuePool:["drive","right","left","check"], difficulty:2 },
  { id:"cam-between-lines", name:"CAM Between Lines", type:"position", positions:["CAM"], seconds:50, cuePool:["turn","drive","check","math-five"], difficulty:3 },
  { id:"elite-chaos", name:"Elite Chaos", type:"mixed", positions:["ALL"], seconds:75, cuePool:["red","blue","left","right","check","turn","drive","math-five","math-four"], difficulty:5 }
];

export function recommendedDrills(position="Winger"){
  return DRILLS.filter(d => d.positions.includes("ALL") || d.positions.includes(position));
}
