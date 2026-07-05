export const ATTENTION_FLAG_TYPES = {
  NO_RESPONSE_AFTER_APPLY: "NO_RESPONSE_AFTER_APPLY",
  NO_RESPONSE_AFTER_INTERVIEW: "NO_RESPONSE_AFTER_INTERVIEW",
  FOLLOW_UP_OVERDUE: "FOLLOW_UP_OVERDUE",
};

export const ATTENTION_THRESHOLDS = {
  NO_RESPONSE_AFTER_APPLY_DAYS: 14,
  NO_RESPONSE_AFTER_INTERVIEW_DAYS: 7,
  UPCOMING_EVENT_DAYS: 3,
};

export const SILENCE_ELIGIBLE_STATUSES = ["applied", "in_process"];
export const FOLLOW_UP_ELIGIBLE_STATUSES = ["saved", "applied", "in_process"];
export const UPCOMING_EVENT_ELIGIBLE_STATUSES = ["saved", "applied", "in_process"];

export const APPLY_PROGRESS_EVENT_TYPES = [
  "hr_call",
  "oa",
  "interview",
  "offer",
  "rejected",
  "follow_up",
];

export const INTERVIEW_RESPONSE_EVENT_TYPES = [
  "offer",
  "rejected",
  "follow_up",
  "interview",
];
