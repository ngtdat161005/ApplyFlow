import { Router } from "express";
import { login, me, register } from "../modules/auth/auth.controller.js";
import {
  validateLoginPayload,
  validateRegisterPayload,
} from "../modules/auth/auth.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", validateBody(validateRegisterPayload), asyncHandler(register));
router.post("/login", validateBody(validateLoginPayload), asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
