function mapObjectId(value) {
  return value?.toString?.() ?? value;
}

function mapDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapEventToResponse(event) {
  if (!event) {
    return null;
  }

  return {
    _id: mapObjectId(event._id),
    applicationId: mapObjectId(event.applicationId),
    userId: mapObjectId(event.userId),
    type: event.type,
    title: event.title,
    occurredAt: event.occurredAt ? mapDate(event.occurredAt) : null,
    scheduledAt: event.scheduledAt ? mapDate(event.scheduledAt) : null,
    mode: event.mode ?? null,
    location: event.location ?? null,
    meetingLink: event.meetingLink ?? null,
    contactName: event.contactName ?? null,
    contactPhone: event.contactPhone ?? null,
    contactEmail: event.contactEmail ?? null,
    note: event.note ?? null,
    createdAt: mapDate(event.createdAt),
    updatedAt: mapDate(event.updatedAt),
  };
}

export function mapEventsToResponse(events) {
  return events.map(mapEventToResponse);
}
