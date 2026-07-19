import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { removeCurrentUser } from "../modules/user/user.controller.js";
import { validateDeleteAccountPayload } from "../modules/user/user.validator.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.delete(
  "/me",
  requireAuth,
  validateBody(validateDeleteAccountPayload),
  asyncHandler(removeCurrentUser),
);

export default router;
