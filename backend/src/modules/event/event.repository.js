import { getApplicationEventsCollection } from "../../db/collections.js";
import { sortTimelineEvents } from "../../domain/timeline/timeline.utils.js";

export async function createEventDocument(event) {
  const result = await getApplicationEventsCollection().insertOne(event);

  return {
    _id: result.insertedId,
    ...event,
  };
}

export async function findEventsByApplicationForUser(userId, applicationId) {
  const events = await getApplicationEventsCollection()
    .find({
      userId,
      applicationId,
    })
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
    {
      _id: eventId,
      userId,
      applicationId,
    },
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
  const result = await getApplicationEventsCollection().deleteOne({
    _id: eventId,
    userId,
    applicationId,
  });

  return result.deletedCount === 1;
}

export async function deleteEventsByApplicationForUser(userId, applicationId) {
  const result = await getApplicationEventsCollection().deleteMany({
    userId,
    applicationId,
  });

  return result.deletedCount;
}
