// Fuente: docs/ONTOLOGY.md (nodos `Position` y `Technique`, globales para todos los usuarios).
// Si cambia la ontología, actualizar también mobile/src/constants/ontology.ts.

export const POSITIONS = [
  "Standing",
  "Closed Guard",
  "Half Guard",
  "Open Guard",
  "De La Riva",
  "Side Control (Top)",
  "Mount (Top)",
  "Back Control",
  "Side Control (Bottom)",
  "Mount (Bottom)",
] as const;

export const TECHNIQUES = [
  // Derribos
  "Double Leg",
  "Single Leg",
  "Judo Throw",
  // Pases de guardia
  "Torreando",
  "Knee Slice",
  "Body Lock",
  // Raspadas
  "Scissor Sweep",
  "Hip Bump Sweep",
  "Flower Sweep",
  // Sumisiones
  "Armbar",
  "Triangle",
  "Guillotine",
  "Kimura",
  "Rear Naked Choke",
  "Heel Hook",
  // Escapes / defensas
  "Bridge & Roll",
  "Shrimp Escape",
  "Guard Retention",
] as const;

export type PositionName = (typeof POSITIONS)[number];
export type TechniqueName = (typeof TECHNIQUES)[number];
