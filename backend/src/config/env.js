import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

const envPaths = [
  resolve(process.cwd(), "..", ".env"),
  resolve(process.cwd(), ".env"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const requiredEnvVars = ["PORT", "MONGODB_URI", "MONGODB_DB_NAME", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nodeEnv = process.env.NODE_ENV || "development";

function readPositiveInteger(name, defaultValue) {
  const rawValue = process.env[name];
  const value = rawValue === undefined || rawValue === "" ? defaultValue : Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

function readFrontendOrigin() {
  if (!process.env.FRONTEND_ORIGIN) {
    throw new Error("Missing required environment variable: FRONTEND_ORIGIN");
  }

  let url;

  try {
    url = new URL(process.env.FRONTEND_ORIGIN);
  } catch {
    throw new Error("FRONTEND_ORIGIN must be a valid absolute URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("FRONTEND_ORIGIN must use http or https");
  }

  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("FRONTEND_ORIGIN must be an origin without credentials, path, query, or hash");
  }

  if (nodeEnv === "production" && url.protocol !== "https:") {
    throw new Error("FRONTEND_ORIGIN must use https in production");
  }

  return url.origin;
}

function readEmailProvider() {
  const provider = process.env.EMAIL_PROVIDER || (nodeEnv === "production" ? "" : "console");

  if (!provider) {
    throw new Error("EMAIL_PROVIDER is required in production");
  }

  if (!["console", "resend"].includes(provider)) {
    throw new Error("EMAIL_PROVIDER must be console or resend");
  }

  if (nodeEnv === "production" && provider === "console") {
    throw new Error("EMAIL_PROVIDER=console is not allowed in production");
  }

  if (provider === "resend") {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }

    if (!process.env.RESEND_FROM_EMAIL || !EMAIL_PATTERN.test(process.env.RESEND_FROM_EMAIL)) {
      throw new Error("RESEND_FROM_EMAIL must be a valid email address when EMAIL_PROVIDER=resend");
    }
  }

  return provider;
}

const frontendOrigin = readFrontendOrigin();
const emailProvider = readEmailProvider();

export const config = {
  nodeEnv,
  port,
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
  frontendOrigin,
  email: {
    provider: emailProvider,
    resendApiKey: emailProvider === "resend" ? process.env.RESEND_API_KEY : null,
    resendFromEmail: emailProvider === "resend" ? process.env.RESEND_FROM_EMAIL : null,
  },
  passwordReset: {
    tokenTtlMinutes: readPositiveInteger("PASSWORD_RESET_TOKEN_TTL_MINUTES", 30),
    rateLimitPerEmail: readPositiveInteger("RESET_REQUEST_RATE_LIMIT_PER_EMAIL", 5),
    emailWindowMinutes: readPositiveInteger(
      "RESET_REQUEST_RATE_LIMIT_EMAIL_WINDOW_MINUTES",
      15,
    ),
    rateLimitPerIp: readPositiveInteger("RESET_REQUEST_RATE_LIMIT_PER_IP", 20),
    ipWindowMinutes: readPositiveInteger("RESET_REQUEST_RATE_LIMIT_IP_WINDOW_MINUTES", 60),
  },
};
