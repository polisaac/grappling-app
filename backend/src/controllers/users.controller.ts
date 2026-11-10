import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { feedQuerySchema } from "../services/feed.schemas";
import { followsService } from "../services/follows.service";
import { usersService } from "../services/users.service";
import { userIdParamSchema } from "../services/users.schemas";

// El JWT (validado por `requireAuth`) es la única fuente de la identidad del solicitante.
function requireUserId(req: Request): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      res.status(200).json(await usersService.getMe(userId));
    } catch (error) {
      next(error);
    }
  },

  async listMyLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const query = feedQuerySchema.parse(req.query);
      res.status(200).json(await usersService.getMyLogs(userId, query));
    } catch (error) {
      next(error);
    }
  },

  // F06
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const viewerId = requireUserId(req);
      const { id } = userIdParamSchema.parse(req.params);
      res.status(200).json(await usersService.getPublicProfile(viewerId, id));
    } catch (error) {
      next(error);
    }
  },

  async listUserLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requireUserId(req);
      const { id } = userIdParamSchema.parse(req.params);
      const query = feedQuerySchema.parse(req.query);
      res.status(200).json(await usersService.getUserLogs(id, query));
    } catch (error) {
      next(error);
    }
  },

  async follow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const followerId = requireUserId(req);
      const { id } = userIdParamSchema.parse(req.params);
      res.status(200).json(await followsService.follow(followerId, id));
    } catch (error) {
      next(error);
    }
  },

  async unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const followerId = requireUserId(req);
      const { id } = userIdParamSchema.parse(req.params);
      res.status(200).json(await followsService.unfollow(followerId, id));
    } catch (error) {
      next(error);
    }
  },
};
