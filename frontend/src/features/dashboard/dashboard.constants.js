export const DASHBOARD_STATUS_ORDER = [
  'saved',
  'applied',
  'in_process',
  'offer',
  'rejected',
  'withdrawn',
];

export const ATTENTION_FLAG_LABELS = {
  NO_RESPONSE_AFTER_APPLY: 'No Response After Apply',
  NO_RESPONSE_AFTER_INTERVIEW: 'No Response After Interview',
  FOLLOW_UP_OVERDUE: 'Follow-Up Overdue',
};

export function getAttentionFlagLabel(flagType) {
  return ATTENTION_FLAG_LABELS[flagType] || flagType || 'Attention Needed';
}

export function getStatusCount(countsByStatus, status) {
  const count = countsByStatus?.[status];

  return Number.isFinite(count) ? count : 0;
}
