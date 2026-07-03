import { getApplicationEventsCollection } from "../../db/collections.js";

function getTimelineDate(event) {
  return event.occurredAt ?? event.scheduledAt ?? event.createdAt;
}

function compareObjectIds(a, b) {
  return a.toString().localeCompare(b.toString());
}

function sortEventsChronologically(events) {
  return events.sort((firstEvent, secondEvent) => {
    const firstDate = getTimelineDate(firstEvent);
    const secondDate = getTimelineDate(secondEvent);
    const dateDifference = firstDate.getTime() - secondDate.getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    const createdAtDifference = firstEvent.createdAt.getTime() - secondEvent.createdAt.getTime();

    if (createdAtDifference !== 0) {
      return createdAtDifference;
    }

    return compareObjectIds(firstEvent._id, secondEvent._id);
  });
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
    .find({
      userId,
      applicationId,
    })
    .toArray();

  return sortEventsChronologically(events);
}
