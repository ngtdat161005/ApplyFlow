import { getApplicationEventsCollection } from "../../db/collections.js";
import { sortTimelineEvents } from "../../domain/timeline/timeline.utils.js";

export function buildApplicationEventsForUserFilter(userId, applicationId) {
  return {
    userId,
    applicationId,
  };
}

export function buildEventForUserFilter(userId, applicationId, eventId) {
  return {
    _id: eventId,
    userId,
    applicationId,
  };
}

export async function createEventDocument(event) {
  const result = await getApplicationEventsCollection().insertOne(event);

  return {
    _id: result.insertedId,
    ...event,
  };
}

export async function findEventsByApplicationForUser(userId, applicationId) {
  const events = await getApplicationEventsCollection()
    .find(buildApplicationEventsForUserFilter(userId, applicationId))
    .toArray();

  return sortTimelineEvents(events);
}

export async function findEventsByUser(userId) {
  const events = await getApplicationEventsCollection()
    .find({
      userId,
    })
    .toArray();

  return sortTimelineEvents(events);
}

export async function updateEventByIdForUser(userId, applicationId, eventId, updates) {
  const result = await getApplicationEventsCollection().findOneAndUpdate(
    buildEventForUserFilter(userId, applicationId, eventId),
    {
      $set: updates,
    },
    {
      returnDocument: "after",
    },
  );

  return result?.value ?? result;
}

export async function deleteEventByIdForUser(userId, applicationId, eventId) {
  const result = await getApplicationEventsCollection().deleteOne(
    buildEventForUserFilter(userId, applicationId, eventId),
  );

  return result.deletedCount === 1;
}

export async function deleteEventsByApplicationForUser(userId, applicationId) {
  const result = await getApplicationEventsCollection().deleteMany(
    buildApplicationEventsForUserFilter(userId, applicationId),
  );

  return result.deletedCount;
}

export async function deleteEventsByUser(userId, { session }) {
  const result = await getApplicationEventsCollection().deleteMany(
    { userId },
    { session },
  );

  return result.deletedCount;
}
