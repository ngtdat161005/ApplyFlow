const DEFAULT_ORIGIN = "http://127.0.0.1:4000";
const API_ORIGIN = (process.env.APPLYFLOW_BACKEND_ORIGIN || DEFAULT_ORIGIN).replace(/\/+$/, "");

const createdApplications = [];
let primaryToken = null;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertStatus(response, expectedStatus, label) {
  assert(
    response.status === expectedStatus,
    `${label} expected HTTP ${expectedStatus}, got ${response.status}: ${JSON.stringify(response.body)}`,
  );
}

function assertControlledError(response, label) {
  assert(
    typeof response.body?.message === "string" && response.body.message.length > 0,
    `${label} should return a readable error message`,
  );
  assert(
    !JSON.stringify(response.body).includes("[object Object]"),
    `${label} should not return an unreadable object string`,
  );
}

function assertValidationError(response, fieldName, label) {
  assertControlledError(response, label);
  assert(
    response.body?.message === "Validation failed",
    `${label} should use validation error shape`,
  );
  assert(
    typeof response.body?.errors?.[fieldName] === "string",
    `${label} should include an error for ${fieldName}`,
  );
}

async function request(method, path, { token, body } = {}) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(`${API_ORIGIN}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(
      `Unable to reach backend at ${API_ORIGIN}. Start the backend first or set APPLYFLOW_BACKEND_ORIGIN. ${error.message}`,
    );
  }

  const text = await response.text();
  let responseBody = null;

  if (text) {
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = text;
    }
  }

  return {
    status: response.status,
    body: responseBody,
  };
}

async function createTestUser(label) {
  const uniqueId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const user = {
    displayName: `ApplyFlow E2E ${label}`,
    email: `applyflow-e2e-${label}-${uniqueId}@example.test`,
    password: "ApplyFlowE2E123!",
  };

  const registerResponse = await request("POST", "/auth/register", { body: user });
  assertStatus(registerResponse, 201, `${label} register`);
  assert(registerResponse.body?.user?.email === user.email, `${label} register should return user`);

  const loginResponse = await request("POST", "/auth/login", {
    body: {
      email: user.email,
      password: user.password,
    },
  });
  assertStatus(loginResponse, 200, `${label} login`);
  assert(loginResponse.body?.accessToken, `${label} login should return an access token`);

  return {
    ...user,
    token: loginResponse.body.accessToken,
    userId: loginResponse.body.user?._id,
  };
}

async function cleanupApplication(token, applicationId) {
  if (!token || !applicationId) {
    return;
  }

  const response = await request("DELETE", `/applications/${applicationId}`, { token });

  if (![200, 404].includes(response.status)) {
    console.warn(
      `WARN cleanup failed for application ${applicationId}: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }
}

function forgetCreatedApplication(applicationId) {
  const index = createdApplications.findIndex((item) => item.applicationId === applicationId);

  assert(index >= 0, `application ${applicationId} should be tracked for cleanup`);
  createdApplications.splice(index, 1);
}

