export function toDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function compareDates(firstDate, secondDate) {
  const firstTime = firstDate?.getTime?.() ?? 0;
  const secondTime = secondDate?.getTime?.() ?? 0;

  return firstTime - secondTime;
}

function compareObjectIds(firstId, secondId) {
  return firstId?.toString?.().localeCompare(secondId?.toString?.() ?? "") ?? 0;
}

export function getEventEffectiveDate(event, options = {}) {
  const { includeCreatedAt = true } = options;

  return (
    toDate(event.occurredAt) ??
    toDate(event.scheduledAt) ??
    (includeCreatedAt ? toDate(event.createdAt) : null)
  );
}

export function compareTimelineEvents(firstEvent, secondEvent) {
  const effectiveDateDifference = compareDates(
    getEventEffectiveDate(firstEvent),
    getEventEffectiveDate(secondEvent),
  );

  if (effectiveDateDifference !== 0) {
    return effectiveDateDifference;
  }

  const createdAtDifference = compareDates(
    toDate(firstEvent.createdAt),
    toDate(secondEvent.createdAt),
  );

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return compareObjectIds(firstEvent._id, secondEvent._id);
}

export function sortTimelineEvents(events, direction = "asc") {
  const directionMultiplier = direction === "desc" ? -1 : 1;

  return [...events].sort(
    (firstEvent, secondEvent) =>
      compareTimelineEvents(firstEvent, secondEvent) * directionMultiplier,
  );
}
