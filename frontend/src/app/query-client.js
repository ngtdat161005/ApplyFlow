import { QueryClient } from '@tanstack/react-query';

export function retryNetworkOrServerFailureOnce(failureCount, error) {
  if (failureCount >= 1) {
    return false;
  }

  const status = Number(error?.status);
  const isNetworkFailure = error?.name === 'ApiError' && error?.status == null;
  const isServerFailure = Number.isInteger(status) && status >= 500 && status < 600;

  return isNetworkFailure || isServerFailure;
}

export function canonicalizeApplicationFilters(filters = {}) {
  return {
    search: typeof filters.search === 'string' ? filters.search.trim() : '',
    status: typeof filters.status === 'string' ? filters.status : '',
    sortBy: typeof filters.sortBy === 'string' ? filters.sortBy : '',
    sortOrder: typeof filters.sortOrder === 'string' ? filters.sortOrder : '',
  };
}

export const applicationKeys = {
  all: ['applications'],
  lists: () => [...applicationKeys.all, 'list'],
  list: (filters) => [...applicationKeys.lists(), filters],
  details: () => [...applicationKeys.all, 'detail'],
  detail: (applicationId) => [...applicationKeys.details(), applicationId],
  events: (applicationId) => [...applicationKeys.detail(applicationId), 'events'],
};

export const dashboardKeys = {
  summary: () => ['dashboard', 'summary'],
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: retryNetworkOrServerFailureOnce,
    },
    mutations: {
      retry: false,
    },
  },
});
