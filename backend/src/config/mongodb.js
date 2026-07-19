import { MongoClient } from "mongodb";
import { config } from "./env.js";

let client;
let db;

export async function connectToMongo() {
  if (db) {
    return db;
  }

  client = new MongoClient(config.mongodb.uri, {
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();

  db = client.db(config.mongodb.dbName);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("MongoDB has not been connected. Call connectToMongo() before accessing the database.");
  }

  return db;
}

export function getMongoClient() {
  if (!client || !db) {
    throw new Error("MongoDB has not been connected. Call connectToMongo() before starting a session.");
  }

  return client;
}

export function createMongoTransactionRunner(clientProvider = getMongoClient) {
  return async function runTransaction(work) {
    const session = clientProvider().startSession();

    try {
      return await session.withTransaction(() => work(session), {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      });
    } finally {
      await session.endSession();
    }
  };
}

export const runMongoTransaction = createMongoTransactionRunner();

export async function closeMongoConnection() {
  if (client) {
    await client.close();
  }

  client = undefined;
  db = undefined;
}
