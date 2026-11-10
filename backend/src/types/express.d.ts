// Datos del usuario autenticado que adjunta `requireAuth` a la request.
declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string };
    }
  }
}

export {};
