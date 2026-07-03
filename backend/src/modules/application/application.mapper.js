function mapObjectId(value) {
  return value?.toString?.() ?? value;
}

function mapDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapApplicationToResponse(application) {
  if (!application) {
    return null;
  }

  return {
    _id: mapObjectId(application._id),
    userId: mapObjectId(application.userId),
    company: application.company,
    role: application.role,
    jdUrl: application.jdUrl ?? null,
    source: application.source ?? null,
    notes: application.notes ?? null,
    currentStatus: application.currentStatus,
    followUpAt: application.followUpAt ? mapDate(application.followUpAt) : null,
    createdAt: mapDate(application.createdAt),
    updatedAt: mapDate(application.updatedAt),
  };
}

export function mapApplicationsToResponse(applications) {
  return applications.map(mapApplicationToResponse);
}
