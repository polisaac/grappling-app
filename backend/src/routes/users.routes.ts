import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const usersRouter = Router();

usersRouter.use(requireAuth);

// F05: perfil propio. El JWT identifica al usuario. Va ANTES de "/:id" para que "me" no se
// interprete como un id.
usersRouter.get("/me", usersController.getMe);
usersRouter.get("/me/logs", usersController.listMyLogs);

// F06: perfiles públicos y conexiones sociales.
usersRouter.get("/:id", usersController.getUser);
usersRouter.get("/:id/logs", usersController.listUserLogs);
usersRouter.post("/:id/follow", usersController.follow);
usersRouter.delete("/:id/follow", usersController.unfollow);
