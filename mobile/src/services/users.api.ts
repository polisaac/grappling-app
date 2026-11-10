import type { FeedPage } from "@/types/feed";
import type { FollowState, PublicProfile } from "@/types/user";
import { isFeedPage } from "./feed.api";
import { ApiError, UNEXPECTED_ERROR_MESSAGE, deleteJson, getJson, isRecord, postJson } from "./http";

const PAGE_SIZE = 20;

function isPublicProfile(value: unknown): value is PublicProfile {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.followersCount === "number" &&
    typeof value.followingCount === "number" &&
    typeof value.isFollowing === "boolean"
  );
}

function isFollowState(value: unknown): value is FollowState {
  return (
    isRecord(value) &&
    typeof value.isFollowing === "boolean" &&
    typeof value.followersCount === "number"
  );
}

function parse<T>(data: unknown, guard: (value: unknown) => value is T): T {
  if (!guard(data)) {
    throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
  }
  return data;
}

// F06: perfiles públicos y conexiones. Todas las rutas requieren el JWT.
export const usersApi = {
  async fetchProfile(token: string, userId: string): Promise<PublicProfile> {
    return parse(await getJson(`/api/users/${encodeURIComponent(userId)}`, token), isPublicProfile);
  },

  // `cursor` es el `nextCursor` de la página anterior; null pide la primera página.
  async fetchLogsPage(token: string, userId: string, cursor: string | null): Promise<FeedPage> {
    const query = cursor
      ? `limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      : `limit=${PAGE_SIZE}`;
    const data = await getJson(`/api/users/${encodeURIComponent(userId)}/logs?${query}`, token);
    return parse(data, isFeedPage);
  },

  async follow(token: string, userId: string): Promise<FollowState> {
    const data = await postJson(`/api/users/${encodeURIComponent(userId)}/follow`, undefined, token);
    return parse(data, isFollowState);
  },

  async unfollow(token: string, userId: string): Promise<FollowState> {
    const data = await deleteJson(`/api/users/${encodeURIComponent(userId)}/follow`, token);
    return parse(data, isFollowState);
  },
};
