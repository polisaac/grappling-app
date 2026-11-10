import type { FeedLog, FeedPage, FeedTab } from "@/types/feed";
import { ApiError, UNEXPECTED_ERROR_MESSAGE, getJson, isRecord } from "./http";

const PAGE_SIZE = 20;

function isFeedLog(value: unknown): value is FeedLog {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.trainedAt === "string" &&
    typeof value.modality === "string" &&
    isRecord(value.user) &&
    typeof value.user.id === "string" &&
    typeof value.user.name === "string" &&
    Array.isArray(value.scrambles)
  );
}

// Exportada: los historiales de perfil (F05/F06) devuelven la misma forma de página que el feed.
export function isFeedPage(value: unknown): value is FeedPage {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isFeedLog) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
  );
}

export const feedApi = {
  // `cursor` es el `nextCursor` de la página anterior; null pide la primera página.
  // F06: el feed global no lleva `tab`; "Siguiendo" envía `tab=following`.
  async fetchPage(token: string, cursor: string | null, tab: FeedTab): Promise<FeedPage> {
    const params = [`limit=${PAGE_SIZE}`];
    if (tab === "following") {
      params.push("tab=following");
    }
    if (cursor) {
      params.push(`cursor=${encodeURIComponent(cursor)}`);
    }
    const data = await getJson(`/api/feed?${params.join("&")}`, token);
    if (!isFeedPage(data)) {
      throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
    }
    return data;
  },
};
