import { httpRequest } from './http-client.js';

const EMPTY_DASHBOARD_SUMMARY = {
  countsByStatus: {},
  totalApplications: 0,
  recentApplications: [],
  upcomingEvents: [],
  attentionFlags: [],
};

export function getDashboardSummary() {
  return httpRequest('/dashboard/summary');
}

export function getDashboardSummaryFromResponse(response) {
  const summary = response?.dashboard;

  if (!summary || typeof summary !== 'object') {
    return EMPTY_DASHBOARD_SUMMARY;
  }

  return {
    countsByStatus: summary.countsByStatus || {},
    totalApplications: Number.isFinite(summary.totalApplications)
      ? summary.totalApplications
      : 0,
    recentApplications: Array.isArray(summary.recentApplications)
      ? summary.recentApplications
      : [],
    upcomingEvents: Array.isArray(summary.upcomingEvents) ? summary.upcomingEvents : [],
    attentionFlags: Array.isArray(summary.attentionFlags) ? summary.attentionFlags : [],
  };
}
