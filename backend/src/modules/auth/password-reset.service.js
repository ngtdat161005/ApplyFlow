import { config } from "../../config/env.js";
import { runMongoTransaction } from "../../config/mongodb.js";
import { logger } from "../../shared/logger.js";
import { findUserByEmail, updateUserPasswordForReset } from "./auth.repository.js";
import { hashPassword } from "./auth.service.js";
import { sendPasswordResetEmail } from "../../services/email/password-reset-email.adapter.js";
import { InvalidResetTokenError, ResetUnavailableError } from "./password-reset.errors.js";
import {
  createPasswordResetUrl,
  createRawPasswordResetToken,
  hashPasswordResetToken,
} from "./password-reset-token.js";
import {
  claimUnexpiredPasswordResetToken,
  deletePasswordResetTokenById,
  replacePasswordResetTokenForUser,
} from "./password-reset.repository.js";

export const FORGOT_PASSWORD_RESPONSE_MESSAGE =
  "If an account with that email exists, a reset link has been sent.";
export const RESET_PASSWORD_RESPONSE_MESSAGE = "Password reset successful.";

const RAW_RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const TRANSACTION_UNAVAILABLE_CODES = new Set([20, 263]);

function isTransactionUnavailableError(error) {
  return (
    TRANSACTION_UNAVAILABLE_CODES.has(error?.code) ||
    [
      "MongoCompatibilityError",
      "MongoNetworkError",
      "MongoNetworkTimeoutError",
      "MongoOperationTimeoutError",
      "MongoServerSelectionError",
      "MongoTopologyClosedError",
    ].includes(error?.name) ||
    error?.hasErrorLabel?.("TransientTransactionError") === true ||
    error?.hasErrorLabel?.("UnknownTransactionCommitResult") === true
  );
}

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

export function createPasswordResetConsumer({
  runTransaction = runMongoTransaction,
  claimToken = claimUnexpiredPasswordResetToken,
  updatePassword = updateUserPasswordForReset,
  hashNewPassword = hashPassword,
  now = () => new Date(),
} = {}) {
  return async function consumePasswordReset({ token, newPassword }) {
    if (!RAW_RESET_TOKEN_PATTERN.test(token)) {
      throw new InvalidResetTokenError();
    }

    const tokenHash = hashPasswordResetToken(token);

    try {
      await runTransaction(async (session) => {
        const claimedToken = await claimToken(tokenHash, now(), { session });

        if (!claimedToken) {
          throw new InvalidResetTokenError();
        }

        const passwordHash = await hashNewPassword(newPassword);
        const userUpdated = await updatePassword(
          claimedToken.userId,
          passwordHash,
          now(),
          { session },
        );

        if (!userUpdated) {
          throw new InvalidResetTokenError();
        }
      });
    } catch (error) {
      if (error instanceof InvalidResetTokenError) {
        throw error;
      }

      if (isTransactionUnavailableError(error)) {
        throw new ResetUnavailableError();
      }

      throw error;
    }
  };
}

export const consumePasswordReset = createPasswordResetConsumer();
