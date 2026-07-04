import { httpRequest } from './http-client.js';

function getApplicationEventsPath(applicationId) {
  return `/applications/${applicationId}/events`;
}

function getApplicationEventPath(applicationId, eventId) {
  return `${getApplicationEventsPath(applicationId)}/${eventId}`;
}

export function getApplicationEvents(applicationId) {
  return httpRequest(getApplicationEventsPath(applicationId));
}

export function createApplicationEvent(applicationId, payload) {
  return httpRequest(getApplicationEventsPath(applicationId), {
    method: 'POST',
    body: payload,
  });
}

export function updateApplicationEvent(applicationId, eventId, payload) {
  return httpRequest(getApplicationEventPath(applicationId, eventId), {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteApplicationEvent(applicationId, eventId) {
  return httpRequest(getApplicationEventPath(applicationId, eventId), {
    method: 'DELETE',
  });
}

export function getEventListFromResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.events || response?.data?.events || [];
}

export function getEventFromResponse(response) {
  return response?.event || response?.data?.event || null;
}
