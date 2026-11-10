import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

// Solo se exponen los datos públicos del autor (nunca email ni passwordHash).
const feedInclude = {
  user: { select: { id: true, name: true } },
  scrambles: { orderBy: { order: "asc" } },
} satisfies Prisma.TrainingLogInclude;

export type FeedLogRecord = Prisma.TrainingLogGetPayload<{ include: typeof feedInclude }>;

// A quién se consulta: a todos los usuarios (feed "Para ti", F06) o solo a algunos autores
// (feed "Siguiendo", historial propio o de otro usuario).
export type FeedScope = { kind: "everyone" } | { kind: "authors"; authorIds: string[] };

export interface FindFeedPageParams {
  scope: FeedScope;
  take: number;
  cursor: string | null;
}

export const feedRepository = {
  findPage({ scope, take, cursor }: FindFeedPageParams): Promise<FeedLogRecord[]> {
    return prisma.trainingLog.findMany({
      where: scope.kind === "authors" ? { userId: { in: scope.authorIds } } : {},
      // `id` desempata bitácoras con el mismo createdAt para que la paginación sea estable.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: feedInclude,
    });
  },
};
