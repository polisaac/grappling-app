import type { Modality, ScrambleResult } from "@/types/log";

export const MODALITY_LABELS: Record<Modality, string> = {
  GI: "Gi",
  NO_GI: "No Gi",
  JUDO: "Judo",
  SAMBO: "Sambo",
};

export const SCRAMBLE_RESULT_LABELS: Record<ScrambleResult, string> = {
  IN_FAVOR: "A favor",
  AGAINST: "En contra",
  FAILED: "Fallido",
};
