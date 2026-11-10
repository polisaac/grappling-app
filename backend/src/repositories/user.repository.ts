import { Prisma } from "../generated/prisma/client";
import type { User } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { EmailAlreadyInUseError } from "../lib/errors";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

const publicUserSelect = {
  id: true,
  name: true,
  _count: { select: { followers: true, following: true } },
} satisfies Prisma.UserSelect;

export type PublicUserRecord = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async exists(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    return user !== null;
  },

  // F06: datos públicos + métricas de seguidores/seguidos (nunca email ni passwordHash).
  findPublicById(id: string): Promise<PublicUserRecord | null> {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  async create(data: CreateUserData): Promise<User> {
    try {
      return await prisma.user.create({ data });
    } catch (error) {
      // P2002: violación de restricción única (carrera entre dos registros con el mismo correo)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new EmailAlreadyInUseError();
      }
      throw error;
    }
  },
};
