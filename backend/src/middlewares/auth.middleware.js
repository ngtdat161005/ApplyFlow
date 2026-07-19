import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { UnauthorizedError } from "../domain/shared/domain-errors.js";
import { validateAuthenticatedSession } from "../modules/auth/auth.service.js";

function getBearerToken(req) {
  const authorization = req.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(req, _res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return next(new UnauthorizedError("Authorization token is required"));
  }

  let payload;

  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Authorization token has expired"));
    }

    return next(new UnauthorizedError("Invalid authorization token"));
  }

  if (!payload.sub) {
    return next(new UnauthorizedError("Invalid authorization token"));
  }

  try {
    await validateAuthenticatedSession(payload.sub, payload.tokenVersion);
  } catch (error) {
    return next(error);
  }

  req.user = {
    id: payload.sub,
  };

  return next();
}
