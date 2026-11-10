import type { Modality, ScrambleResult } from "@/types/log";

// Contrato de GET /api/feed (backend F03).

export interface FeedScramble {
  id: string;
  position: string;
  technique: string | null;
  result: ScrambleResult;
  order: number;
}

export interface FeedAuthor {
  id: string;
  name: string;
}

export interface FeedLog {
  id: string;
  trainedAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  modality: Modality;
  location: string | null;
  satisfaction: number | null; // 1 a 5
  note: string | null;
  user: FeedAuthor;
  scrambles: FeedScramble[];
}

// F06: "for-you" es el feed global ("Para ti"); "following" solo muestra a quienes sigo.
export type FeedTab = "for-you" | "following";

export interface FeedPage {
  items: FeedLog[];
  nextCursor: string | null;
}
