import type { SkillGraph, SkillNode, SkillStatus, TransitionContext } from "@/types/skills";

// Layout por columnas: cada Posición encabeza una columna y sus Técnicas se apilan debajo.
//  - Posición -> Técnica (ATTEMPTED_TECHNIQUE): codo por un carril a la izquierda de la columna;
//    cada técnica usa un carril distinto para que las líneas no se solapen ni se crucen.
//  - Técnica -> Posición (TRANSITIONED_TO): curva en S con flecha hacia la posición resultante.
// Las coordenadas están en el espacio del viewBox del SVG; el componente solo las escala.

export const NODE_W = 104;
export const NODE_H = 56;
const COL_GAP = 36;
const PAD_X = 20;
const PAD_Y = 16;
const POSITION_Y = PAD_Y;
const TECHNIQUE_START_Y = POSITION_Y + NODE_H + 28;
const TECHNIQUE_STEP = NODE_H + 16;
const LANE_BASE = 4;
const LANE_STEP = 4;
const LANE_MAX = 16;
const ARROW_LENGTH = 8;
const ARROW_HALF_WIDTH = 4;

export interface PlacedNode {
  node: SkillNode;
  x: number;
  y: number;
  lines: string[];
}

export interface PlacedAttemptEdge {
  id: string;
  path: string;
  status: SkillStatus;
}

export interface PlacedTransitionEdge {
  id: string;
  path: string;
  arrowPoints: string;
  context: TransitionContext;
}

export interface SkillLayout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  attempts: PlacedAttemptEdge[];
  transitions: PlacedTransitionEdge[];
}

// Parte nombres largos en dos líneas por el espacio más cercano al centro.
export function splitName(name: string): string[] {
  if (name.length <= 12) {
    return [name];
  }
  const middle = name.length / 2;
  let best = -1;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === " " && (best === -1 || Math.abs(i - middle) < Math.abs(best - middle))) {
      best = i;
    }
  }
  return best === -1 ? [name] : [name.slice(0, best), name.slice(best + 1)];
}

export function buildSkillLayout(graph: SkillGraph): SkillLayout {
  const placed = new Map<string, PlacedNode>();
  const nodes: PlacedNode[] = [];
  const attempts: PlacedAttemptEdge[] = [];
  const transitions: PlacedTransitionEdge[] = [];

  const positions = graph.nodes.filter((node) => node.type === "POSITION");
  const techniqueById = new Map<string, SkillNode>();
  for (const node of graph.nodes) {
    if (node.type === "TECHNIQUE") {
      techniqueById.set(node.id, node);
    }
  }

  const place = (node: SkillNode, x: number, y: number): PlacedNode => {
    const item: PlacedNode = { node, x, y, lines: splitName(node.name) };
    placed.set(node.id, item);
    nodes.push(item);
    return item;
  };

  const rowsPerPosition = new Map<string, number>();
  positions.forEach((position, column) => {
    place(position, PAD_X + column * (NODE_W + COL_GAP), POSITION_Y);
    rowsPerPosition.set(position.id, 0);
  });

  for (const edge of graph.edges) {
    if (edge.type !== "ATTEMPTED_TECHNIQUE") {
      continue;
    }
    const origin = placed.get(edge.source);
    const technique = techniqueById.get(edge.target);
    // Una técnica solo se dibuja una vez (bajo la primera posición desde la que se intentó).
    if (!origin || !technique || placed.has(technique.id)) {
      continue;
    }

    const row = rowsPerPosition.get(edge.source) ?? 0;
    rowsPerPosition.set(edge.source, row + 1);

    const target = place(technique, origin.x, TECHNIQUE_START_Y + row * TECHNIQUE_STEP);
    const laneX = origin.x - Math.min(LANE_BASE + LANE_STEP * row, LANE_MAX);
    const fromY = origin.y + NODE_H / 2;
    const toY = target.y + NODE_H / 2;
    attempts.push({
      id: edge.id,
      path: `M ${origin.x} ${fromY} H ${laneX} V ${toY} H ${target.x}`,
      status: edge.status,
    });
  }

  for (const edge of graph.edges) {
    if (edge.type !== "TRANSITIONED_TO") {
      continue;
    }
    const from = placed.get(edge.source);
    const to = placed.get(edge.target);
    // Mismo nodo o misma columna: un bucle sobre sí misma no aporta nada, no se dibuja.
    if (!from || !to || from.x === to.x) {
      continue;
    }

    const direction = to.x > from.x ? 1 : -1;
    const x1 = direction > 0 ? from.x + NODE_W : from.x;
    const y1 = from.y + NODE_H / 2;
    const x2 = direction > 0 ? to.x : to.x + NODE_W;
    const y2 = to.y + NODE_H / 2;
    const midX = (x1 + x2) / 2;
    const baseX = x2 - direction * ARROW_LENGTH;
    transitions.push({
      id: edge.id,
      context: edge.context,
      path: `M ${x1} ${y1} C ${midX} ${y1} ${midX} ${y2} ${x2} ${y2}`,
      arrowPoints: `${x2},${y2} ${baseX},${y2 - ARROW_HALF_WIDTH} ${baseX},${y2 + ARROW_HALF_WIDTH}`,
    });
  }

  const columns = Math.max(positions.length, 1);
  const width = PAD_X * 2 + columns * NODE_W + (columns - 1) * COL_GAP;
  const height = nodes.reduce((max, item) => Math.max(max, item.y + NODE_H), 0) + PAD_Y;

  return { width, height, nodes, attempts, transitions };
}
