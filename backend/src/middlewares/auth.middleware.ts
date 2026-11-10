import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { verifyToken } from "../lib/jwt";

const BEARER_PREFIX = "Bearer ";

// Protege rutas con JWT: exige `Authorization: Bearer <token>` y expone `req.auth.userId`.
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const { sub } = verifyToken(header.slice(BEARER_PREFIX.length).trim());
    req.auth = { userId: sub };
    next();
  } catch {
    // Token expirado, mal firmado o malformado.
    next(new UnauthorizedError());
  }
}
