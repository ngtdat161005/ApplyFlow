import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const API_ORIGIN =
  process.env.APPLYFLOW_BACKEND_ORIGIN || 'http://127.0.0.1:4000/api';
const DISPOSABLE_CONFIRMATION = 'YES';
const APPLICATION_COUNT = 30;
const STATUSES = ['saved', 'applied', 'in_process', 'offer', 'rejected', 'withdrawn'];

class QaFailure extends Error {}

function assertStatus(response, expectedStatus, label) {
  assert.equal(response.status, expectedStatus, `${label} returned an unexpected status`);
}

async function request(method, path, { body, token } = {}) {
  let response;

  try {
    response = await fetch(`${API_ORIGIN}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new QaFailure('Unable to reach the configured local QA API origin.');
  }

  const contentType = response.headers.get('content-type') || '';
  let responseBody = null;

  if (contentType.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch {
      throw new QaFailure('The QA API returned malformed JSON.');
    }
  }

  return { body: responseBody, status: response.status };
}

function createApplicationPayload(index) {
  const baseTime = Date.parse('2026-07-01T09:00:00.000Z');

  return {
    company: `V3 QA Synthetic Company ${String(index + 1).padStart(2, '0')}`,
    role: `V3 QA Synthetic Role ${index + 1}`,
    currentStatus: STATUSES[index % STATUSES.length],
    source: index % 2 === 0 ? 'synthetic-seed-a' : 'synthetic-seed-b',
    notes: `Disposable V3 large-list fixture ${index + 1}`,
    followUpAt:
      index % 5 === 0
        ? null
        : new Date(baseTime + (index - 10) * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function getApplications(response) {
  return Array.isArray(response.body?.applications) ? response.body.applications : [];
}

if (process.env.V3_QA_DISPOSABLE_CONFIRM !== DISPOSABLE_CONFIRMATION) {
  console.log(
    'SKIPPED V3 large-dataset HTTP E2E: set V3_QA_DISPOSABLE_CONFIRM=YES only for an explicitly disposable test database.',
  );
  process.exitCode = 0;
} else {
  const runId = randomUUID();
  const email = `v3-qa-${runId}@example.test`;
  const password = `V3-qa-${runId}-pass`;
  const createdApplicationIds = [];
  let accessToken = '';
  let accountDeleted = false;
  let accountDeleteUnsupported = false;
  let mainError = null;

  try {
    const healthResponse = await request('GET', '/health');
    assertStatus(healthResponse, 200, 'health check');

    const registerResponse = await request('POST', '/auth/register', {
      body: {
        displayName: 'V3 QA Synthetic User',
        email,
        password,
      },
    });
    assertStatus(registerResponse, 201, 'disposable registration');

    const loginResponse = await request('POST', '/auth/login', {
      body: { email, password },
    });
    assertStatus(loginResponse, 200, 'disposable login');
    accessToken = loginResponse.body?.accessToken || '';
    assert.ok(accessToken, 'login must return an access token');

    for (let index = 0; index < APPLICATION_COUNT; index += 1) {
      const createResponse = await request('POST', '/applications', {
        token: accessToken,
        body: createApplicationPayload(index),
      });
      assertStatus(createResponse, 201, `create synthetic application ${index + 1}`);
      const applicationId = createResponse.body?.application?._id;
      assert.ok(applicationId, 'created application must include an ID');
      createdApplicationIds.push(applicationId);
    }

    const defaultListResponse = await request(
      'GET',
      '/applications?sortBy=updatedAt&sortOrder=desc',
      { token: accessToken },
    );
    assertStatus(defaultListResponse, 200, 'default large list');
    assert.equal(getApplications(defaultListResponse).length, APPLICATION_COUNT);

    const filteredResponse = await request(
      'GET',
      '/applications?status=offer&sortBy=createdAt&sortOrder=asc',
      { token: accessToken },
    );
    assertStatus(filteredResponse, 200, 'status-filtered large list');
    assert.equal(getApplications(filteredResponse).length, APPLICATION_COUNT / STATUSES.length);
    assert.ok(
      getApplications(filteredResponse).every(
        (application) => application.currentStatus === 'offer',
      ),
    );

    const searchResponse = await request(
      'GET',
      `/applications?search=${encodeURIComponent('V3 QA Synthetic')}`,
      { token: accessToken },
    );
    assertStatus(searchResponse, 200, 'large-list search');
    assert.equal(getApplications(searchResponse).length, APPLICATION_COUNT);

    const followUpResponse = await request(
      'GET',
      '/applications?sortBy=followUpAt&sortOrder=asc',
      { token: accessToken },
    );
    assertStatus(followUpResponse, 200, 'large-list follow-up sort');
    assert.equal(getApplications(followUpResponse).length, APPLICATION_COUNT);

    const dashboardResponse = await request('GET', '/dashboard/summary', {
      token: accessToken,
    });
    assertStatus(dashboardResponse, 200, 'large-dataset dashboard');
    assert.equal(dashboardResponse.body?.dashboard?.totalApplications, APPLICATION_COUNT);
    for (const status of STATUSES) {
      assert.equal(
        dashboardResponse.body?.dashboard?.countsByStatus?.[status],
        APPLICATION_COUNT / STATUSES.length,
      );
    }

    console.log(
      'PASS [HTTP E2E] 30 disposable applications across six statuses; list, search, filter, sorts, and dashboard counts',
    );

    const deleteAccountResponse = await request('DELETE', '/users/me', {
      token: accessToken,
      body: { password },
    });

    if (deleteAccountResponse.status === 200) {
      accountDeleted = true;
      const oldSessionResponse = await request('GET', '/auth/me', { token: accessToken });
      assertStatus(oldSessionResponse, 401, 'deleted account old session');
      const deletedLoginResponse = await request('POST', '/auth/login', {
        body: { email, password },
      });
      assertStatus(deletedLoginResponse, 401, 'deleted account login');
      console.log('PASS [HTTP E2E] account-deletion cleanup and old-session invalidation');
    } else if (deleteAccountResponse.status === 503) {
      accountDeleteUnsupported = true;
      console.log(
        'SKIPPED account-deletion cleanup: configured database does not support the required transaction; application cleanup will run and the disposable user will remain.',
      );
    } else {
      throw new QaFailure('Account-deletion cleanup returned an unexpected status.');
    }
  } catch (error) {
    mainError =
      error instanceof Error ? error : new QaFailure('Unexpected V3 large-dataset QA failure.');
  } finally {
    const cleanupFailures = [];

    if (!accountDeleted && accessToken) {
      for (const applicationId of [...createdApplicationIds].reverse()) {
        try {
          const cleanupResponse = await request('DELETE', `/applications/${applicationId}`, {
            token: accessToken,
          });

          if (![200, 404].includes(cleanupResponse.status)) {
            cleanupFailures.push('application cleanup returned an unexpected status');
          }
        } catch {
          cleanupFailures.push('application cleanup request failed');
        }
      }

      if (!accountDeleteUnsupported) {
        try {
          const accountCleanupResponse = await request('DELETE', '/users/me', {
            token: accessToken,
            body: { password },
          });

          if (accountCleanupResponse.status === 200) {
            accountDeleted = true;
          } else if (accountCleanupResponse.status === 503) {
            console.log(
              'SKIPPED disposable-user cleanup: configured database does not support the required transaction; the synthetic user remains.',
            );
          } else {
            cleanupFailures.push('account cleanup returned an unexpected status');
          }
        } catch {
          cleanupFailures.push('account cleanup request failed');
        }
      }
    }

    if (mainError) {
      console.error(`FAIL ${mainError.message}`);
    }
    for (const cleanupFailure of cleanupFailures) {
      console.error(`FAIL ${cleanupFailure}`);
    }

    if (mainError || cleanupFailures.length > 0) {
      process.exitCode = 1;
    } else {
      console.log('PASS ApplyFlow V3 large-dataset HTTP E2E completed');
    }
  }
}
