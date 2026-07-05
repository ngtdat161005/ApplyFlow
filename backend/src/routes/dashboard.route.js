import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { summary } from "../modules/dashboard/dashboard.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/summary", requireAuth, asyncHandler(summary));

export default router;
