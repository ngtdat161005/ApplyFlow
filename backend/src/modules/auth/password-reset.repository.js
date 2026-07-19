import { getPasswordResetTokensCollection } from "../../db/collections.js";
import { toObjectId } from "../../utils/object-id.utils.js";

let passwordResetTokenIndexesPromise;

export async function ensurePasswordResetTokenIndexes() {
  if (!passwordResetTokenIndexesPromise) {
    passwordResetTokenIndexesPromise = Promise.all([
      getPasswordResetTokensCollection().createIndex(
        { userId: 1 },
        { name: "password_reset_tokens_user_id", unique: true },
      ),
      getPasswordResetTokensCollection().createIndex(
        { expiresAt: 1 },
        {
          name: "password_reset_tokens_expiry_ttl",
          expireAfterSeconds: 0,
        },
      ),
    ]);
  }

  return passwordResetTokenIndexesPromise;
}

export async function replacePasswordResetTokenForUser(userId, token) {
  await ensurePasswordResetTokenIndexes();
  await getPasswordResetTokensCollection().deleteMany({ userId });

  const document = {
    userId,
    tokenHash: token.tokenHash,
    expiresAt: token.expiresAt,
    createdAt: token.createdAt,
  };
  const result = await getPasswordResetTokensCollection().insertOne(document);

  return {
    _id: result.insertedId,
    ...document,
  };
}

export async function deletePasswordResetTokenById(tokenId) {
  const _id = toObjectId(tokenId);

  if (!_id) {
    return false;
  }

  const result = await getPasswordResetTokensCollection().deleteOne({ _id });
  return result.deletedCount === 1;
}

export async function deletePasswordResetTokensByUserId(userId) {
  const _id = toObjectId(userId);

  if (!_id) {
    return 0;
  }

  const result = await getPasswordResetTokensCollection().deleteMany({ userId: _id });
  return result.deletedCount;
}
