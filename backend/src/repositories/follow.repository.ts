import { prisma } from "../lib/prisma";

// F06: acceso a la tabla `follows`. `followerId` sigue a `followingId`.
export const followRepository = {
  // Idempotente: si ya lo seguía no falla ni duplica la fila (ON CONFLICT DO NOTHING).
  async create(followerId: string, followingId: string): Promise<void> {
    await prisma.follows.createMany({
      data: [{ followerId, followingId }],
      skipDuplicates: true,
    });
  },

  // Idempotente: si no lo seguía simplemente no borra nada.
  async delete(followerId: string, followingId: string): Promise<void> {
    await prisma.follows.deleteMany({ where: { followerId, followingId } });
  },

  async exists(followerId: string, followingId: string): Promise<boolean> {
    const row = await prisma.follows.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { followerId: true },
    });
    return row !== null;
  },

  // Ids de los usuarios que `followerId` sigue (para el feed "Siguiendo").
  async listFollowingIds(followerId: string): Promise<string[]> {
    const rows = await prisma.follows.findMany({
      where: { followerId },
      select: { followingId: true },
    });
    return rows.map((row) => row.followingId);
  },

  countFollowers(userId: string): Promise<number> {
    return prisma.follows.count({ where: { followingId: userId } });
  },
};
