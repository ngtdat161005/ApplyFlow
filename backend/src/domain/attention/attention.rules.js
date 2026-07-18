import {
  APPLY_PROGRESS_EVENT_TYPES,
  ATTENTION_FLAG_TYPES,
  ATTENTION_THRESHOLDS,
  INTERVIEW_RESPONSE_EVENT_TYPES,
} from "./attention.types.js";
import {
  daysSince,
  getApplicationId,
  getAttentionEventDate,
  getMostRecentEventByType,
  hasLaterEventAfter,
  isActiveSilenceStatus,
  isFollowUpEligibleStatus,
  isOlderThanDays,
  normalizeDate,
} from "./attention.utils.js";

function createFlag(application, flagType, message, referenceDate) {
  const normalizedReferenceDate = normalizeDate(referenceDate);

  if (!normalizedReferenceDate) {
    return null;
  }

  return {
    flagType,
    applicationId: getApplicationId(application),
    company: application.company,
    role: application.role,
    message,
    referenceDate: normalizedReferenceDate.toISOString(),
  };
}

export function evaluateNoResponseAfterApply(application, events, now) {
  if (!isActiveSilenceStatus(application.currentStatus)) {
    return null;
  }

  const appliedEvent = getMostRecentEventByType(events, "applied");

  if (!appliedEvent) {
    return null;
  }

  const referenceDate = getAttentionEventDate(appliedEvent);

  if (!referenceDate) {
    return null;
  }

  if (hasLaterEventAfter(events, appliedEvent, APPLY_PROGRESS_EVENT_TYPES)) {
    return null;
  }

  if (!isOlderThanDays(referenceDate, ATTENTION_THRESHOLDS.NO_RESPONSE_AFTER_APPLY_DAYS, now)) {
    return null;
  }

  const elapsedDays = daysSince(referenceDate, now);

  return createFlag(
    application,
    ATTENTION_FLAG_TYPES.NO_RESPONSE_AFTER_APPLY,
    `Applied ${elapsedDays} days ago but no response has been recorded yet.`,
    referenceDate,
  );
}

export function evaluateNoResponseAfterInterview(application, events, now) {
  if (!isActiveSilenceStatus(application.currentStatus)) {
    return null;
  }

  const interviewEvent = getMostRecentEventByType(events, "interview");

  if (!interviewEvent) {
    return null;
  }

  const referenceDate = getAttentionEventDate(interviewEvent);

  if (!referenceDate) {
    return null;
  }

  if (hasLaterEventAfter(events, interviewEvent, INTERVIEW_RESPONSE_EVENT_TYPES)) {
    return null;
  }

  if (!isOlderThanDays(referenceDate, ATTENTION_THRESHOLDS.NO_RESPONSE_AFTER_INTERVIEW_DAYS, now)) {
    return null;
  }

  const elapsedDays = daysSince(referenceDate, now);

  return createFlag(
    application,
    ATTENTION_FLAG_TYPES.NO_RESPONSE_AFTER_INTERVIEW,
    `Interview completed ${elapsedDays} days ago but no response has been recorded yet.`,
    referenceDate,
  );
}

export function evaluateFollowUpOverdue(application, now) {
  if (!isFollowUpEligibleStatus(application.currentStatus)) {
    return null;
  }

  const followUpAt = normalizeDate(application.followUpAt);
  const nowDate = normalizeDate(now);

  if (!followUpAt || !nowDate || followUpAt.getTime() >= nowDate.getTime()) {
    return null;
  }

  return createFlag(
    application,
    ATTENTION_FLAG_TYPES.FOLLOW_UP_OVERDUE,
    "Follow-up date has passed.",
    followUpAt,
  );
}
