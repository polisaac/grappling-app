import { CannotFollowSelfError } from "../lib/errors";
import { followRepository } from "../repositories/follow.repository";
import { assertUserExists } from "./users.service";

// F06: estado de la conexión tras seguir/dejar de seguir. Devuelve el contador actualizado
// para que el cliente no tenga que volver a pedir el perfil.
export interface FollowState {
  isFollowing: boolean;
  followersCount: number;
}

async function validateTarget(followerId: string, targetId: string): Promise<void> {
  if (followerId === targetId) {
    throw new CannotFollowSelfError();
  }
  await assertUserExists(targetId);
}

// Ambas operaciones son idempotentes: repetirlas no produce error ni duplicados.
export const followsService = {
  async follow(followerId: string, targetId: string): Promise<FollowState> {
    await validateTarget(followerId, targetId);
    await followRepository.create(followerId, targetId);
    return { isFollowing: true, followersCount: await followRepository.countFollowers(targetId) };
  },

  async unfollow(followerId: string, targetId: string): Promise<FollowState> {
    await validateTarget(followerId, targetId);
    await followRepository.delete(followerId, targetId);
    return { isFollowing: false, followersCount: await followRepository.countFollowers(targetId) };
  },
};
