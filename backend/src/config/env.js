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

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port,
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
};
