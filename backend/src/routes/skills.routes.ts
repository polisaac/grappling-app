import { Router } from "express";
import { skillsController } from "../controllers/skills.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const skillsRouter = Router();

// F04: el grafo es personal; el JWT identifica de quién es.
skillsRouter.use(requireAuth);
skillsRouter.get("/me", skillsController.getMine);
