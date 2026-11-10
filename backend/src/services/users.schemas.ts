import { z } from "zod";

// Parámetro de ruta ":id" de /api/users/:id/... (F06). Los ids son UUID.
export const userIdParamSchema = z.object({
  id: z.uuid("Identificador de usuario inválido"),
});
