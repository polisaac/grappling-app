// Fuente: docs/ONTOLOGY.md. Debe coincidir con backend/src/ontology/index.ts
// (el backend rechaza cualquier valor que no esté en su lista).

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
  "Double Leg",
  "Single Leg",
  "Judo Throw",
  "Torreando",
  "Knee Slice",
  "Body Lock",
  "Scissor Sweep",
  "Hip Bump Sweep",
  "Flower Sweep",
  "Armbar",
  "Triangle",
  "Guillotine",
  "Kimura",
  "Rear Naked Choke",
  "Heel Hook",
  "Bridge & Roll",
  "Shrimp Escape",
  "Guard Retention",
] as const;

export type Position = (typeof POSITIONS)[number];
export type Technique = (typeof TECHNIQUES)[number];
