import { NotFoundError, UnauthorizedError } from "../lib/errors";
import { followRepository } from "../repositories/follow.repository";
import { logRepository } from "../repositories/log.repository";
import { userRepository } from "../repositories/user.repository";
import type { FeedQuery } from "./feed.schemas";
import { authorsScope, findLogsPage } from "./feed.service";
import type { FeedPage } from "./feed.service";

// F05: datos del perfil propio. Solo se expone lo que la cabecera necesita; nunca email ni hash.
export interface MyProfile {
  id: string;
  name: string;
  totalLogs: number;
}

// F06: perfil público de cualquier usuario, visto por el usuario autenticado.
export interface PublicProfile {
  id: string;
  name: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean; // ¿el usuario autenticado sigue a este usuario?
}

const USER_NOT_FOUND_MESSAGE = "Usuario no encontrado";

// Lanza 404 si el usuario no existe. Lo usan las acciones sobre otro usuario (seguir, ver perfil...).
export async function assertUserExists(userId: string): Promise<void> {
  if (!(await userRepository.exists(userId))) {
    throw new NotFoundError(USER_NOT_FOUND_MESSAGE);
  }
}

// F05, validaciones: el perfil consultado es siempre el del token activo; no existe forma de
// pedir el de otro usuario porque el id sale del JWT y no de la petición.
export const usersService = {
  async getMe(userId: string): Promise<MyProfile> {
    const [user, totalLogs] = await Promise.all([
      userRepository.findById(userId),
      logRepository.countByUser(userId),
    ]);
    // Token válido de un usuario que ya no existe: se trata como sesión inválida.
    if (!user) {
      throw new UnauthorizedError();
    }
    return { id: user.id, name: user.name, totalLogs };
  },

  getMyLogs(userId: string, query: FeedQuery): Promise<FeedPage> {
    return findLogsPage(authorsScope([userId]), query);
  },

  // F06: GET /api/users/:id
  async getPublicProfile(viewerId: string, userId: string): Promise<PublicProfile> {
    const [user, isFollowing] = await Promise.all([
      userRepository.findPublicById(userId),
      followRepository.exists(viewerId, userId),
    ]);
    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND_MESSAGE);
    }
    return {
      id: user.id,
      name: user.name,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
    };
  },

  // F06: GET /api/users/:id/logs
  async getUserLogs(userId: string, query: FeedQuery): Promise<FeedPage> {
    const [page] = await Promise.all([
      findLogsPage(authorsScope([userId]), query),
      assertUserExists(userId),
    ]);
    return page;
  },
};
