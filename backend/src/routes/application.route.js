import { Router } from "express";
import { create, list } from "../modules/application/application.controller.js";
import {
  validateCreateApplicationPayload,
  validateListApplicationsQuery,
} from "../modules/application/application.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateBody(validateCreateApplicationPayload),
  asyncHandler(create),
);
router.get("/", requireAuth, validateQuery(validateListApplicationsQuery), asyncHandler(list));

export default router;
