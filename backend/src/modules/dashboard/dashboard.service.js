import { APPLICATION_STATUSES } from "../../config/constants.js";
import {
  computeAttentionFlags,
  computeUpcomingEvents,
} from "../../domain/attention/attention.service.js";
import { UnauthorizedError } from "../../domain/shared/domain-errors.js";
import { toObjectId } from "../../utils/object-id.utils.js";
import { findAllApplicationsByUser } from "../application/application.repository.js";
import { findEventsByUser } from "../event/event.repository.js";
import { mapRecentApplications } from "./dashboard.mapper.js";

const RECENT_APPLICATION_LIMIT = 5;

function getAuthenticatedUserObjectId(userId) {
  const userObjectId = toObjectId(userId);

  if (!userObjectId) {
    throw new UnauthorizedError("Invalid authenticated user");
  }

  return userObjectId;
}

function buildCountsByStatus(applications) {
  const countsByStatus = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, 0]),
  );

  for (const application of applications) {
    if (Object.prototype.hasOwnProperty.call(countsByStatus, application.currentStatus)) {
      countsByStatus[application.currentStatus] += 1;
    }
  }

  return countsByStatus;
}

function getTotalApplications(countsByStatus) {
  return Object.values(countsByStatus).reduce((total, count) => total + count, 0);
}

export async function getDashboardSummary(userId, now = new Date()) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applications = await findAllApplicationsByUser(userObjectId);
  const events = await findEventsByUser(userObjectId);
  const countsByStatus = buildCountsByStatus(applications);
  const recentApplications = applications.slice(0, RECENT_APPLICATION_LIMIT);

  return {
    countsByStatus,
    totalApplications: getTotalApplications(countsByStatus),
    recentApplications: mapRecentApplications(recentApplications),
    upcomingEvents: computeUpcomingEvents(applications, events, now),
    attentionFlags: computeAttentionFlags(applications, events, now),
  };
}
