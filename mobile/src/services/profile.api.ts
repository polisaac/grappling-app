import type { FeedPage } from "@/types/feed";
import type { MyProfile } from "@/types/profile";
import { isFeedPage } from "./feed.api";
import { ApiError, UNEXPECTED_ERROR_MESSAGE, getJson, isRecord } from "./http";

const PAGE_SIZE = 20;

function isMyProfile(value: unknown): value is MyProfile {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.totalLogs === "number"
  );
}

export const profileApi = {
  async fetchMe(token: string): Promise<MyProfile> {
    const data = await getJson("/api/users/me", token);
    if (!isMyProfile(data)) {
      throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
    }
    return data;
  },

  // `cursor` es el `nextCursor` de la página anterior; null pide la primera página.
  async fetchLogsPage(token: string, cursor: string | null): Promise<FeedPage> {
    const query = cursor
      ? `limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      : `limit=${PAGE_SIZE}`;
    const data = await getJson(`/api/users/me/logs?${query}`, token);
    if (!isFeedPage(data)) {
      throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
    }
    return data;
  },
};
