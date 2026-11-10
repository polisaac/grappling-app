import type { ScrambleResult } from "../generated/prisma/client";
import type { PositionName, TechniqueName } from "../ontology";

// Árbol de Habilidades (Neo4j) - docs/ONTOLOGY.md.
// MOCK: todavía NO se conecta a Neo4j. `log.service` depende de la interfaz `GraphService`,
// así que reemplazar el mock por la implementación real no requiere tocar el resto del código.

export interface GraphScramble {
  position: string;
  technique: string | null;
  result: ScrambleResult;
}

export interface RecordScramblesInput {
  userId: string;
  logId: string;
  date: Date;
  scrambles: GraphScramble[];
}

// Agregado de aristas `ATTEMPTED_TECHNIQUE` de un usuario: (Position)-[:ATTEMPTED_TECHNIQUE]->(Technique)
// con el conteo de SUCCESS / FAILURE. Es lo que devolvería una consulta de Neo4j; los porcentajes
// y los colores los calcula `skills.service`, no el grafo.
export interface AttemptAggregate {
  position: PositionName;
  technique: TechniqueName;
  successes: number;
  failures: number;
}

// Agregado de aristas `TRANSITIONED_TO`: (Technique)-[:TRANSITIONED_TO]->(Position).
export interface TransitionAggregate {
  technique: TechniqueName;
  toPosition: PositionName;
  context: "AFTER_SUCCESS" | "AFTER_FAILURE";
  count: number;
}

export interface SkillGraphAggregates {
  attempts: AttemptAggregate[];
  transitions: TransitionAggregate[];
}

export interface GraphService {
  // Debe lanzar si no puede actualizar el grafo: `log.service` ejecuta esta llamada dentro de la
  // transacción de Postgres, por lo que un fallo revierte el guardado (F02, casos de error).
  recordScrambles(input: RecordScramblesInput): Promise<void>;
  // Aristas del usuario ya agregadas (F04). Un usuario sin scrambles devuelve listas vacías.
  getSkillGraph(userId: string): Promise<SkillGraphAggregates>;
}

// La ontología solo define SUCCESS / FAILURE para `ATTEMPTED_TECHNIQUE`.
// SUPUESTO (pendiente de definir en la spec): "En contra" cuenta como FAILURE.
export function toGraphResult(result: ScrambleResult): "SUCCESS" | "FAILURE" {
  return result === "IN_FAVOR" ? "SUCCESS" : "FAILURE";
}

class MockGraphService implements GraphService {
  async recordScrambles(input: RecordScramblesInput): Promise<void> {
    console.info(
      `[graph:mock] ${input.scrambles.length} scramble(s) de la bitácora ${input.logId} (no se escribió en Neo4j)`,
    );
  }

  // MOCK: datos fijos, iguales para todos los usuarios, solo para poder construir y probar la
  // pantalla del árbol. No refleja las bitácoras guardadas. Cubre los tres estados de color:
  // fortaleza (>70% éxito), en desarrollo (40-70%) y debilidad (>60% fallo).
  async getSkillGraph(_userId: string): Promise<SkillGraphAggregates> {
    return {
      attempts: [
        // Pase de guardia (técnicas de "Pases" de la ontología) contra una guardia abierta.
        { position: "Open Guard", technique: "Torreando", successes: 6, failures: 1 },
        { position: "Open Guard", technique: "Knee Slice", successes: 3, failures: 3 },
        { position: "Open Guard", technique: "Body Lock", successes: 1, failures: 5 },
        { position: "Closed Guard", technique: "Triangle", successes: 8, failures: 2 },
        { position: "Closed Guard", technique: "Scissor Sweep", successes: 5, failures: 4 },
        { position: "Closed Guard", technique: "Guillotine", successes: 1, failures: 4 },
        { position: "Mount (Top)", technique: "Armbar", successes: 4, failures: 1 },
        { position: "Mount (Top)", technique: "Kimura", successes: 3, failures: 2 },
      ],
      transitions: [
        { technique: "Body Lock", toPosition: "Closed Guard", context: "AFTER_FAILURE", count: 5 },
        { technique: "Scissor Sweep", toPosition: "Mount (Top)", context: "AFTER_SUCCESS", count: 5 },
      ],
    };
  }
}

export const graphService: GraphService = new MockGraphService();

/*
 * IMPLEMENTACIÓN REAL (pendiente) - requiere `neo4j-driver` (ya instalado) y NEO4J_URI/USER/PASSWORD en config/env.ts.
 *
 * import neo4j from "neo4j-driver";
 *
 * const driver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD));
 *
 * class Neo4jGraphService implements GraphService {
 *   async recordScrambles({ userId, date, scrambles }: RecordScramblesInput): Promise<void> {
 *     const session = driver.session();
 *     try {
 *       await session.executeWrite(async (tx) => {
 *         for (const s of scrambles) {
 *           // Los nodos Position/Technique son globales (precargados); solo se crea la arista del usuario.
 *           await tx.run(
 *             `MATCH (p:Position {name: $position})
 *              MATCH (t:Technique {name: $technique})
 *              CREATE (p)-[:ATTEMPTED_TECHNIQUE {userId: $userId, result: $result, date: datetime($date)}]->(t)`,
 *             { position: s.position, technique: s.technique, userId, result: toGraphResult(s.result), date: date.toISOString() },
 *           );
 *         }
 *       });
 *     } finally {
 *       await session.close();
 *     }
 *   }
 * }
 *
 * Nota: las aristas TRANSITIONED_TO (posición resultante) no se pueden crear aún porque F02 no
 * captura la posición final del scramble.
 */
