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

export async function closeMongoConnection() {
  if (client) {
    await client.close();
  }

  client = undefined;
  db = undefined;
}