function applicationPayload(overrides = {}) {
  return {
    company: "ApplyFlow E2E Company",
    role: "Backend Test Engineer",
    currentStatus: "applied",
    jdUrl: "https://example.test/applyflow-e2e",
    source: "E2E script",
    notes: "Created by backend/scripts/check-backend-e2e.js",
    followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

async function main() {
  console.log(`ApplyFlow backend E2E checks against ${API_ORIGIN}`);

  const healthResponse = await request("GET", "/health");
  assertStatus(healthResponse, 200, "health check");
  assert(healthResponse.body?.success === true, "health check should report success");
  console.log("PASS health check");

  const primaryUser = await createTestUser("primary");
  primaryToken = primaryUser.token;

  const meResponse = await request("GET", "/auth/me", { token: primaryToken });
  assertStatus(meResponse, 200, "auth me");
  assert(meResponse.body?.user?.email === primaryUser.email, "auth me should return current user");
  console.log("PASS auth register/login/me");

  const badLoginResponse = await request("POST", "/auth/login", {
    body: {
      email: primaryUser.email,
      password: "wrong-password",
    },
  });
  assert([400, 401].includes(badLoginResponse.status), "bad login should fail with 400 or 401");
  assertControlledError(badLoginResponse, "bad login");

  const invalidApplicationResponse = await request("POST", "/applications", {
    token: primaryToken,
    body: applicationPayload({ currentStatus: "invalid_status" }),
  });
  assertStatus(invalidApplicationResponse, 400, "invalid application status");
  assertControlledError(invalidApplicationResponse, "invalid application status");

  const malformedApplicationIdResponse = await request("GET", "/applications/not-an-object-id", {
    token: primaryToken,
  });
  assertStatus(malformedApplicationIdResponse, 400, "malformed application id");
  assertControlledError(malformedApplicationIdResponse, "malformed application id");

  const malformedUpdateIdResponse = await request(
    "PATCH",
    "/applications/not-an-object-id",
    {
      token: primaryToken,
      body: {
        company: "ApplyFlow",
      },
    },
  );
  assertStatus(malformedUpdateIdResponse, 400, "malformed application update id");
  assertControlledError(malformedUpdateIdResponse, "malformed application update id");

  const malformedDeleteIdResponse = await request(
    "DELETE",
    "/applications/not-an-object-id",
    { token: primaryToken },
  );
  assertStatus(malformedDeleteIdResponse, 400, "malformed application delete id");
  assertControlledError(malformedDeleteIdResponse, "malformed application delete id");
  console.log("PASS auth and application validation errors");

  const createApplicationResponse = await request("POST", "/applications", {
    token: primaryToken,
    body: applicationPayload(),
  });
  assertStatus(createApplicationResponse, 201, "create application");
  const application = createApplicationResponse.body?.application;
  assert(application?._id, "create application should return an application id");
  createdApplications.push({ token: primaryToken, applicationId: application._id });

  const applicationId = application._id;
  const nonexistentApplicationId = "ffffffffffffffffffffffff";
  const secondUser = await createTestUser("secondary");
  const crossUserResponse = await request("GET", `/applications/${applicationId}`, {
    token: secondUser.token,
  });
  assertStatus(crossUserResponse, 404, "cross-user application detail");
  assertControlledError(crossUserResponse, "cross-user application access");

  const crossUserUpdateResponse = await request("PATCH", `/applications/${applicationId}`, {
    token: secondUser.token,
    body: {
      company: "Cross-user update",
    },
  });
  assertStatus(crossUserUpdateResponse, 404, "cross-user application update");
  assertControlledError(crossUserUpdateResponse, "cross-user application update");

  const crossUserDeleteResponse = await request("DELETE", `/applications/${applicationId}`, {
    token: secondUser.token,
  });
  assertStatus(crossUserDeleteResponse, 404, "cross-user application delete");
  assertControlledError(crossUserDeleteResponse, "cross-user application delete");

  const ownerDetailAfterCrossUserDelete = await request("GET", `/applications/${applicationId}`, {
    token: primaryToken,
  });
  assertStatus(ownerDetailAfterCrossUserDelete, 200, "owner detail after cross-user delete");

  const nonexistentDetailResponse = await request(
    "GET",
    `/applications/${nonexistentApplicationId}`,
    { token: primaryToken },
  );
  assertStatus(nonexistentDetailResponse, 404, "nonexistent application detail");

  const nonexistentUpdateResponse = await request(
    "PATCH",
    `/applications/${nonexistentApplicationId}`,
    {
      token: primaryToken,
      body: {
        company: "No application",
      },
    },
  );
  assertStatus(nonexistentUpdateResponse, 404, "nonexistent application update");

  const nonexistentDeleteResponse = await request(
    "DELETE",
    `/applications/${nonexistentApplicationId}`,
    { token: primaryToken },
  );
  assertStatus(nonexistentDeleteResponse, 404, "nonexistent application delete");
  console.log("PASS application detail/update/delete ownership and not-found behavior");

  const listResponse = await request("GET", "/applications", { token: primaryToken });
  assertStatus(listResponse, 200, "list applications");
  assert(
    listResponse.body?.applications?.some((item) => item._id === applicationId),
    "list applications should include created application",
  );

  const searchResponse = await request("GET", "/applications?search=ApplyFlow%20E2E", {
    token: primaryToken,
  });
  assertStatus(searchResponse, 200, "search applications");
  assert(
    searchResponse.body?.applications?.some((item) => item._id === applicationId),
    "search should find created application",
  );

  const filterResponse = await request("GET", "/applications?status=applied", {
    token: primaryToken,
  });
  assertStatus(filterResponse, 200, "filter applications");
  assert(
    filterResponse.body?.applications?.every((item) => item.currentStatus === "applied"),
    "status filter should only return applied applications",
  );

  const sortResponse = await request(
    "GET",
    "/applications?sortBy=updatedAt&sortOrder=desc",
    { token: primaryToken },
  );
  assertStatus(sortResponse, 200, "sort applications");
  assert(Array.isArray(sortResponse.body?.applications), "sort response should include applications");
  console.log("PASS application create/list/search/filter/sort");

  const detailResponse = await request("GET", `/applications/${applicationId}`, {
    token: primaryToken,
  });
  assertStatus(detailResponse, 200, "application detail");
  assert(detailResponse.body?.application?._id === applicationId, "detail should return application");

  const blankCompanyResponse = await request("PATCH", `/applications/${applicationId}`, {
    token: primaryToken,
    body: {
      company: "   ",
    },
  });
  assertStatus(blankCompanyResponse, 400, "blank application company");
  assertValidationError(blankCompanyResponse, "company", "blank application company");

  const forbiddenFieldResponse = await request("PATCH", `/applications/${applicationId}`, {
    token: primaryToken,
    body: {
      userId: secondUser.userId,
    },
  });
  assertStatus(forbiddenFieldResponse, 400, "forbidden application update field");
  assertValidationError(forbiddenFieldResponse, "body", "forbidden application update field");

  const malformedFollowUpResponse = await request("PATCH", `/applications/${applicationId}`, {
    token: primaryToken,
    body: {
      followUpAt: "",
    },
  });
  assertStatus(malformedFollowUpResponse, 400, "malformed application follow-up date");
  assertValidationError(
    malformedFollowUpResponse,
    "followUpAt",
    "malformed application follow-up date",
  );

  const updateResponse = await request("PATCH", `/applications/${applicationId}`, {
    token: primaryToken,
    body: {
      company: "  ApplyFlow E2E Company Updated  ",
      role: "  Backend Contract Engineer  ",
      currentStatus: "in_process",
      jdUrl: null,
      source: null,
      notes: null,
      followUpAt: null,
    },
  });
  assertStatus(updateResponse, 200, "application update");
  assert(
    updateResponse.body?.application?.company === "ApplyFlow E2E Company Updated",
    "application update should trim company",
  );
  assert(
    updateResponse.body?.application?.role === "Backend Contract Engineer",
    "application update should trim role",
  );
  assert(
    updateResponse.body?.application?.currentStatus === "in_process",
    "application update should persist status",
  );
  for (const nullableField of ["jdUrl", "source", "notes", "followUpAt"]) {
    assert(
      updateResponse.body?.application?.[nullableField] === null,
      `application update should clear ${nullableField} with null`,
    );
  }
  console.log("PASS application detail/update validation and null clearing");

  const secondaryApplicationResponse = await request("POST", "/applications", {
    token: secondUser.token,
    body: applicationPayload({
      company: "Secondary User Company",
      role: "Secondary User Role",
    }),
  });
  assertStatus(secondaryApplicationResponse, 201, "create secondary application");
  const secondaryApplicationId = secondaryApplicationResponse.body?.application?._id;
  assert(secondaryApplicationId, "secondary application should return an application id");
  createdApplications.push({
    token: secondUser.token,
    applicationId: secondaryApplicationId,
  });

  const wrongParentApplicationResponse = await request("POST", "/applications", {
    token: primaryToken,
    body: applicationPayload({
      company: "Wrong Parent Company",
      role: "Wrong Parent Role",
    }),
  });
  assertStatus(wrongParentApplicationResponse, 201, "create wrong-parent application");
  const wrongParentApplicationId = wrongParentApplicationResponse.body?.application?._id;
  assert(wrongParentApplicationId, "wrong-parent application should return an application id");
  createdApplications.push({
    token: primaryToken,
    applicationId: wrongParentApplicationId,
  });

  const secondaryEventResponse = await request(
    "POST",
    `/applications/${secondaryApplicationId}/events`,
    {
      token: secondUser.token,
      body: {
        type: "note",
        title: "Secondary user event",
      },
    },
  );
  assertStatus(secondaryEventResponse, 201, "create secondary event");
  const secondaryEventId = secondaryEventResponse.body?.event?._id;
  assert(secondaryEventId, "secondary event should return an event id");

  const malformedEventApplicationIdResponse = await request(
    "GET",
    "/applications/not-an-object-id/events",
    { token: primaryToken },
  );
  assertStatus(malformedEventApplicationIdResponse, 400, "malformed event application id");
  assertControlledError(malformedEventApplicationIdResponse, "malformed event application id");

  const nonexistentParentEventsResponse = await request(
    "GET",
    `/applications/${nonexistentApplicationId}/events`,
    { token: primaryToken },
  );
  assertStatus(nonexistentParentEventsResponse, 404, "nonexistent event parent");
  assertControlledError(nonexistentParentEventsResponse, "nonexistent event parent");

  const crossUserCreateEventResponse = await request(
    "POST",
    `/applications/${secondaryApplicationId}/events`,
    {
      token: primaryToken,
      body: {
        type: "note",
        title: "Cross-user event",
      },
    },
  );
  assertStatus(crossUserCreateEventResponse, 404, "cross-user event create");
  assertControlledError(crossUserCreateEventResponse, "cross-user event create");

  const crossUserListEventsResponse = await request(
    "GET",
    `/applications/${secondaryApplicationId}/events`,
    { token: primaryToken },
  );
  assertStatus(crossUserListEventsResponse, 404, "cross-user event list");
  assertControlledError(crossUserListEventsResponse, "cross-user event list");

  const invalidEventCreateCases = [
    {
      label: "invalid event type",
      fieldName: "type",
      body: { type: "invalid_event_type", title: "Invalid event" },
    },
    {
      label: "blank event title",
      fieldName: "title",
      body: { type: "note", title: "   " },
    },
    {
      label: "malformed event date",
      fieldName: "scheduledAt",
      body: { type: "note", title: "Invalid date", scheduledAt: "" },
    },
    {
      label: "invalid event mode",
      fieldName: "mode",
      body: { type: "note", title: "Invalid mode", mode: "video" },
    },
    {
      label: "invalid event contact email",
      fieldName: "contactEmail",
      body: { type: "note", title: "Invalid email", contactEmail: "invalid" },
    },
    {
      label: "invalid event meeting link",
      fieldName: "meetingLink",
      body: { type: "note", title: "Invalid link", meetingLink: "not-a-url" },
    },
  ];

  for (const { label, fieldName, body } of invalidEventCreateCases) {
    const response = await request("POST", `/applications/${applicationId}/events`, {
      token: primaryToken,
      body,
    });

    assertStatus(response, 400, label);
    assertValidationError(response, fieldName, label);
  }
  console.log("PASS event parent ownership and create validation");

  const createEventResponse = await request("POST", `/applications/${applicationId}/events`, {
    token: primaryToken,
    body: {
      type: "interview",
      title: "Technical Interview",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      mode: "online",
      meetingLink: "https://meet.example.test/applyflow-e2e",
      note: "Created by E2E script",
    },
  });
  assertStatus(createEventResponse, 201, "create event");
  const event = createEventResponse.body?.event;
  assert(event?._id, "create event should return an event id");

  const malformedEventUpdateIdResponse = await request(
    "PATCH",
    `/applications/${applicationId}/events/not-an-object-id`,
    {
      token: primaryToken,
      body: {
        title: "Malformed event id",
      },
    },
  );
  assertStatus(malformedEventUpdateIdResponse, 400, "malformed event update id");

  const malformedEventDeleteIdResponse = await request(
    "DELETE",
    `/applications/${applicationId}/events/not-an-object-id`,
    { token: primaryToken },
  );
  assertStatus(malformedEventDeleteIdResponse, 400, "malformed event delete id");

  const nonexistentEventId = "eeeeeeeeeeeeeeeeeeeeeeee";
  const nonexistentEventUpdateResponse = await request(
    "PATCH",
    `/applications/${applicationId}/events/${nonexistentEventId}`,
    {
      token: primaryToken,
      body: {
        title: "Nonexistent event",
      },
    },
  );
  assertStatus(nonexistentEventUpdateResponse, 404, "nonexistent event update");

  const nonexistentEventDeleteResponse = await request(
    "DELETE",
    `/applications/${applicationId}/events/${nonexistentEventId}`,
    { token: primaryToken },
  );
  assertStatus(nonexistentEventDeleteResponse, 404, "nonexistent event delete");

  const wrongParentUpdateResponse = await request(
    "PATCH",
    `/applications/${wrongParentApplicationId}/events/${event._id}`,
    {
      token: primaryToken,
      body: {
        title: "Wrong parent update",
      },
    },
  );
  assertStatus(wrongParentUpdateResponse, 404, "wrong-parent event update");

  const wrongParentDeleteResponse = await request(
    "DELETE",
    `/applications/${wrongParentApplicationId}/events/${event._id}`,
    { token: primaryToken },
  );
  assertStatus(wrongParentDeleteResponse, 404, "wrong-parent event delete");

  const crossUserUpdateEventResponse = await request(
    "PATCH",
    `/applications/${secondaryApplicationId}/events/${event._id}`,
    {
      token: secondUser.token,
      body: {
        title: "Cross-user update",
      },
    },
  );
  assertStatus(crossUserUpdateEventResponse, 404, "cross-user event update");

  const crossUserDeleteEventResponse = await request(
    "DELETE",
    `/applications/${secondaryApplicationId}/events/${event._id}`,
    { token: secondUser.token },
  );
  assertStatus(crossUserDeleteEventResponse, 404, "cross-user event delete");

  const invalidEventUpdateCases = [
    {
      label: "blank event update title",
      fieldName: "title",
      body: { title: "   " },
    },
    {
      label: "forbidden event update field",
      fieldName: "body",
      body: { applicationId: wrongParentApplicationId },
    },
    {
      label: "malformed event update date",
      fieldName: "occurredAt",
      body: { occurredAt: "" },
    },
    {
      label: "invalid event update mode",
      fieldName: "mode",
      body: { mode: "video" },
    },
    {
      label: "invalid event update email",
      fieldName: "contactEmail",
      body: { contactEmail: "invalid" },
    },
    {
      label: "invalid event update meeting link",
      fieldName: "meetingLink",
      body: { meetingLink: "not-a-url" },
    },
  ];

  for (const { label, fieldName, body } of invalidEventUpdateCases) {
    const response = await request(
      "PATCH",
      `/applications/${applicationId}/events/${event._id}`,
      { token: primaryToken, body },
    );

    assertStatus(response, 400, label);
    assertValidationError(response, fieldName, label);
  }

  const updateEventResponse = await request(
    "PATCH",
    `/applications/${applicationId}/events/${event._id}`,
    {
      token: primaryToken,
      body: {
        type: "note",
        title: "  Updated Technical Interview  ",
        occurredAt: null,
        scheduledAt: null,
        mode: null,
        location: null,
        meetingLink: null,
        contactName: null,
        contactPhone: null,
        contactEmail: null,
        note: null,
      },
    },
  );
  assertStatus(updateEventResponse, 200, "update event");
  assert(
    updateEventResponse.body?.event?.title === "Updated Technical Interview",
    "event update should trim and persist title",
  );
  assert(updateEventResponse.body?.event?.type === "note", "event update should persist type");
  for (const nullableField of [
    "occurredAt",
    "scheduledAt",
    "mode",
    "location",
    "meetingLink",
    "contactName",
    "contactPhone",
    "contactEmail",
    "note",
  ]) {
    assert(
      updateEventResponse.body?.event?.[nullableField] === null,
      `event update should clear ${nullableField} with null`,
    );
  }

  const timelineBase = Date.now() + 60 * 60 * 1000;
  const timelinePayloads = [
    {
      type: "note",
      title: "Timeline created fallback",
    },
    {
      type: "note",
      title: "Timeline occurred first",
      occurredAt: new Date(timelineBase).toISOString(),
    },
    {
      type: "note",
      title: "Timeline scheduled second",
      scheduledAt: new Date(timelineBase + 60 * 60 * 1000).toISOString(),
    },
    {
      type: "note",
      title: "Timeline occurred wins",
      occurredAt: new Date(timelineBase + 2 * 60 * 60 * 1000).toISOString(),
      scheduledAt: new Date(timelineBase - 30 * 60 * 1000).toISOString(),
    },
  ];
  const timelineEventIds = [];

  for (const body of timelinePayloads) {
    const response = await request("POST", `/applications/${applicationId}/events`, {
      token: primaryToken,
      body,
    });

    assertStatus(response, 201, `create ${body.title}`);
    timelineEventIds.push(response.body?.event?._id);
  }

  const listEventsResponse = await request("GET", `/applications/${applicationId}/events`, {
    token: primaryToken,
  });
  assertStatus(listEventsResponse, 200, "list events");
  assert(
    listEventsResponse.body?.events?.some((item) => item._id === event._id),
    "event list should include created event",
  );
  const listedEventIds = listEventsResponse.body.events.map((item) => item._id);
  const timelinePositions = timelineEventIds.map((eventId) => listedEventIds.indexOf(eventId));

  assert(
    timelinePositions.every((position) => position >= 0),
    "timeline list should include every created ordering event",
  );
  assert(
    timelinePositions.every(
      (position, index) => index === 0 || timelinePositions[index - 1] < position,
    ),
    "timeline events should use ascending effective-date order",
  );

  const refreshedEventsResponse = await request("GET", `/applications/${applicationId}/events`, {
    token: primaryToken,
  });
  assertStatus(refreshedEventsResponse, 200, "refreshed event list");
  const refreshedEventIds = refreshedEventsResponse.body?.events?.map((item) => item._id) ?? [];
  assert(
    refreshedEventIds.length === listedEventIds.length &&
      refreshedEventIds.every((eventId, index) => eventId === listedEventIds[index]),
    "timeline ordering should remain stable across refreshes",
  );

  const deleteEventResponse = await request(
    "DELETE",
    `/applications/${applicationId}/events/${event._id}`,
    { token: primaryToken },
  );
  assertStatus(deleteEventResponse, 200, "delete event");
  console.log("PASS event ownership, update validation, null clearing, CRUD, and timeline order");

  const deleteWrongParentApplicationResponse = await request(
    "DELETE",
    `/applications/${wrongParentApplicationId}`,
    { token: primaryToken },
  );
  assertStatus(deleteWrongParentApplicationResponse, 200, "delete wrong-parent application");
  forgetCreatedApplication(wrongParentApplicationId);

  const cascadeEventResponse = await request("POST", `/applications/${applicationId}/events`, {
    token: primaryToken,
    body: {
      type: "follow_up",
      title: "Cascade check follow-up",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  });
  assertStatus(cascadeEventResponse, 201, "create cascade event");

  const dashboardBeforeDeleteResponse = await request("GET", "/dashboard/summary", {
    token: primaryToken,
  });
  assertStatus(dashboardBeforeDeleteResponse, 200, "dashboard summary");
  const dashboardBeforeDelete = dashboardBeforeDeleteResponse.body?.dashboard;
  const statusCounts = dashboardBeforeDelete?.statusCounts ?? dashboardBeforeDelete?.countsByStatus;
  assert(
    typeof dashboardBeforeDelete?.totalApplications === "number",
    "dashboard should include totalApplications",
  );
  assert(statusCounts && typeof statusCounts === "object", "dashboard should include status counts");
  assert(
    Array.isArray(dashboardBeforeDelete?.upcomingEvents),
    "dashboard should include upcomingEvents",
  );
  assert(
    Array.isArray(dashboardBeforeDelete?.attentionFlags),
    "dashboard should include attentionFlags",
  );
  assert(
    dashboardBeforeDelete.totalApplications >= 1,
    "dashboard should include created application before delete",
  );
  console.log("PASS dashboard summary shape");

  const deleteApplicationResponse = await request("DELETE", `/applications/${applicationId}`, {
    token: primaryToken,
  });
  assertStatus(deleteApplicationResponse, 200, "delete application");
  forgetCreatedApplication(applicationId);

  const deletedDetailResponse = await request("GET", `/applications/${applicationId}`, {
    token: primaryToken,
  });
  assertStatus(deletedDetailResponse, 404, "deleted application detail");

  const deletedEventsResponse = await request("GET", `/applications/${applicationId}/events`, {
    token: primaryToken,
  });
  assertStatus(deletedEventsResponse, 404, "deleted application events");

  const dashboardAfterDeleteResponse = await request("GET", "/dashboard/summary", {
    token: primaryToken,
  });
  assertStatus(dashboardAfterDeleteResponse, 200, "dashboard after delete");
  const dashboardAfterDelete = dashboardAfterDeleteResponse.body?.dashboard;
  assert(
    dashboardAfterDelete.totalApplications === 0,
    "dashboard should not include deleted application",
  );
  assert(
    dashboardAfterDelete.upcomingEvents.every((item) => item.applicationId !== applicationId),
    "dashboard should not include events for deleted application",
  );
  assert(
    dashboardAfterDelete.attentionFlags.every((item) => item.applicationId !== applicationId),
    "dashboard should not include flags for deleted application",
  );

  const secondaryEventsAfterDelete = await request(
    "GET",
    `/applications/${secondaryApplicationId}/events`,
    { token: secondUser.token },
  );
  assertStatus(secondaryEventsAfterDelete, 200, "secondary events after primary delete");
  assert(
    secondaryEventsAfterDelete.body?.events?.some((item) => item._id === secondaryEventId),
    "deleting the primary application must not delete the secondary user's event",
  );
  console.log("PASS user-scoped delete cascade");
}

try {
  await main();
  console.log("PASS ApplyFlow backend E2E checks completed");
} catch (error) {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const { token, applicationId } of [...createdApplications].reverse()) {
    await cleanupApplication(token, applicationId);
  }
}
