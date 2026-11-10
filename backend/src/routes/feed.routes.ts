import { Router } from "express";
import { feedController } from "../controllers/feed.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const feedRouter = Router();

// F03: el JWT debe ir en el header Authorization para autorizar la lectura.
feedRouter.use(requireAuth);
feedRouter.get("/", feedController.list);
