import type { PositionName, TechniqueName } from "../ontology";
import { graphService } from "./graph.service";
import type { GraphService, SkillGraphAggregates } from "./graph.service";

// F04 / docs/ONTOLOGY.md §3: el backend calcula los pesos antes de llegar al móvil.
//  - STRONG (verde):      éxito > 70%
//  - WEAK (rojo):         fallo > 60%
//  - DEVELOPING (neutro): el resto (éxito entre 40% y 70%)
export type SkillStatus = "STRONG" | "DEVELOPING" | "WEAK";

export interface SkillNode {
  id: string;
  type: "POSITION" | "TECHNIQUE";
  name: PositionName | TechniqueName;
  attempts: number;
  successes: number;
  failures: number;
  // Porcentaje entero 0-100. `null` si el nodo aún no tiene intentos propios.
  successRate: number | null;
  status: SkillStatus | null;
}

export interface AttemptEdge {
  id: string;
  type: "ATTEMPTED_TECHNIQUE";
  source: string; // id de la Position
  target: string; // id de la Technique
  attempts: number;
  successes: number;
  failures: number;
  successRate: number;
  status: SkillStatus;
}

export interface TransitionEdge {
  id: string;
  type: "TRANSITIONED_TO";
  source: string; // id de la Technique
  target: string; // id de la Position resultante
  context: "AFTER_SUCCESS" | "AFTER_FAILURE";
  count: number;
}

export type SkillEdge = AttemptEdge | TransitionEdge;

export interface SkillGraph {
  nodes: SkillNode[];
  edges: SkillEdge[];
}

interface Counts {
  successes: number;
  failures: number;
}

const positionId = (name: PositionName): string => `position:${name}`;
const techniqueId = (name: TechniqueName): string => `technique:${name}`;

export function classify({ successes, failures }: Counts): { successRate: number; status: SkillStatus } {
  const attempts = successes + failures;
  // Comparaciones con enteros para evitar errores de coma flotante en los umbrales exactos.
  let status: SkillStatus = "DEVELOPING";
  if (successes * 100 > attempts * 70) {
    status = "STRONG";
  } else if (failures * 100 > attempts * 60) {
    status = "WEAK";
  }
  return { successRate: Math.round((successes * 100) / attempts), status };
}

export function buildSkillGraph({ attempts, transitions }: SkillGraphAggregates): SkillGraph {
  const positionTotals = new Map<PositionName, Counts>();
  const techniqueTotals = new Map<TechniqueName, Counts>();
  const edges: SkillEdge[] = [];

  for (const { position, technique, successes, failures } of attempts) {
    const total = successes + failures;
    if (total === 0) {
      continue;
    }

    const byPosition = positionTotals.get(position) ?? { successes: 0, failures: 0 };
    positionTotals.set(position, {
      successes: byPosition.successes + successes,
      failures: byPosition.failures + failures,
    });
    const byTechnique = techniqueTotals.get(technique) ?? { successes: 0, failures: 0 };
    techniqueTotals.set(technique, {
      successes: byTechnique.successes + successes,
      failures: byTechnique.failures + failures,
    });

    edges.push({
      id: `attempt:${position}|${technique}`,
      type: "ATTEMPTED_TECHNIQUE",
      source: positionId(position),
      target: techniqueId(technique),
      attempts: total,
      successes,
      failures,
      ...classify({ successes, failures }),
    });
  }

  // Una transición puede apuntar a una posición sin intentos propios: se incluye como nodo sin métricas.
  const transitionTargets = new Set<PositionName>();
  for (const { technique, toPosition, context, count } of transitions) {
    if (!techniqueTotals.has(technique)) {
      continue; // sin intentos de esa técnica no hay nodo del que partir
    }
    transitionTargets.add(toPosition);
    edges.push({
      id: `transition:${technique}|${toPosition}|${context}`,
      type: "TRANSITIONED_TO",
      source: techniqueId(technique),
      target: positionId(toPosition),
      context,
      count,
    });
  }

  const nodes: SkillNode[] = [];
  const positions = new Set<PositionName>([...positionTotals.keys(), ...transitionTargets]);
  for (const name of positions) {
    nodes.push(toNode(positionId(name), "POSITION", name, positionTotals.get(name)));
  }
  for (const [name, counts] of techniqueTotals) {
    nodes.push(toNode(techniqueId(name), "TECHNIQUE", name, counts));
  }

  return { nodes, edges };
}

function toNode(
  id: string,
  type: SkillNode["type"],
  name: SkillNode["name"],
  counts: Counts | undefined,
): SkillNode {
  if (!counts) {
    return { id, type, name, attempts: 0, successes: 0, failures: 0, successRate: null, status: null };
  }
  return {
    id,
    type,
    name,
    attempts: counts.successes + counts.failures,
    successes: counts.successes,
    failures: counts.failures,
    ...classify(counts),
  };
}

export function createSkillsService(graph: GraphService) {
  return {
    async getMySkillGraph(userId: string): Promise<SkillGraph> {
      return buildSkillGraph(await graph.getSkillGraph(userId));
    },
  };
}

export const skillsService = createSkillsService(graphService);
