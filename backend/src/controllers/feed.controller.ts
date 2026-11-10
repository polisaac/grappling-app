import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { feedListQuerySchema } from "../services/feed.schemas";
import { feedService } from "../services/feed.service";

export const feedController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }
      const query = feedListQuerySchema.parse(req.query);
      const page = await feedService.getFeed(userId, query);
      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  },
};
