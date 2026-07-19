import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../domain/shared/domain-errors.js";
import { createUser, findUserByEmail, findUserById } from "./auth.repository.js";
import { mapUserToSafeUser } from "./auth.mapper.js";
import { DEFAULT_TOKEN_VERSION, normalizeTokenVersion } from "./auth.token-version.js";

const BCRYPT_SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = "1d";

function createAccessToken(user) {
  const tokenVersion = normalizeTokenVersion(user.tokenVersion);

  if (tokenVersion === null) {
    throw new Error("User has an invalid token version");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion,
    },
    config.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  );
}

function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function registerUser(payload) {
  const existingUser = await findUserByEmail(payload.email);

  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  const now = new Date();
  const passwordHash = await hashPassword(payload.password);

  try {
    const user = await createUser({
      displayName: payload.displayName,
      email: payload.email,
      passwordHash,
      tokenVersion: DEFAULT_TOKEN_VERSION,
      createdAt: now,
      updatedAt: now,
    });

    return mapUserToSafeUser(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConflictError("Email is already registered");
    }

    throw error;
  }
}

export async function loginUser(payload) {
  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return {
    accessToken: createAccessToken(user),
    user: mapUserToSafeUser(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new UnauthorizedError("Authenticated user no longer exists");
  }

  return mapUserToSafeUser(user);
}

export async function validateAuthenticatedSession(userId, payloadTokenVersion) {
  const tokenVersion = normalizeTokenVersion(payloadTokenVersion);

  if (tokenVersion === null) {
    throw new UnauthorizedError("Invalid authorization token");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new UnauthorizedError("Authenticated user no longer exists");
  }

  const storedTokenVersion = normalizeTokenVersion(user.tokenVersion);

  if (storedTokenVersion === null || storedTokenVersion !== tokenVersion) {
    throw new UnauthorizedError("Invalid authorization token");
  }
}
