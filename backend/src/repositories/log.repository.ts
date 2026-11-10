import { Prisma } from "../generated/prisma/client";
import type { Modality, ScrambleResult } from "../generated/prisma/client";
import { UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export type TrainingLogWithScrambles = Prisma.TrainingLogGetPayload<{
  include: { scrambles: true };
}>;

export interface CreateLogData {
  userId: string;
  trainedAt: Date;
  modality: Modality;
  location: string | null;
  satisfaction: number | null;
  note: string | null;
  scrambles: { position: string; technique: string | null; result: ScrambleResult }[];
}

export const logRepository = {
  countByUser(userId: string): Promise<number> {
    return prisma.trainingLog.count({ where: { userId } });
  },

  // `afterCreate` se ejecuta DENTRO de la transacción: si lanza, Postgres revierte la bitácora.
  async create(
    data: CreateLogData,
    afterCreate?: (log: TrainingLogWithScrambles) => Promise<void>,
  ): Promise<TrainingLogWithScrambles> {
    try {
      return await prisma.$transaction(async (tx) => {
        const log = await tx.trainingLog.create({
          data: {
            userId: data.userId,
            trainedAt: data.trainedAt,
            modality: data.modality,
            location: data.location,
            satisfaction: data.satisfaction,
            note: data.note,
            scrambles: {
              create: data.scrambles.map((scramble, index) => ({
                position: scramble.position,
                technique: scramble.technique,
                result: scramble.result,
                order: index,
              })),
            },
          },
          include: { scrambles: { orderBy: { order: "asc" } } },
        });

        if (afterCreate) {
          await afterCreate(log);
        }
        return log;
      });
    } catch (error) {
      // P2003: violación de llave foránea (el usuario del token ya no existe).
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new UnauthorizedError();
      }
      throw error;
    }
  },
};
