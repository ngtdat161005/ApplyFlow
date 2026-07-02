import { Router } from "express";
import { config } from "../config/env.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ApplyFlow API is running",
    environment: config.nodeEnv,
  });
});

export default router;
