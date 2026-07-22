export const HOME_WORLDS = Object.freeze([
  {
    id: "academy",
    title: "Academy",
    purpose: "Your pathway and today's plan",
    icon: "✦",
    badge: "Your journey",
    modules: [
      { id:"academy-journey", title:"Academy Journey", description:"Pathways, weekly plans and unlocks", icon:"◆", route:"academy-world" },
      { id:"coach-intelligence", title:"Coach Intelligence", description:"Your next best action, explained", icon:"✦", route:"coach-world" },
    ],
  },
  {
    id: "train",
    title: "Train",
    purpose: "Build your football skills and IQ",
    icon: "⚽",
    badge: "3 training areas",
    modules: [
      { id:"football-iq", title:"Football IQ", description:"See, scan and decide earlier", icon:"◉", route:"football-iq-library" },
      { id:"technical-training", title:"Technical Training", description:"Build touch, control and ball mastery", icon:"⚽", route:"training" },
      { id:"mindiq", title:"MindIQ", description:"Build confidence, focus and resilience", icon:"◇", route:"mindiq-world" },
    ],
  },
  {
    id: "review",
    title: "Review",
    purpose: "See progress and learn from every session",
    icon: "▮▮▮",
    badge: "Development insights",
    modules: [
      { id:"player-twin", title:"Player Twin", description:"See how your development is changing", icon:"◈", route:"player-twin" },
      { id:"reflect", title:"Reflect", description:"Turn every session into learning", icon:"◎", route:"reflect-world" },
      { id:"progress", title:"Progress", description:"Track development and milestones", icon:"↗", route:"results" },
      { id:"training-stats", title:"Training Stats", description:"Review your detailed training data", icon:"⌁", route:"results" },
    ],
  },
  {
    id: "lab",
    title: "Lab",
    purpose: "Explore new tools and early access",
    icon: "⚗",
    badge: "Experimental",
    modules: [
      { id:"auto-juggler", title:"Auto Juggler", description:"AI-powered ball tracking and juggling analysis", icon:"⚗", route:"lab-juggling" },
      { id:"calmsense", title:"CalmSense", description:"Measure breathing rhythm with your phone", icon:"◌", route:"lab-calmsense" },
      { id:"vibro-focus", title:"Vibro Focus", description:"Test calm, focus and recovery vibration patterns", icon:"≋", route:"lab-vibro-focus" },
    ],
  },
]);

export function findHomeWorld(worldId) {
  return HOME_WORLDS.find(world => world.id === worldId) || null;
}
