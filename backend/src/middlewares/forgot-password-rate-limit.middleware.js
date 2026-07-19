import { createHash } from "node:crypto";
import { config } from "../config/env.js";
import { TooManyRequestsError } from "../domain/shared/domain-errors.js";

const RATE_LIMIT_MESSAGE = "Too many password reset requests. Please try again later.";
const RATE_LIMIT_CODE = "RESET_RATE_LIMITED";

function hashEmail(email) {
  return createHash("sha256").update(email).digest("hex");
}

export function createFixedWindowLimiter({ limit, windowMs, now = Date.now }) {
  const entries = new Map();
  let operationCount = 0;

  function pruneExpired(timestamp) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= timestamp) {
        entries.delete(key);
      }
    }
  }

  return {
    consume(key) {
      const timestamp = now();
      operationCount += 1;

      if (operationCount % 100 === 0) {
        pruneExpired(timestamp);
      }

      const current = entries.get(key);

      if (!current || current.resetAt <= timestamp) {
        entries.set(key, {
          count: 1,
          resetAt: timestamp + windowMs,
        });
        return true;
      }

      current.count += 1;
      return current.count <= limit;
    },
  };
}

export function createForgotPasswordRateLimitMiddleware({
  emailLimit,
  emailWindowMs,
  ipLimit,
  ipWindowMs,
  now = Date.now,
}) {
  const emailLimiter = createFixedWindowLimiter({
    limit: emailLimit,
    windowMs: emailWindowMs,
    now,
  });
  const ipLimiter = createFixedWindowLimiter({
    limit: ipLimit,
    windowMs: ipWindowMs,
    now,
  });

  return function forgotPasswordRateLimit(req, _res, next) {
    const emailAllowed = emailLimiter.consume(hashEmail(req.validatedBody.email));
    const ipAllowed = ipLimiter.consume(req.ip || req.socket?.remoteAddress || "unknown");

    if (!emailAllowed || !ipAllowed) {
      return next(new TooManyRequestsError(RATE_LIMIT_MESSAGE, RATE_LIMIT_CODE));
    }

    return next();
  };
}

export const forgotPasswordRateLimit = createForgotPasswordRateLimitMiddleware({
  emailLimit: config.passwordReset.rateLimitPerEmail,
  emailWindowMs: config.passwordReset.emailWindowMinutes * 60 * 1000,
  ipLimit: config.passwordReset.rateLimitPerIp,
  ipWindowMs: config.passwordReset.ipWindowMinutes * 60 * 1000,
});
