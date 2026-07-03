import { Router } from "express";
import { create, detail, list, remove, update } from "../modules/application/application.controller.js";
import {
  validateApplicationIdParams,
  validateCreateApplicationPayload,
  validateListApplicationsQuery,
  validateUpdateApplicationPayload,
} from "../modules/application/application.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateBody(validateCreateApplicationPayload),
  asyncHandler(create),
);
router.get("/", requireAuth, validateQuery(validateListApplicationsQuery), asyncHandler(list));
router.get(
  "/:applicationId",
  requireAuth,
  validateParams(validateApplicationIdParams),
  asyncHandler(detail),
);
router.patch(
  "/:applicationId",
  requireAuth,
  validateParams(validateApplicationIdParams),
  validateBody(validateUpdateApplicationPayload),
  asyncHandler(update),
);
router.delete(
  "/:applicationId",
  requireAuth,
  validateParams(validateApplicationIdParams),
  asyncHandler(remove),
);

export default router;
