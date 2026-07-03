import { Router } from "express";
import { create, list, remove, update } from "../modules/event/event.controller.js";
import {
  validateApplicationEventDetailParams,
  validateApplicationEventParams,
  validateCreateEventPayload,
  validateUpdateEventPayload,
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
router.patch(
  "/:eventId",
  requireAuth,
  validateParams(validateApplicationEventDetailParams),
  validateBody(validateUpdateEventPayload),
  asyncHandler(update),
);
router.delete(
  "/:eventId",
  requireAuth,
  validateParams(validateApplicationEventDetailParams),
  asyncHandler(remove),
);

export default router;
