import { Router } from "express";
import { config } from "../config/env.js";
import applicationRouter from "./application.route.js";
import authRouter from "./auth.route.js";
import dashboardRouter from "./dashboard.route.js";
import eventRouter from "./event.route.js";
import userRouter from "./user.route.js";

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
router.use("/dashboard", dashboardRouter);
router.use("/users", userRouter);

export default router;
