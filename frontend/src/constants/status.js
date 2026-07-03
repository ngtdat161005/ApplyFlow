export const APPLICATION_STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'in_process', label: 'In Process' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const APPLICATION_STATUS_LABELS = APPLICATION_STATUS_OPTIONS.reduce(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {},
);

export function getApplicationStatusLabel(status) {
  return APPLICATION_STATUS_LABELS[status] || status || 'Unknown';
}
