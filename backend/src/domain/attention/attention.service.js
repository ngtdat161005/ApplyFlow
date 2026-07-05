import { ATTENTION_THRESHOLDS } from "./attention.types.js";
import {
  evaluateFollowUpOverdue,
  evaluateNoResponseAfterApply,
  evaluateNoResponseAfterInterview,
} from "./attention.rules.js";
import {
  getApplicationId,
  groupEventsByApplicationId,
  isUpcomingEligibleStatus,
  isUpcomingWithinDays,
  normalizeDate,
} from "./attention.utils.js";

function getEventId(event) {
  return event._id?.toString?.() ?? event.id?.toString?.() ?? event._id ?? event.id;
}

function toIsoString(value) {
  return normalizeDate(value)?.toISOString() ?? null;
}

export function computeAttentionFlags(applications, events, now = new Date()) {
  const groupedEvents = groupEventsByApplicationId(events ?? []);

  return (applications ?? []).flatMap((application) => {
    const applicationId = getApplicationId(application);
    const applicationEvents = groupedEvents.get(applicationId) ?? [];
    const flags = [
      evaluateNoResponseAfterApply(application, applicationEvents, now),
      evaluateNoResponseAfterInterview(application, applicationEvents, now),
      evaluateFollowUpOverdue(application, now),
    ];

    return flags.filter(Boolean);
  });
}

export function computeUpcomingEvents(applications, events, now = new Date()) {
  const applicationsById = new Map(
    (applications ?? []).map((application) => [getApplicationId(application), application]),
  );

  return (events ?? [])
    .map((event) => {
      const applicationId = event.applicationId?.toString?.() ?? event.applicationId;
      const application = applicationsById.get(applicationId);

      if (!application || !isUpcomingEligibleStatus(application.currentStatus)) {
        return null;
      }

      if (!isUpcomingWithinDays(event.scheduledAt, ATTENTION_THRESHOLDS.UPCOMING_EVENT_DAYS, now)) {
        return null;
      }

      return {
        eventId: getEventId(event),
        applicationId,
        company: application.company,
        role: application.role,
        type: event.type,
        title: event.title,
        scheduledAt: toIsoString(event.scheduledAt),
      };
    })
    .filter(Boolean)
    .sort((firstEvent, secondEvent) => {
      const firstDate = normalizeDate(firstEvent.scheduledAt);
      const secondDate = normalizeDate(secondEvent.scheduledAt);
      const dateDifference = firstDate.getTime() - secondDate.getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return (firstEvent.eventId ?? "").localeCompare(secondEvent.eventId ?? "");
    });
}
