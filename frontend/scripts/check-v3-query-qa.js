import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { QueryClient } from '@tanstack/react-query';

import {
  applicationKeys,
  canonicalizeApplicationFilters,
  dashboardKeys,
  retryNetworkOrServerFailureOnce,
} from '../src/app/query-client.js';

const STATUSES = ['saved', 'applied', 'in_process', 'offer', 'rejected', 'withdrawn'];

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });
}

function createSyntheticApplications(count = 30) {
  const baseTime = Date.parse('2026-07-01T00:00:00.000Z');

  return Array.from({ length: count }, (_, index) => ({
    _id: `qa-application-${String(index + 1).padStart(2, '0')}`,
    company: `Synthetic Company ${String(index + 1).padStart(2, '0')}`,
    role: `Synthetic Role ${index + 1}`,
    currentStatus: STATUSES[index % STATUSES.length],
    createdAt: new Date(baseTime + index * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(baseTime + (count - index) * 60 * 60 * 1000).toISOString(),
    followUpAt:
      index % 4 === 0
        ? null
        : new Date(baseTime + (index - 8) * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function normalizeSource(source) {
  return source.replace(/\s+/g, ' ').trim();
}

function assertIncludes(source, fragment, label) {
  assert.ok(
    normalizeSource(source).includes(normalizeSource(fragment)),
    `${label} source contract is missing`,
  );
}

function countOccurrences(source, fragment) {
  return normalizeSource(source).split(normalizeSource(fragment)).length - 1;
}

async function readSource(relativePath) {
  return readFile(new URL(relativePath, new URL('..', import.meta.url)), 'utf8');
}

function checkCanonicalKeysAndRetryPolicy() {
  const paddedFilters = {
    search: '  platform intern  ',
    status: 'applied',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };
  const canonicalFilters = canonicalizeApplicationFilters(paddedFilters);

  assert.deepEqual(canonicalFilters, {
    search: 'platform intern',
    status: 'applied',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  assert.deepEqual(applicationKeys.list(canonicalFilters), [
    'applications',
    'list',
    canonicalFilters,
  ]);
  assert.deepEqual(applicationKeys.detail('application-a'), [
    'applications',
    'detail',
    'application-a',
  ]);
  assert.deepEqual(applicationKeys.events('application-a'), [
    'applications',
    'detail',
    'application-a',
    'events',
  ]);
  assert.deepEqual(dashboardKeys.summary(), ['dashboard', 'summary']);

  assert.equal(
    retryNetworkOrServerFailureOnce(0, { name: 'ApiError', status: undefined }),
    true,
  );
  assert.equal(retryNetworkOrServerFailureOnce(0, { name: 'ApiError', status: 503 }), true);
  assert.equal(retryNetworkOrServerFailureOnce(0, { name: 'ApiError', status: 400 }), false);
  assert.equal(retryNetworkOrServerFailureOnce(1, { name: 'ApiError', status: 503 }), false);

  console.log('PASS [logic] canonical query keys, filters, and retry policy');
}

async function checkInvalidationAndDeletedCacheBehavior() {
  const applications = createSyntheticApplications();
  const targetId = applications[0]._id;
  const controlId = applications[1]._id;
  const filters = canonicalizeApplicationFilters({
    search: '',
    status: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const filtered = canonicalizeApplicationFilters({
    search: '',
    status: 'offer',
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });
  const client = createQueryClient();

  client.setQueryData(applicationKeys.list(filters), applications);
  client.setQueryData(
    applicationKeys.list(filtered),
    applications.filter((application) => application.currentStatus === 'offer'),
  );
  client.setQueryData(applicationKeys.detail(targetId), applications[0]);
  client.setQueryData(applicationKeys.events(targetId), [{ _id: 'synthetic-event-target' }]);
  client.setQueryData(applicationKeys.detail(controlId), applications[1]);
  client.setQueryData(applicationKeys.events(controlId), [{ _id: 'synthetic-event-control' }]);
  client.setQueryData(dashboardKeys.summary(), { totalApplications: applications.length });

  await Promise.all([
    client.invalidateQueries({ queryKey: applicationKeys.lists(), refetchType: 'none' }),
    client.invalidateQueries({ queryKey: dashboardKeys.summary(), refetchType: 'none' }),
  ]);

  assert.equal(client.getQueryState(applicationKeys.list(filters))?.isInvalidated, true);
  assert.equal(client.getQueryState(applicationKeys.list(filtered))?.isInvalidated, true);
  assert.equal(client.getQueryState(dashboardKeys.summary())?.isInvalidated, true);
  assert.equal(client.getQueryState(applicationKeys.detail(targetId))?.isInvalidated, false);

  await client.invalidateQueries({
    queryKey: applicationKeys.detail(targetId),
    exact: true,
    refetchType: 'none',
  });
  assert.equal(client.getQueryState(applicationKeys.detail(targetId))?.isInvalidated, true);
  assert.equal(client.getQueryState(applicationKeys.events(targetId))?.isInvalidated, false);

  client.removeQueries({ queryKey: applicationKeys.detail(targetId) });
  assert.equal(client.getQueryData(applicationKeys.detail(targetId)), undefined);
  assert.equal(client.getQueryData(applicationKeys.events(targetId)), undefined);
  assert.ok(client.getQueryData(applicationKeys.detail(controlId)));
  assert.ok(client.getQueryData(applicationKeys.events(controlId)));

  const counts = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      applications.filter((application) => application.currentStatus === status).length,
    ]),
  );
  assert.equal(applications.length, 30);
  assert.equal(new Set(applications.map((application) => application._id)).size, 30);
  assert.deepEqual(counts, Object.fromEntries(STATUSES.map((status) => [status, 5])));
  assert.ok(applications.some((application) => application.followUpAt === null));
  assert.ok(applications.some((application) => application.followUpAt !== null));

  client.clear();
  console.log(
    'PASS [synthetic cache] 30 varied applications, prefix invalidation, exact detail invalidation, and deleted detail/event clearing',
  );
}

async function checkMutationAndStateSourceContracts() {
  const [applicationsPage, detailPage, dashboardPage, skeleton, authPresentation, styles] =
    await Promise.all([
      readSource('src/pages/ApplicationsPage/ApplicationsPage.jsx'),
      readSource('src/pages/ApplicationDetailPage/ApplicationDetailPage.jsx'),
      readSource('src/pages/DashboardPage/DashboardPage.jsx'),
      readSource('src/components/feedback/LoadingSkeleton.jsx'),
      readSource('src/features/auth/components/AuthPresentation.jsx'),
      readSource('src/styles.css'),
    ]);

  assert.equal(
    countOccurrences(
      applicationsPage,
      'queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })',
    ),
    3,
  );
  assert.equal(
    countOccurrences(
      applicationsPage,
      'queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() })',
    ),
    3,
  );
  assertIncludes(
    applicationsPage,
    `queryClient.invalidateQueries({
      queryKey: applicationKeys.detail(updatedApplication._id),
      exact: true,
    })`,
    'application update detail invalidation',
  );
  assertIncludes(
    applicationsPage,
    `queryClient.removeQueries({
      queryKey: applicationKeys.detail(deletedApplication._id),
    })`,
    'application-list delete cache clearing',
  );

  assert.equal(
    countOccurrences(
      detailPage,
      'queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })',
    ),
    2,
  );
  assert.equal(
    countOccurrences(
      detailPage,
      'queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() })',
    ),
    5,
  );
  assert.equal(
    countOccurrences(
      detailPage,
      `queryClient.invalidateQueries({
        queryKey: applicationKeys.events(applicationId),
        exact: true,
      })`,
    ),
    3,
  );
  assertIncludes(
    detailPage,
    `queryClient.removeQueries({
      queryKey: applicationKeys.detail(applicationId),
    })`,
    'detail-page delete cache clearing',
  );

  for (const [source, label, requiredFragments] of [
    [
      applicationsPage,
      'application list',
      ['placeholderData: keepPreviousData', 'isBackgroundFetching', 'backgroundQueryError'],
    ],
    [
      detailPage,
      'application detail',
      ['isApplicationUpdating', 'isEventsUpdating', 'backgroundEventsError'],
    ],
    [
      dashboardPage,
      'dashboard',
      ['isBackgroundFetching', 'backgroundLoadError', 'DashboardSkeleton'],
    ],
  ]) {
    for (const fragment of requiredFragments) {
      assertIncludes(source, fragment, `${label} ${fragment}`);
    }
  }

  assertIncludes(skeleton, 'aria-busy="true"', 'skeleton busy status');
  assertIncludes(skeleton, 'role="status"', 'skeleton status role');
  assertIncludes(skeleton, 'aria-live="polite"', 'background update announcement');
  assertIncludes(
    authPresentation,
    "window.matchMedia('(prefers-reduced-motion: reduce)')",
    'reduced-motion runtime guard',
  );
  assertIncludes(
    authPresentation,
    "window.matchMedia('(pointer: coarse), (hover: none)')",
    'coarse-pointer runtime guard',
  );
  assertIncludes(authPresentation, "event.pointerType === 'touch'", 'touch parallax guard');
  assertIncludes(styles, '@media (prefers-reduced-motion: reduce)', 'reduced-motion CSS');
  assertIncludes(styles, '@media (pointer: coarse), (hover: none)', 'coarse-pointer CSS');
  assertIncludes(styles, '.skeleton-block { animation: none; }', 'reduced-motion skeleton rule');

  console.log(
    'PASS [source inspection] mutation invalidation matrix, background states, skeleton accessibility, reduced motion, and touch parallax guards',
  );
}

checkCanonicalKeysAndRetryPolicy();
await checkInvalidationAndDeletedCacheBehavior();
await checkMutationAndStateSourceContracts();
console.log('PASS ApplyFlow V3 frontend query QA checks completed');
