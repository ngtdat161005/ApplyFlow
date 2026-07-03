import { Router } from "express";
import { create, list } from "../modules/event/event.controller.js";
import {
  validateApplicationEventParams,
  validateCreateEventPayload,
} from "../modules/event/event.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  validateParams(validateApplicationEventParams),
  validateBody(validateCreateEventPayload),
  asyncHandler(create),
);
router.get(
  "/",
  requireAuth,
  validateParams(validateApplicationEventParams),
  asyncHandler(list),
);

export default router;
