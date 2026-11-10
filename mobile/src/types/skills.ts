// Contrato de GET /api/skills/me (backend/src/services/skills.service.ts).

export type SkillStatus = "STRONG" | "DEVELOPING" | "WEAK";
export type SkillNodeType = "POSITION" | "TECHNIQUE";
export type TransitionContext = "AFTER_SUCCESS" | "AFTER_FAILURE";

export interface SkillNode {
  id: string;
  type: SkillNodeType;
  name: string;
  attempts: number;
  successes: number;
  failures: number;
  // Porcentaje entero 0-100; null si el nodo aún no tiene intentos propios.
  successRate: number | null;
  status: SkillStatus | null;
}

export interface AttemptEdge {
  id: string;
  type: "ATTEMPTED_TECHNIQUE";
  source: string;
  target: string;
  attempts: number;
  successes: number;
  failures: number;
  successRate: number;
  status: SkillStatus;
}

export interface TransitionEdge {
  id: string;
  type: "TRANSITIONED_TO";
  source: string;
  target: string;
  context: TransitionContext;
  count: number;
}

export type SkillEdge = AttemptEdge | TransitionEdge;

export interface SkillGraph {
  nodes: SkillNode[];
  edges: SkillEdge[];
}
