import bcrypt from "bcrypt";
import { runMongoTransaction } from "../../config/mongodb.js";
import { UnauthorizedError } from "../../domain/shared/domain-errors.js";
import { deleteApplicationsByUser } from "../application/application.repository.js";
import { deleteUserById, findUserById } from "../auth/auth.repository.js";
import { deletePasswordResetTokensByUserId } from "../auth/password-reset.repository.js";
import { deleteEventsByUser } from "../event/event.repository.js";
import { DeleteUnavailableError, InvalidPasswordError } from "./account-deletion.errors.js";

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

export function createAccountDeleter({
  findUser = findUserById,
  verifyPassword = bcrypt.compare,
  runTransaction = runMongoTransaction,
  deleteEvents = deleteEventsByUser,
  deleteApplications = deleteApplicationsByUser,
  deleteResetTokens = deletePasswordResetTokensByUserId,
  deleteUser = deleteUserById,
} = {}) {
  return async function deleteAccount(userId, password) {
    const user = await findUser(userId);

    if (!user) {
      throw new UnauthorizedError("Authenticated user no longer exists");
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      throw new InvalidPasswordError();
    }

    try {
      await runTransaction(async (session) => {
        const options = { session };

        await deleteEvents(user._id, options);
        await deleteApplications(user._id, options);
        await deleteResetTokens(user._id, options);

        const userDeleted = await deleteUser(user._id, options);

        if (!userDeleted) {
          throw new Error("Authenticated user changed during account deletion");
        }
      });
    } catch (error) {
      if (isTransactionUnavailableError(error)) {
        throw new DeleteUnavailableError();
      }

      throw error;
    }
  };
}

export const deleteAccount = createAccountDeleter();
