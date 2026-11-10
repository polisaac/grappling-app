import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { skillsService } from "../services/skills.service";

export const skillsController = {
  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }
      const graph = await skillsService.getMySkillGraph(userId);
      res.status(200).json(graph);
    } catch (error) {
      next(error);
    }
  },
};
