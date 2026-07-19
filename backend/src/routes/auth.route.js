import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
} from "../modules/auth/auth.controller.js";
import {
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateRegisterPayload,
  validateResetPasswordPayload,
} from "../modules/auth/auth.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { forgotPasswordRateLimit } from "../middlewares/forgot-password-rate-limit.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", validateBody(validateRegisterPayload), asyncHandler(register));
router.post("/login", validateBody(validateLoginPayload), asyncHandler(login));
router.post(
  "/forgot-password",
  validateBody(validateForgotPasswordPayload),
  forgotPasswordRateLimit,
  asyncHandler(forgotPassword),
);
router.post(
  "/reset-password",
  validateBody(validateResetPasswordPayload),
  asyncHandler(resetPassword),
);
router.get("/me", requireAuth, asyncHandler(me));

export default router;
