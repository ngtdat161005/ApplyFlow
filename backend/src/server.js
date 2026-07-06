import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { closeMongoConnection, connectToMongo } from "./config/mongodb.js";
import { logger } from "./shared/logger.js";
import dns from 'dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])
async function startServer() {
  await connectToMongo();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`ApplyFlow API listening on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down ApplyFlow API.`);
    server.close(async () => {
      await closeMongoConnection();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  logger.error("Failed to start ApplyFlow API", error);
  process.exit(1);
});
