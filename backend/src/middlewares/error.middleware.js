import { config } from "../config/env.js";
import { logger } from "../shared/logger.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorMiddleware(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;
  const message =
    isServerError && config.nodeEnv === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  if (isServerError) {
    logger.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(!isServerError && err.errors ? { errors: err.errors } : {}),
    ...(!isServerError && err.code ? { code: err.code } : {}),
    ...(isServerError && config.nodeEnv !== "production" && err.stack
      ? { stack: err.stack }
      : {}),
  });
}
