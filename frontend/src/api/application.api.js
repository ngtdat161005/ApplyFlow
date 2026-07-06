import { httpRequest } from './http-client.js';

function buildApplicationsQuery(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }

  const queryString = searchParams.toString();

  return queryString ? `/applications?${queryString}` : '/applications';
}

export function getApplications(params) {
  return httpRequest(buildApplicationsQuery(params));
}

export function createApplication(payload) {
  return httpRequest('/applications', {
    method: 'POST',
    body: payload,
  });
}

export function getApplication(applicationId) {
  return httpRequest(`/applications/${applicationId}`);
}

export function updateApplication(applicationId, payload) {
  return httpRequest(`/applications/${applicationId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteApplication(applicationId) {
  return httpRequest(`/applications/${applicationId}`, {
    method: 'DELETE',
  });
}

export function getApplicationListFromResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.applications || response?.data?.applications || [];
}

export function getApplicationFromResponse(response) {
  return response?.application || response?.data?.application || null;
}
