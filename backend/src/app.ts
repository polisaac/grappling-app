import cors from "cors";
import express from "express";
import type { Express } from "express";
import { authRouter } from "./routes/auth.routes";
import { feedRouter } from "./routes/feed.routes";
import { logRouter } from "./routes/log.routes";
import { skillsRouter } from "./routes/skills.routes";
import { usersRouter } from "./routes/users.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/logs", logRouter);
  app.use("/api/feed", feedRouter);
  app.use("/api/skills", skillsRouter);
  app.use("/api/users", usersRouter);

  app.use(errorMiddleware);

  return app;
}
