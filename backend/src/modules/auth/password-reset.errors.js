import { AppError } from "../../domain/shared/domain-errors.js";

export const INVALID_RESET_TOKEN_MESSAGE = "Password reset link is invalid or expired.";
export const RESET_UNAVAILABLE_MESSAGE =
  "Password reset is temporarily unavailable. Please try again later.";

export class InvalidResetTokenError extends AppError {
  constructor() {
    super(INVALID_RESET_TOKEN_MESSAGE, 400);
    this.code = "INVALID_TOKEN";
  }
}

export class ResetUnavailableError extends AppError {
  constructor() {
    super(RESET_UNAVAILABLE_MESSAGE, 503);
    this.code = "RESET_UNAVAILABLE";
    this.expose = true;
  }
}
