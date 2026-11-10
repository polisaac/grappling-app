import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { createLogSchema } from "../services/log.schemas";
import { logService } from "../services/log.service";

export const logController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }
      const input = createLogSchema.parse(req.body);
      const log = await logService.create(userId, input);
      res.status(201).json(log);
    } catch (error) {
      next(error);
    }
  },
};
