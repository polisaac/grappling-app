import { Router } from "express";
import { logController } from "../controllers/log.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const logRouter = Router();

// Todas las rutas de bitácoras requieren JWT válido.
logRouter.use(requireAuth);
logRouter.post("/", logController.create);
