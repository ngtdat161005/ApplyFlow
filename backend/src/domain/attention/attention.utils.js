import {
  compareTimelineEvents,
  getEventEffectiveDate,
  sortTimelineEvents,
  toDate,
} from "../timeline/timeline.utils.js";
import {
  FOLLOW_UP_ELIGIBLE_STATUSES,
  SILENCE_ELIGIBLE_STATUSES,
  UPCOMING_EVENT_ELIGIBLE_STATUSES,
} from "./attention.types.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function normalizeDate(value) {
  return toDate(value);
}

export function getAttentionEventDate(event) {
  return getEventEffectiveDate(event, { includeCreatedAt: false });
}

export function daysSince(date, now) {
  const referenceDate = normalizeDate(date);
  const nowDate = normalizeDate(now);

  if (!referenceDate || !nowDate) {
    return null;
  }

  return Math.floor((nowDate.getTime() - referenceDate.getTime()) / MS_PER_DAY);
}

export function isOlderThanDays(date, dayThreshold, now) {
  const elapsedDays = daysSince(date, now);

  return elapsedDays !== null && elapsedDays >= dayThreshold;
}

export function isActiveSilenceStatus(status) {
  return SILENCE_ELIGIBLE_STATUSES.includes(status);
}

export function isFollowUpEligibleStatus(status) {
  return FOLLOW_UP_ELIGIBLE_STATUSES.includes(status);
}

export function isUpcomingEligibleStatus(status) {
  return UPCOMING_EVENT_ELIGIBLE_STATUSES.includes(status);
}

export function isUpcomingWithinDays(date, days, now) {
  const scheduledDate = normalizeDate(date);
  const nowDate = normalizeDate(now);

  if (!scheduledDate || !nowDate) {
    return false;
  }

  const timeUntilEvent = scheduledDate.getTime() - nowDate.getTime();

  return timeUntilEvent >= 0 && timeUntilEvent <= days * MS_PER_DAY;
}

export function groupEventsByApplicationId(events) {
  return events.reduce((groups, event) => {
    const applicationId = event.applicationId?.toString?.() ?? event.applicationId;

    if (!applicationId) {
      return groups;
    }

    if (!groups.has(applicationId)) {
      groups.set(applicationId, []);
    }

    groups.get(applicationId).push(event);

    return groups;
  }, new Map());
}

export function getMostRecentEventByType(events, type) {
  return sortTimelineEvents(
    events.filter((event) => event.type === type),
    "desc",
  )[0] ?? null;
}

export function hasLaterEventAfter(events, referenceEvent, eventTypes) {
  if (!referenceEvent) {
    return false;
  }

  return events.some((event) => {
    if (!eventTypes.includes(event.type)) {
      return false;
    }

    return compareTimelineEvents(event, referenceEvent) > 0;
  });
}

export function getApplicationId(application) {
  return (
    application._id?.toString?.() ??
    application.id?.toString?.() ??
    application._id ??
    application.id
  );
}
