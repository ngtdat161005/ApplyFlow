import { UnauthorizedError } from "../../domain/shared/domain-errors.js";
import { toObjectId } from "../../utils/object-id.utils.js";
import { mapApplicationToResponse, mapApplicationsToResponse } from "./application.mapper.js";
import { createApplicationDocument, findApplicationsByUser } from "./application.repository.js";

function getAuthenticatedUserObjectId(userId) {
  const userObjectId = toObjectId(userId);

  if (!userObjectId) {
    throw new UnauthorizedError("Invalid authenticated user");
  }

  return userObjectId;
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
