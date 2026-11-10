import { feedRepository } from "../repositories/feed.repository";
import type { FeedLogRecord, FeedScope } from "../repositories/feed.repository";
import { followRepository } from "../repositories/follow.repository";
import type { FeedListQuery, FeedQuery } from "./feed.schemas";

export interface FeedPage {
  items: FeedLogRecord[];
  nextCursor: string | null; // null cuando ya no hay bitácoras más antiguas
}

// Alcance de "solo estos autores": historial propio (F05) o de otro usuario (F06).
export function authorsScope(authorIds: string[]): FeedScope {
  return { kind: "authors", authorIds };
}

// Página de bitácoras (más recientes primero) del alcance indicado. La comparten el feed (F03/F06)
// y los historiales de perfil (F05/F06); cambia únicamente a quiénes se consulta.
export async function findLogsPage(scope: FeedScope, { limit, cursor }: FeedQuery): Promise<FeedPage> {
  // Se pide uno extra para saber si hay otra página sin hacer un count().
  const records = await feedRepository.findPage({
    scope,
    take: limit + 1,
    cursor,
  });

  const hasMore = records.length > limit;
  const items = hasMore ? records.slice(0, limit) : records;
  const lastItem = items[items.length - 1];

  return { items, nextCursor: hasMore && lastItem ? lastItem.id : null };
}

export const feedService = {
  // F06: sin `tab` es el feed global ("Para ti"); con `tab=following`, solo las bitácoras de los
  // usuarios que sigo. Los seguidos se consultan en cada petición, así un seguimiento nuevo se
  // refleja de inmediato en la siguiente carga.
  async getFeed(userId: string, { tab, limit, cursor }: FeedListQuery): Promise<FeedPage> {
    if (tab === "following") {
      const followingIds = await followRepository.listFollowingIds(userId);
      if (followingIds.length === 0) {
        return { items: [], nextCursor: null };
      }
      return findLogsPage(authorsScope(followingIds), { limit, cursor });
    }
    return findLogsPage({ kind: "everyone" }, { limit, cursor });
  },
};
