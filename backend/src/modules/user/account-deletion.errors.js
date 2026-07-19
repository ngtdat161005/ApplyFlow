import { AppError } from "../../domain/shared/domain-errors.js";

export const INVALID_PASSWORD_MESSAGE = "Current password is incorrect";
export const DELETE_UNAVAILABLE_MESSAGE =
  "Account deletion is temporarily unavailable. Please try again later.";

export class InvalidPasswordError extends AppError {
  constructor() {
    super(INVALID_PASSWORD_MESSAGE, 401);
    this.code = "INVALID_PASSWORD";
  }
}

export class DeleteUnavailableError extends AppError {
  constructor() {
    super(DELETE_UNAVAILABLE_MESSAGE, 503);
    this.code = "DELETE_UNAVAILABLE";
    this.expose = true;
  }
}
