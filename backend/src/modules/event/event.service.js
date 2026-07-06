import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../domain/shared/domain-errors.js";
import { findApplicationByIdForUser } from "../application/application.repository.js";
import { toObjectId } from "../../utils/object-id.utils.js";
import { mapEventToResponse, mapEventsToResponse } from "./event.mapper.js";
import {
  createEventDocument,
  deleteEventByIdForUser,
  findEventsByApplicationForUser,
  updateEventByIdForUser,
} from "./event.repository.js";

function getAuthenticatedUserObjectId(userId) {
  const userObjectId = toObjectId(userId);

  if (!userObjectId) {
    throw new UnauthorizedError("Invalid authenticated user");
  }

  return userObjectId;
}

function getApplicationObjectId(applicationId) {
  const applicationObjectId = toObjectId(applicationId);

  if (!applicationObjectId) {
    throw new BadRequestError("Application ID must be a valid ObjectId");
  }

  return applicationObjectId;
}

function getEventObjectId(eventId) {
  const eventObjectId = toObjectId(eventId);

  if (!eventObjectId) {
    throw new BadRequestError("Event ID must be a valid ObjectId");
  }

  return eventObjectId;
}

async function assertUserOwnsApplication(userId, applicationId) {
  const application = await findApplicationByIdForUser(userId, applicationId);

  if (!application) {
    throw new NotFoundError("Application not found");
  }
}

export async function createApplicationEvent(userId, applicationId, payload) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);

  await assertUserOwnsApplication(userObjectId, applicationObjectId);

  const now = new Date();
  const event = await createEventDocument({
    applicationId: applicationObjectId,
    userId: userObjectId,
    type: payload.type,
    title: payload.title,
    occurredAt: payload.occurredAt,
    scheduledAt: payload.scheduledAt,
    mode: payload.mode,
    location: payload.location,
    meetingLink: payload.meetingLink,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    contactEmail: payload.contactEmail,
    note: payload.note,
    createdAt: now,
    updatedAt: now,
  });

  return mapEventToResponse(event);
}

export async function listApplicationEvents(userId, applicationId) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);

  await assertUserOwnsApplication(userObjectId, applicationObjectId);

  const events = await findEventsByApplicationForUser(userObjectId, applicationObjectId);

  return mapEventsToResponse(events);
}

export async function updateApplicationEvent(userId, applicationId, eventId, updates) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);
  const eventObjectId = getEventObjectId(eventId);

  await assertUserOwnsApplication(userObjectId, applicationObjectId);

  const updatedEvent = await updateEventByIdForUser(
    userObjectId,
    applicationObjectId,
    eventObjectId,
    {
      ...updates,
      updatedAt: new Date(),
    },
  );

  if (!updatedEvent) {
    throw new NotFoundError("Event not found");
  }

  return mapEventToResponse(updatedEvent);
}

export async function deleteApplicationEvent(userId, applicationId, eventId) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);
  const eventObjectId = getEventObjectId(eventId);

  await assertUserOwnsApplication(userObjectId, applicationObjectId);

  const deleted = await deleteEventByIdForUser(userObjectId, applicationObjectId, eventObjectId);

  if (!deleted) {
    throw new NotFoundError("Event not found");
  }
}
