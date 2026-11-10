import { logRepository } from "../repositories/log.repository";
import type { TrainingLogWithScrambles } from "../repositories/log.repository";
import { graphService } from "./graph.service";
import type { CreateLogInput } from "./log.schemas";

export const logService = {
  // F02 pasos 7-8: guarda en Postgres y actualiza el grafo. Ambos pasos son atómicos:
  // si el grafo falla, la transacción de Postgres se revierte.
  async create(userId: string, input: CreateLogInput): Promise<TrainingLogWithScrambles> {
    return logRepository.create({ userId, ...input }, async (log) => {
      if (log.scrambles.length === 0) {
        return;
      }
      await graphService.recordScrambles({
        userId,
        logId: log.id,
        date: log.trainedAt,
        scrambles: log.scrambles.map((scramble) => ({
          position: scramble.position,
          technique: scramble.technique,
          result: scramble.result,
        })),
      });
    });
  },
};
