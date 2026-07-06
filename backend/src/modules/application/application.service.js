import { NotFoundError, UnauthorizedError } from "../../domain/shared/domain-errors.js";
import { toObjectId } from "../../utils/object-id.utils.js";
import { deleteEventsByApplicationForUser } from "../event/event.repository.js";
import { mapApplicationToResponse, mapApplicationsToResponse } from "./application.mapper.js";
import {
  createApplicationDocument,
  deleteApplicationByIdForUser,
  findApplicationByIdForUser,
  findApplicationsByUser,
  updateApplicationByIdForUser,
} from "./application.repository.js";

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
    throw new NotFoundError("Application not found");
  }

  return applicationObjectId;
}

async function deleteApplicationEventsForApplication(userObjectId, applicationObjectId) {
  await deleteEventsByApplicationForUser(userObjectId, applicationObjectId);
}

export async function createApplication(userId, payload) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const now = new Date();

  const application = await createApplicationDocument({
    userId: userObjectId,
    company: payload.company,
    role: payload.role,
    jdUrl: payload.jdUrl,
    source: payload.source,
    notes: payload.notes,
    currentStatus: payload.currentStatus,
    followUpAt: payload.followUpAt,
    createdAt: now,
    updatedAt: now,
  });

  return mapApplicationToResponse(application);
}

export async function listApplications(userId, options) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applications = await findApplicationsByUser(userObjectId, options);

  return mapApplicationsToResponse(applications);
}

export async function getApplication(userId, applicationId) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);
  const application = await findApplicationByIdForUser(userObjectId, applicationObjectId);

  if (!application) {
    throw new NotFoundError("Application not found");
  }

  return mapApplicationToResponse(application);
}

export async function updateApplication(userId, applicationId, updates) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);
  const updatedApplication = await updateApplicationByIdForUser(
    userObjectId,
    applicationObjectId,
    {
      ...updates,
      updatedAt: new Date(),
    },
  );

  if (!updatedApplication) {
    throw new NotFoundError("Application not found");
  }

  return mapApplicationToResponse(updatedApplication);
}

export async function deleteApplication(userId, applicationId) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applicationObjectId = getApplicationObjectId(applicationId);
  const application = await findApplicationByIdForUser(userObjectId, applicationObjectId);

  if (!application) {
    throw new NotFoundError("Application not found");
  }

  await deleteApplicationEventsForApplication(userObjectId, applicationObjectId);

  const deleted = await deleteApplicationByIdForUser(userObjectId, applicationObjectId);

  if (!deleted) {
    throw new NotFoundError("Application not found");
  }
}
