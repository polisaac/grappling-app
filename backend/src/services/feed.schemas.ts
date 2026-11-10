import { z } from "zod";

export const DEFAULT_FEED_LIMIT = 20;
export const MAX_FEED_LIMIT = 50;

// GET /api/feed?limit=20&cursor=<id de la última bitácora recibida>
export const feedQuerySchema = z.object({
  limit: z.coerce
    .number("El límite debe ser un número")
    .int("El límite debe ser un entero")
    .min(1, "El límite mínimo es 1")
    .max(MAX_FEED_LIMIT, `El límite máximo es ${MAX_FEED_LIMIT}`)
    .default(DEFAULT_FEED_LIMIT),
  cursor: z
    .uuid("Cursor inválido")
    .optional()
    .transform((value) => value ?? null),
});

export type FeedQuery = z.infer<typeof feedQuerySchema>;

// GET /api/feed?tab=following (F06). Sin `tab` se devuelve el feed global ("Para ti").
// Solo el feed acepta `tab`; los historiales por usuario siguen usando `feedQuerySchema`.
export const feedListQuerySchema = feedQuerySchema.extend({
  tab: z.enum(["following"], "Pestaña inválida").optional(),
});

export type FeedListQuery = z.infer<typeof feedListQuerySchema>;
