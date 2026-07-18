import { APPLICATION_STATUSES } from "../../config/constants.js";
import {
  computeAttentionFlags,
  computeUpcomingEvents,
} from "../../domain/attention/attention.service.js";
import { normalizeDate } from "../../domain/attention/attention.utils.js";
import { UnauthorizedError } from "../../domain/shared/domain-errors.js";
import { toObjectId } from "../../utils/object-id.utils.js";
import { findAllApplicationsByUser } from "../application/application.repository.js";
import { findEventsByUser } from "../event/event.repository.js";
import { mapRecentApplications } from "./dashboard.mapper.js";

export const RECENT_APPLICATION_LIMIT = 5;

function compareIds(firstId, secondId) {
  const firstValue = firstId?.toString?.() ?? "";
  const secondValue = secondId?.toString?.() ?? "";

  if (firstValue === secondValue) {
    return 0;
  }

  return firstValue < secondValue ? -1 : 1;
}

function compareDates(firstDate, secondDate) {
  return (normalizeDate(firstDate)?.getTime() ?? 0) - (normalizeDate(secondDate)?.getTime() ?? 0);
}

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

function sortRecentApplications(applications) {
  return [...applications].sort((firstApplication, secondApplication) => {
    const updatedAtDifference = compareDates(
      secondApplication.updatedAt,
      firstApplication.updatedAt,
    );

    if (updatedAtDifference !== 0) {
      return updatedAtDifference;
    }

    const createdAtDifference = compareDates(
      secondApplication.createdAt,
      firstApplication.createdAt,
    );

    if (createdAtDifference !== 0) {
      return createdAtDifference;
    }

    return compareIds(firstApplication._id, secondApplication._id);
  });
}

function sortAttentionFlags(attentionFlags) {
  return [...attentionFlags].sort((firstFlag, secondFlag) => {
    const referenceDateDifference = compareDates(
      firstFlag.referenceDate,
      secondFlag.referenceDate,
    );

    if (referenceDateDifference !== 0) {
      return referenceDateDifference;
    }

    const applicationIdDifference = compareIds(
      firstFlag.applicationId,
      secondFlag.applicationId,
    );

    if (applicationIdDifference !== 0) {
      return applicationIdDifference;
    }

    return compareIds(firstFlag.flagType, secondFlag.flagType);
  });
}

export function buildDashboardSummary(applications = [], events = [], now = new Date()) {
  const countsByStatus = buildCountsByStatus(applications);
  const recentApplications = sortRecentApplications(applications).slice(
    0,
    RECENT_APPLICATION_LIMIT,
  );

  return {
    countsByStatus,
    totalApplications: getTotalApplications(countsByStatus),
    recentApplications: mapRecentApplications(recentApplications),
    upcomingEvents: computeUpcomingEvents(applications, events, now),
    attentionFlags: sortAttentionFlags(computeAttentionFlags(applications, events, now)),
  };
}

export async function getDashboardSummary(userId, now = new Date()) {
  const userObjectId = getAuthenticatedUserObjectId(userId);
  const applications = await findAllApplicationsByUser(userObjectId);
  const events = await findEventsByUser(userObjectId);

  return buildDashboardSummary(applications, events, now);
}
