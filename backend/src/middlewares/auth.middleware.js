import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { UnauthorizedError } from "../domain/shared/domain-errors.js";

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

export function requireAuth(req, _res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return next(new UnauthorizedError("Authorization token is required"));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    if (!payload.sub) {
      return next(new UnauthorizedError("Invalid authorization token"));
    }

    req.user = {
      id: payload.sub,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Authorization token has expired"));
    }

    return next(new UnauthorizedError("Invalid authorization token"));
  }
}
