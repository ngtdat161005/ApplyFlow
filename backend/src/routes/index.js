import { Router } from "express";
import { config } from "../config/env.js";
import applicationRouter from "./application.route.js";
import authRouter from "./auth.route.js";
import eventRouter from "./event.route.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ApplyFlow API is running",
    environment: config.nodeEnv,
  });
});

router.use("/auth", authRouter);
router.use("/applications", applicationRouter);
router.use("/applications/:applicationId/events", eventRouter);

export default router;
