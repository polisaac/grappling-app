import type { Position, Technique } from "@/constants/ontology";

// Contrato de POST /api/logs (backend F02).

export type Modality = "GI" | "NO_GI" | "JUDO" | "SAMBO";
export type ScrambleResult = "IN_FAVOR" | "AGAINST" | "FAILED";

export interface ScramblePayload {
  position: Position;
  technique: Technique | null;
  result: ScrambleResult;
}

export interface CreateLogPayload {
  trainedAt: string; // ISO 8601
  modality: Modality;
  location: string | null;
  satisfaction: number | null; // 1 a 5
  note: string | null;
  scrambles: ScramblePayload[];
}

export interface CreatedLog {
  id: string;
}
