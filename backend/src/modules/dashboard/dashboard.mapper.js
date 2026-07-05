function mapObjectId(value) {
  return value?.toString?.() ?? value;
}

function mapDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapRecentApplication(application) {
  return {
    applicationId: mapObjectId(application._id),
    company: application.company,
    role: application.role,
    currentStatus: application.currentStatus,
    updatedAt: mapDate(application.updatedAt),
    followUpAt: application.followUpAt ? mapDate(application.followUpAt) : null,
  };
}

export function mapRecentApplications(applications) {
  return applications.map(mapRecentApplication);
}
