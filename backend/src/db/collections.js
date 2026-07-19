import { getDb } from "../config/mongodb.js";

export const COLLECTION_NAMES = {
  users: "users",
  applications: "applications",
  applicationEvents: "application_events",
  passwordResetTokens: "passwordResetTokens",
};

export function getUsersCollection() {
  return getDb().collection(COLLECTION_NAMES.users);
}

export function getApplicationsCollection() {
  return getDb().collection(COLLECTION_NAMES.applications);
}

export function getApplicationEventsCollection() {
  return getDb().collection(COLLECTION_NAMES.applicationEvents);
}

export function getPasswordResetTokensCollection() {
  return getDb().collection(COLLECTION_NAMES.passwordResetTokens);
}
