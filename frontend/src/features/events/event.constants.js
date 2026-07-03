export const EVENT_TYPE_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'hr_call', label: 'HR Call' },
  { value: 'oa', label: 'Online Assessment' },
  { value: 'interview', label: 'Interview' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'note', label: 'Note' },
];

export const EVENT_MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'phone', label: 'Phone' },
];

export function getEventTypeLabel(type) {
  return EVENT_TYPE_OPTIONS.find((option) => option.value === type)?.label || type || 'Event';
}

export function getEventModeLabel(mode) {
  return EVENT_MODE_OPTIONS.find((option) => option.value === mode)?.label || mode || '';
}
