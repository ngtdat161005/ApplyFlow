import { config } from "../../config/env.js";
import { logger } from "../../shared/logger.js";
import { findUserByEmail } from "./auth.repository.js";
import { sendPasswordResetEmail } from "./password-reset-email.adapter.js";
import {
  createPasswordResetUrl,
  createRawPasswordResetToken,
  hashPasswordResetToken,
} from "./password-reset-token.js";
import {
  deletePasswordResetTokenById,
  replacePasswordResetTokenForUser,
} from "./password-reset.repository.js";

export const FORGOT_PASSWORD_RESPONSE_MESSAGE =
  "If an account with that email exists, a reset link has been sent.";

export function createPasswordResetRequester({
  findUser = findUserByEmail,
  replaceToken = replacePasswordResetTokenForUser,
  deleteToken = deletePasswordResetTokenById,
  sendEmail = sendPasswordResetEmail,
  createRawToken = createRawPasswordResetToken,
  now = () => new Date(),
  frontendOrigin = config.frontendOrigin,
  tokenTtlMinutes = config.passwordReset.tokenTtlMinutes,
  operationalLogger = logger,
} = {}) {
  return async function requestPasswordReset(email) {
    const user = await findUser(email);

    if (!user) {
      return;
    }

    const rawToken = createRawToken();
    const createdAt = now();
    const token = await replaceToken(user._id, {
      tokenHash: hashPasswordResetToken(rawToken),
      expiresAt: new Date(createdAt.getTime() + tokenTtlMinutes * 60 * 1000),
      createdAt,
    });
    const resetUrl = createPasswordResetUrl(frontendOrigin, rawToken);

    try {
      await sendEmail({
        to: user.email,
        resetUrl,
      });
    } catch {
      try {
        await deleteToken(token._id);
      } catch {
        operationalLogger.error("password_reset_delivery_cleanup_failed");
      }

      operationalLogger.error("password_reset_delivery_failed");
    }
  };
}

export const requestPasswordReset = createPasswordResetRequester();
