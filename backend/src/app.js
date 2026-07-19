import express from "express";
import routes from "./routes/index.js";
import { errorMiddleware, notFoundHandler } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", false);
  app.use(express.json());

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
