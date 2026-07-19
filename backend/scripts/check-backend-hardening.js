import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

process.env.NODE_ENV ||= "development";
process.env.PORT ||= "4000";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017";
process.env.MONGODB_DB_NAME ||= "applyflow_test";
process.env.JWT_SECRET ||= "test-secret-for-hardening-check";
process.env.FRONTEND_ORIGIN ||= "http://localhost:5173";
process.env.EMAIL_PROVIDER ||= "console";

const {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} = await import("../src/domain/shared/domain-errors.js");
const {
  buildApplicationsFilter,
  buildApplicationsSort,
} = await import("../src/modules/application/application.repository.js");
const {
  validateApplicationIdParams,
  validateListApplicationsQuery,
  validateUpdateApplicationPayload,
} = await import(
  "../src/modules/application/application.validator.js"
);
const { buildApplicationEventsForUserFilter, buildEventForUserFilter } = await import(
  "../src/modules/event/event.repository.js"
);
const {
  validateApplicationEventDetailParams,
  validateApplicationEventParams,
  validateCreateEventPayload,
  validateUpdateEventPayload,
} = await import("../src/modules/event/event.validator.js");
const { getEventEffectiveDate, sortTimelineEvents } = await import(
  "../src/domain/timeline/timeline.utils.js"
);
const { computeAttentionFlags } = await import(
  "../src/domain/attention/attention.service.js"
);
const { APPLICATION_STATUSES } = await import("../src/config/constants.js");
const { buildDashboardSummary, RECENT_APPLICATION_LIMIT } = await import(
  "../src/modules/dashboard/dashboard.service.js"
);
const { validateBody, validateQuery } = await import("../src/middlewares/validate.middleware.js");
const { toObjectId } = await import("../src/utils/object-id.utils.js");
const { validateForgotPasswordPayload } = await import(
  "../src/modules/auth/auth.validator.js"
);
const { createForgotPasswordRateLimitMiddleware } = await import(
  "../src/middlewares/forgot-password-rate-limit.middleware.js"
);
const { createPasswordResetEmailSender } = await import(
  "../src/services/email/password-reset-email.adapter.js"
);
const { createPasswordResetRequester } = await import(
  "../src/modules/auth/password-reset.service.js"
);
const { createRawPasswordResetToken, hashPasswordResetToken } = await import(
  "../src/modules/auth/password-reset-token.js"
);
const { createApp } = await import("../src/app.js");

const VALID_USER_ID = "0123456789abcdef01234567";
const VALID_APPLICATION_ID = "abcdefabcdefabcdefabcdef";
const VALID_EVENT_ID = "111111111111111111111111";

function createMockResponse() {
  return {
    body: null,
    statusCode: null,
    json(payload) {
      this.body = payload;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
  };
}

async function runMiddleware(error) {
  const { errorMiddleware } = await import("../src/middlewares/error.middleware.js");
  const response = createMockResponse();

  errorMiddleware(error, {}, response, () => {});

  return response;
}

async function runAuthMiddleware(headers = {}) {
  const { requireAuth } = await import("../src/middlewares/auth.middleware.js");
  const request = {
    get(name) {
      return headers[name.toLowerCase()];
    },
  };

  const nextError = await new Promise((resolve, reject) => {
    Promise.resolve(requireAuth(request, {}, resolve)).catch(reject);
  });

  return {
    request,
    error: nextError,
  };
}

async function runRequestMiddleware(middleware, request) {
  const nextError = await new Promise((resolve, reject) => {
    Promise.resolve(middleware(request, {}, resolve)).catch(reject);
  });

  return nextError;
}

async function assertRejectsWithBadRequest(action, expectedMessage) {
  await assert.rejects(
    action,
    (error) =>
      error instanceof BadRequestError &&
      error.statusCode === 400 &&
      error.message === expectedMessage,
  );
}

function checkObjectIdUtility() {
  const validLowercaseId = "0123456789abcdef01234567";
  const validUppercaseId = "ABCDEFABCDEFABCDEFABCDEF";
  const objectId = new ObjectId();

  assert.ok(toObjectId(validLowercaseId) instanceof ObjectId);
  assert.equal(toObjectId(validLowercaseId).toString(), validLowercaseId);
  assert.ok(toObjectId(validUppercaseId) instanceof ObjectId);
  assert.equal(toObjectId(validUppercaseId).toString(), validUppercaseId.toLowerCase());
  assert.equal(toObjectId(objectId), objectId);

  for (const malformedId of [
    "123",
    "not-an-object-id",
    "abcdefghijkl",
    "",
    null,
    undefined,
  ]) {
    assert.equal(toObjectId(malformedId), null, `Expected ${malformedId} to be rejected`);
  }
}

async function checkApplicationListContract() {
  const userId = new ObjectId(VALID_USER_ID);
  const defaults = validateListApplicationsQuery({});

  assert.deepEqual(defaults, {
    value: {
      search: "",
      status: null,
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
    errors: {},
  });

  const whitespaceSearch = validateListApplicationsQuery({ search: "   " });
  assert.equal(whitespaceSearch.value.search, "");
  assert.deepEqual(whitespaceSearch.errors, {});
  assert.deepEqual(buildApplicationsFilter(userId, whitespaceSearch.value), { userId });

  const normalized = validateListApplicationsQuery({
    search: "  Frontend (Intern)  ",
    status: "in_process",
    sortBy: "followUpAt",
    sortOrder: "asc",
  });

  assert.deepEqual(normalized, {
    value: {
      search: "Frontend (Intern)",
      status: "in_process",
      sortBy: "followUpAt",
      sortOrder: "asc",
    },
    errors: {},
  });

  for (const status of [
    "saved",
    "applied",
    "in_process",
    "offer",
    "rejected",
    "withdrawn",
  ]) {
    assert.deepEqual(validateListApplicationsQuery({ status }).errors, {});
  }

  assert.deepEqual(validateListApplicationsQuery({ status: "interviewing" }).errors, {
    status: "Status is invalid",
  });
  assert.deepEqual(validateListApplicationsQuery({ sortBy: "company" }).errors, {
    sortBy: "Sort field must be createdAt, updatedAt, or followUpAt",
  });
  assert.deepEqual(validateListApplicationsQuery({ sortOrder: "newest" }).errors, {
    sortOrder: "Sort order must be asc or desc",
  });
  assert.deepEqual(validateListApplicationsQuery({ page: "1" }).errors, {
    query: "Unsupported query parameter(s): page",
  });

  let validationError;
  validateQuery(validateListApplicationsQuery)(
    { query: { status: "interviewing" } },
    {},
    (error) => {
      validationError = error;
    },
  );

  assert.ok(validationError instanceof ValidationError);
  const validationResponse = await runMiddleware(validationError);
  assert.equal(validationResponse.statusCode, 400);
  assert.deepEqual(validationResponse.body, {
    message: "Validation failed",
    errors: {
      status: "Status is invalid",
    },
  });

  const filter = buildApplicationsFilter(userId, normalized.value);

  assert.equal(filter.userId, userId);
  assert.equal(filter.currentStatus, "in_process");
  assert.equal(filter.$or.length, 2);
  assert.equal(filter.$or[0].company.flags, "i");
  assert.equal(filter.$or[1].role.flags, "i");
  assert.equal(filter.$or[0].company.test("Senior FRONTEND (INTERN)"), true);
  assert.equal(filter.$or[1].role.test("frontend (intern)"), true);
  assert.equal(filter.$or[0].company.test("Frontend Intern"), false);

  assert.deepEqual(buildApplicationsFilter(userId, defaults.value), { userId });
  assert.deepEqual(buildApplicationsSort(defaults.value), {
    updatedAt: -1,
    _id: -1,
  });

  for (const sortBy of ["createdAt", "updatedAt", "followUpAt"]) {
    assert.deepEqual(buildApplicationsSort({ sortBy, sortOrder: "asc" }), {
      [sortBy]: 1,
      _id: 1,
    });
    assert.deepEqual(buildApplicationsSort({ sortBy, sortOrder: "desc" }), {
      [sortBy]: -1,
      _id: -1,
    });
  }
}

async function checkApplicationCrudContract() {
  const validParams = validateApplicationIdParams({
    applicationId: `  ${VALID_APPLICATION_ID}  `,
  });

  assert.deepEqual(validParams, {
    value: {
      applicationId: VALID_APPLICATION_ID,
    },
    errors: {},
  });
  assert.deepEqual(validateApplicationIdParams({ applicationId: "not-an-object-id" }).errors, {
    applicationId: "Application ID must be a valid ObjectId",
  });

  const normalizedUpdate = validateUpdateApplicationPayload({
    company: "  ApplyFlow Company  ",
    role: "  Backend Engineer  ",
    jdUrl: null,
    source: null,
    notes: null,
    currentStatus: "in_process",
    followUpAt: null,
  });

  assert.deepEqual(normalizedUpdate, {
    value: {
      company: "ApplyFlow Company",
      role: "Backend Engineer",
      currentStatus: "in_process",
      jdUrl: null,
      source: null,
      notes: null,
      followUpAt: null,
    },
    errors: {},
  });

  for (const currentStatus of [
    "saved",
    "applied",
    "in_process",
    "offer",
    "rejected",
    "withdrawn",
  ]) {
    assert.deepEqual(validateUpdateApplicationPayload({ currentStatus }).errors, {});
  }

  assert.deepEqual(validateUpdateApplicationPayload({ company: "   " }).errors, {
    company: "Company must be a non-empty string",
  });
  assert.deepEqual(validateUpdateApplicationPayload({ role: "   " }).errors, {
    role: "Role must be a non-empty string",
  });
  assert.deepEqual(validateUpdateApplicationPayload({ currentStatus: "interviewing" }).errors, {
    currentStatus: "Current status is invalid",
  });
  assert.deepEqual(validateUpdateApplicationPayload({ followUpAt: "" }).errors, {
    followUpAt: "Follow-up date must be a valid date or null",
  });
  assert.deepEqual(validateUpdateApplicationPayload({ followUpAt: "not-a-date" }).errors, {
    followUpAt: "Follow-up date must be a valid date or null",
  });

  for (const fieldName of ["_id", "userId", "createdAt", "updatedAt", "unsafeField"]) {
    assert.deepEqual(validateUpdateApplicationPayload({ [fieldName]: "unsafe" }).errors, {
      body: `Unsupported field(s): ${fieldName}`,
    });
  }

  let validationError;
  validateBody(validateUpdateApplicationPayload)(
    {
      body: {
        userId: VALID_USER_ID,
      },
    },
    {},
    (error) => {
      validationError = error;
    },
  );

  assert.ok(validationError instanceof ValidationError);
  const validationResponse = await runMiddleware(validationError);
  assert.equal(validationResponse.statusCode, 400);
  assert.deepEqual(validationResponse.body, {
    message: "Validation failed",
    errors: {
      body: "Unsupported field(s): userId",
    },
  });

  const userObjectId = new ObjectId(VALID_USER_ID);
  const applicationObjectId = new ObjectId(VALID_APPLICATION_ID);
  const cascadeFilter = buildApplicationEventsForUserFilter(userObjectId, applicationObjectId);

  assert.deepEqual(cascadeFilter, {
    userId: userObjectId,
    applicationId: applicationObjectId,
  });
}

async function checkEventCrudContract() {
  assert.deepEqual(
    validateApplicationEventParams({ applicationId: ` ${VALID_APPLICATION_ID} ` }),
    {
      value: {
        applicationId: VALID_APPLICATION_ID,
      },
      errors: {},
    },
  );
  assert.deepEqual(
    validateApplicationEventDetailParams({
      applicationId: VALID_APPLICATION_ID,
      eventId: VALID_EVENT_ID,
    }).errors,
    {},
  );
  assert.deepEqual(
    validateApplicationEventDetailParams({
      applicationId: "not-an-object-id",
      eventId: "also-not-an-object-id",
    }).errors,
    {
      applicationId: "Application ID must be a valid ObjectId",
      eventId: "Event ID must be a valid ObjectId",
    },
  );

  const validCreate = validateCreateEventPayload({
    type: "interview",
    title: "  Technical Interview  ",
    occurredAt: "2026-07-15T08:00:00.000Z",
    scheduledAt: null,
    mode: "online",
    location: "  Remote  ",
    meetingLink: "  https://meet.example.test/interview  ",
    contactName: "  Recruiter  ",
    contactPhone: "  +84 123 456 789  ",
    contactEmail: "  RECRUITER@EXAMPLE.TEST  ",
    note: "  Prepare examples  ",
  });

  assert.deepEqual(validCreate.errors, {});
  assert.equal(validCreate.value.title, "Technical Interview");
  assert.equal(validCreate.value.occurredAt.toISOString(), "2026-07-15T08:00:00.000Z");
  assert.equal(validCreate.value.scheduledAt, null);
  assert.equal(validCreate.value.location, "Remote");
  assert.equal(validCreate.value.meetingLink, "https://meet.example.test/interview");
  assert.equal(validCreate.value.contactName, "Recruiter");
  assert.equal(validCreate.value.contactPhone, "+84 123 456 789");
  assert.equal(validCreate.value.contactEmail, "recruiter@example.test");
  assert.equal(validCreate.value.note, "Prepare examples");

  for (const type of [
    "applied",
    "hr_call",
    "oa",
    "interview",
    "follow_up",
    "offer",
    "rejected",
    "note",
  ]) {
    assert.deepEqual(validateCreateEventPayload({ type, title: "Event" }).errors, {});
  }

  for (const mode of ["online", "offline", "phone"]) {
    assert.deepEqual(
      validateCreateEventPayload({ type: "note", title: "Event", mode }).errors,
      {},
    );
  }

  const invalidCreateCases = [
    [{ type: "unknown", title: "Event" }, "type"],
    [{ type: "note", title: "   " }, "title"],
    [{ type: "note", title: "Event", occurredAt: "" }, "occurredAt"],
    [{ type: "note", title: "Event", scheduledAt: "not-a-date" }, "scheduledAt"],
    [{ type: "note", title: "Event", mode: "video" }, "mode"],
    [{ type: "note", title: "Event", contactEmail: "invalid" }, "contactEmail"],
    [{ type: "note", title: "Event", meetingLink: "not-a-url" }, "meetingLink"],
  ];

  for (const [payload, fieldName] of invalidCreateCases) {
    assert.equal(typeof validateCreateEventPayload(payload).errors[fieldName], "string");
  }

  const nullableUpdate = validateUpdateEventPayload({
    occurredAt: null,
    scheduledAt: null,
    mode: null,
    location: null,
    meetingLink: null,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    note: null,
  });

  assert.deepEqual(nullableUpdate, {
    value: {
      occurredAt: null,
      scheduledAt: null,
      mode: null,
      location: null,
      contactName: null,
      contactPhone: null,
      note: null,
      meetingLink: null,
      contactEmail: null,
    },
    errors: {},
  });

  for (const fieldName of [
    "_id",
    "applicationId",
    "userId",
    "createdAt",
    "updatedAt",
    "unsafeField",
  ]) {
    assert.deepEqual(validateUpdateEventPayload({ [fieldName]: "unsafe" }).errors, {
      body: `Unsupported field(s): ${fieldName}`,
    });
  }

  const invalidUpdateCases = [
    [{ type: "unknown" }, "type"],
    [{ title: "   " }, "title"],
    [{ occurredAt: "" }, "occurredAt"],
    [{ scheduledAt: "not-a-date" }, "scheduledAt"],
    [{ mode: "video" }, "mode"],
    [{ contactEmail: "invalid" }, "contactEmail"],
    [{ meetingLink: "not-a-url" }, "meetingLink"],
  ];

  for (const [payload, fieldName] of invalidUpdateCases) {
    assert.equal(typeof validateUpdateEventPayload(payload).errors[fieldName], "string");
  }

  let validationError;
  validateBody(validateUpdateEventPayload)(
    {
      body: {
        applicationId: VALID_APPLICATION_ID,
      },
    },
    {},
    (error) => {
      validationError = error;
    },
  );

  assert.ok(validationError instanceof ValidationError);
  const validationResponse = await runMiddleware(validationError);
  assert.deepEqual(validationResponse.body, {
    message: "Validation failed",
    errors: {
      body: "Unsupported field(s): applicationId",
    },
  });

  const userObjectId = new ObjectId(VALID_USER_ID);
  const applicationObjectId = new ObjectId(VALID_APPLICATION_ID);
  const eventObjectId = new ObjectId(VALID_EVENT_ID);

  assert.deepEqual(buildApplicationEventsForUserFilter(userObjectId, applicationObjectId), {
    userId: userObjectId,
    applicationId: applicationObjectId,
  });
  assert.deepEqual(buildEventForUserFilter(userObjectId, applicationObjectId, eventObjectId), {
    _id: eventObjectId,
    userId: userObjectId,
    applicationId: applicationObjectId,
  });

  const timelineEvents = [
    {
      _id: "event-occurred",
      occurredAt: "2026-07-15T12:00:00.000Z",
      scheduledAt: "2026-07-15T08:00:00.000Z",
      createdAt: "2026-07-15T07:00:00.000Z",
    },
    {
      _id: "event-scheduled",
      scheduledAt: "2026-07-15T10:00:00.000Z",
      createdAt: "2026-07-15T06:00:00.000Z",
    },
    {
      _id: "event-created",
      createdAt: "2026-07-15T09:00:00.000Z",
    },
    {
      _id: "event-tie-later-created",
      occurredAt: "2026-07-15T13:00:00.000Z",
      createdAt: "2026-07-15T07:00:00.000Z",
    },
    {
      _id: "event-tie-earlier-created",
      occurredAt: "2026-07-15T13:00:00.000Z",
      createdAt: "2026-07-15T06:00:00.000Z",
    },
    {
      _id: "event-tie-id-b",
      occurredAt: "2026-07-15T14:00:00.000Z",
      createdAt: "2026-07-15T06:00:00.000Z",
    },
    {
      _id: "event-tie-id-a",
      occurredAt: "2026-07-15T14:00:00.000Z",
      createdAt: "2026-07-15T06:00:00.000Z",
    },
  ];
  const originalOrder = timelineEvents.map((event) => event._id);
  const sortedEvents = sortTimelineEvents(timelineEvents);

  assert.equal(
    getEventEffectiveDate(timelineEvents[0]).toISOString(),
    "2026-07-15T12:00:00.000Z",
  );
  assert.deepEqual(
    sortedEvents.map((event) => event._id),
    [
      "event-created",
      "event-scheduled",
      "event-occurred",
      "event-tie-earlier-created",
      "event-tie-later-created",
      "event-tie-id-a",
      "event-tie-id-b",
    ],
  );
  assert.deepEqual(
    timelineEvents.map((event) => event._id),
    originalOrder,
  );
}

function checkDashboardContract() {
  const now = new Date("2026-07-19T12:00:00.000Z");
  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const applicationIds = {
    saved: "000000000000000000000001",
    applied: "000000000000000000000002",
    inProcess: "000000000000000000000003",
    offer: "000000000000000000000004",
    rejected: "000000000000000000000005",
    withdrawn: "000000000000000000000006",
    secondSaved: "000000000000000000000007",
  };
  const application = ({
    _id,
    currentStatus,
    company,
    role,
    createdAt,
    updatedAt,
    followUpAt = null,
  }) => ({
    _id,
    userId: VALID_USER_ID,
    currentStatus,
    company,
    role,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    followUpAt: followUpAt ? new Date(followUpAt) : null,
  });
  const event = ({
    _id,
    applicationId,
    type = "note",
    title = "Dashboard event",
    occurredAt = null,
    scheduledAt = null,
    createdAt = "2026-07-19T08:00:00.000Z",
  }) => ({
    _id,
    applicationId,
    userId: VALID_USER_ID,
    type,
    title,
    occurredAt: occurredAt ? new Date(occurredAt) : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    createdAt: new Date(createdAt),
  });
  const applications = [
    application({
      _id: applicationIds.saved,
      currentStatus: "saved",
      company: "Saved Company",
      role: "Saved Role",
      createdAt: "2026-07-10T08:00:00.000Z",
      updatedAt: "2026-07-18T08:00:00.000Z",
      followUpAt: "2026-07-01T08:00:00.000Z",
    }),
    application({
      _id: applicationIds.applied,
      currentStatus: "applied",
      company: "Applied Company",
      role: "Applied Role",
      createdAt: "2026-07-11T09:00:00.000Z",
      updatedAt: "2026-07-18T08:00:00.000Z",
    }),
    application({
      _id: applicationIds.inProcess,
      currentStatus: "in_process",
      company: "In Process Company",
      role: "In Process Role",
      createdAt: "2026-07-11T09:00:00.000Z",
      updatedAt: "2026-07-18T08:00:00.000Z",
      followUpAt: "2026-07-10T08:00:00.000Z",
    }),
    application({
      _id: applicationIds.offer,
      currentStatus: "offer",
      company: "Offer Company",
      role: "Offer Role",
      createdAt: "2026-07-09T08:00:00.000Z",
      updatedAt: "2026-07-17T08:00:00.000Z",
    }),
    application({
      _id: applicationIds.rejected,
      currentStatus: "rejected",
      company: "Rejected Company",
      role: "Rejected Role",
      createdAt: "2026-07-08T08:00:00.000Z",
      updatedAt: "2026-07-16T08:00:00.000Z",
    }),
    application({
      _id: applicationIds.withdrawn,
      currentStatus: "withdrawn",
      company: "Withdrawn Company",
      role: "Withdrawn Role",
      createdAt: "2026-07-07T08:00:00.000Z",
      updatedAt: "2026-07-15T08:00:00.000Z",
    }),
    application({
      _id: applicationIds.secondSaved,
      currentStatus: "saved",
      company: "Second Saved Company",
      role: "Second Saved Role",
      createdAt: "2026-07-06T08:00:00.000Z",
      updatedAt: "2026-07-14T08:00:00.000Z",
    }),
  ];
  const events = [
    event({
      _id: "100000000000000000000001",
      applicationId: applicationIds.saved,
      title: "Included at now",
      scheduledAt: now.toISOString(),
    }),
    event({
      _id: "100000000000000000000002",
      applicationId: applicationIds.applied,
      title: "Included inside window",
      scheduledAt: new Date(now.getTime() + 3 * dayInMilliseconds - 1).toISOString(),
    }),
    event({
      _id: "100000000000000000000003",
      applicationId: applicationIds.inProcess,
      title: "Excluded at upper boundary",
      scheduledAt: new Date(now.getTime() + 3 * dayInMilliseconds).toISOString(),
    }),
    event({
      _id: "100000000000000000000004",
      applicationId: applicationIds.inProcess,
      title: "Excluded in past",
      scheduledAt: new Date(now.getTime() - 1).toISOString(),
    }),
    event({
      _id: "100000000000000000000005",
      applicationId: applicationIds.inProcess,
      title: "Excluded without schedule",
    }),
    event({
      _id: "100000000000000000000006",
      applicationId: applicationIds.inProcess,
      title: "First created tie",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
      createdAt: "2026-07-18T06:00:00.000Z",
    }),
    event({
      _id: "100000000000000000000007",
      applicationId: applicationIds.inProcess,
      title: "First id tie",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
      createdAt: "2026-07-18T07:00:00.000Z",
    }),
    event({
      _id: "100000000000000000000008",
      applicationId: applicationIds.inProcess,
      title: "Second id tie",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
      createdAt: "2026-07-18T07:00:00.000Z",
    }),
    event({
      _id: "100000000000000000000009",
      applicationId: applicationIds.offer,
      title: "Excluded offer event",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
    }),
    event({
      _id: "100000000000000000000010",
      applicationId: applicationIds.rejected,
      title: "Excluded rejected event",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
    }),
    event({
      _id: "100000000000000000000011",
      applicationId: applicationIds.withdrawn,
      title: "Excluded withdrawn event",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
    }),
    event({
      _id: "100000000000000000000012",
      applicationId: "ffffffffffffffffffffffff",
      title: "Excluded missing parent",
      scheduledAt: new Date(now.getTime() + dayInMilliseconds).toISOString(),
    }),
    event({
      _id: "200000000000000000000001",
      applicationId: applicationIds.applied,
      type: "applied",
      title: "Applied",
      occurredAt: "2026-07-01T08:00:00.000Z",
      createdAt: "2026-07-01T08:00:00.000Z",
    }),
    event({
      _id: "200000000000000000000002",
      applicationId: applicationIds.inProcess,
      type: "interview",
      title: "Interview",
      occurredAt: "2026-07-10T08:00:00.000Z",
      createdAt: "2026-07-10T08:00:00.000Z",
    }),
  ];
  const applicationsSnapshot = JSON.stringify(applications);
  const eventsSnapshot = JSON.stringify(events);
  const dashboard = buildDashboardSummary(applications, events, now);

  assert.deepEqual(Object.keys(dashboard), [
    "countsByStatus",
    "totalApplications",
    "recentApplications",
    "upcomingEvents",
    "attentionFlags",
  ]);
  assert.equal(Object.hasOwn(dashboard, "statusCounts"), false);
  assert.deepEqual(Object.keys(dashboard.countsByStatus), APPLICATION_STATUSES);
  assert.deepEqual(dashboard.countsByStatus, {
    saved: 2,
    applied: 1,
    in_process: 1,
    offer: 1,
    rejected: 1,
    withdrawn: 1,
  });
  assert.equal(
    dashboard.totalApplications,
    Object.values(dashboard.countsByStatus).reduce((total, count) => total + count, 0),
  );

  assert.equal(RECENT_APPLICATION_LIMIT, 5);
  assert.equal(dashboard.recentApplications.length, RECENT_APPLICATION_LIMIT);
  assert.deepEqual(
    dashboard.recentApplications.map((item) => item.applicationId),
    [
      applicationIds.applied,
      applicationIds.inProcess,
      applicationIds.saved,
      applicationIds.offer,
      applicationIds.rejected,
    ],
  );
  assert.deepEqual(Object.keys(dashboard.recentApplications[0]), [
    "applicationId",
    "company",
    "role",
    "currentStatus",
    "updatedAt",
    "followUpAt",
  ]);

  assert.deepEqual(
    dashboard.upcomingEvents.map((item) => item.eventId),
    [
      "100000000000000000000001",
      "100000000000000000000006",
      "100000000000000000000007",
      "100000000000000000000008",
      "100000000000000000000002",
    ],
  );
  assert.equal(dashboard.upcomingEvents[0].scheduledAt, now.toISOString());
  assert.equal(
    dashboard.upcomingEvents.some((item) => item.eventId === "100000000000000000000003"),
    false,
  );
  assert.equal(dashboard.upcomingEvents[0].company, "Saved Company");
  assert.equal(dashboard.upcomingEvents[0].role, "Saved Role");

  const directAttentionFlags = computeAttentionFlags(applications, events, now);
  const getFlagKey = (flag) =>
    `${flag.referenceDate}|${flag.applicationId}|${flag.flagType}`;
  assert.deepEqual(
    dashboard.attentionFlags.map(getFlagKey),
    [
      `2026-07-01T08:00:00.000Z|${applicationIds.saved}|FOLLOW_UP_OVERDUE`,
      `2026-07-01T08:00:00.000Z|${applicationIds.applied}|NO_RESPONSE_AFTER_APPLY`,
      `2026-07-10T08:00:00.000Z|${applicationIds.inProcess}|FOLLOW_UP_OVERDUE`,
      `2026-07-10T08:00:00.000Z|${applicationIds.inProcess}|NO_RESPONSE_AFTER_INTERVIEW`,
    ],
  );
  assert.deepEqual(
    [...dashboard.attentionFlags.map(getFlagKey)].sort(),
    [...directAttentionFlags.map(getFlagKey)].sort(),
  );
  assert.ok(
    dashboard.attentionFlags.every(
      (flag) =>
        flag.flagType !== "UPCOMING_EVENT" &&
        typeof flag.applicationId === "string" &&
        typeof flag.company === "string" &&
        typeof flag.role === "string" &&
        typeof flag.message === "string" &&
        typeof flag.referenceDate === "string",
    ),
  );

  assert.deepEqual(
    buildDashboardSummary([...applications].reverse(), [...events].reverse(), now),
    dashboard,
  );
  assert.equal(JSON.stringify(applications), applicationsSnapshot);
  assert.equal(JSON.stringify(events), eventsSnapshot);

  const emptyDashboard = buildDashboardSummary([], [], now);
  assert.deepEqual(emptyDashboard, {
    countsByStatus: {
      saved: 0,
      applied: 0,
      in_process: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    },
    totalApplications: 0,
    recentApplications: [],
    upcomingEvents: [],
    attentionFlags: [],
  });
}

async function checkErrorMiddleware() {
  const { notFoundHandler } = await import("../src/middlewares/error.middleware.js");
  const domainResponse = await runMiddleware(
    new BadRequestError("Application ID must be a valid ObjectId"),
  );

  assert.equal(domainResponse.statusCode, 400);
  assert.equal(domainResponse.body.message, "Application ID must be a valid ObjectId");
  assert.equal(domainResponse.body.errors, undefined);
  assert.equal(domainResponse.body.stack, undefined);

  const validationResponse = await runMiddleware(
    new ValidationError({
      company: "Company is required",
    }),
  );

  assert.equal(validationResponse.statusCode, 400);
  assert.equal(validationResponse.body.message, "Validation failed");
  assert.deepEqual(validationResponse.body.errors, {
    company: "Company is required",
  });
  assert.equal(validationResponse.body.stack, undefined);

  const statusFallbackError = new Error("Unauthorized request");
  statusFallbackError.status = 401;
  const statusFallbackResponse = await runMiddleware(statusFallbackError);

  assert.equal(statusFallbackResponse.statusCode, 401);
  assert.equal(statusFallbackResponse.body.message, "Unauthorized request");
  assert.equal(statusFallbackResponse.body.stack, undefined);

  const unauthorizedResponse = await runMiddleware(
    new UnauthorizedError("Authorization token is required"),
  );

  assert.equal(unauthorizedResponse.statusCode, 401);
  assert.deepEqual(unauthorizedResponse.body, {
    message: "Authorization token is required",
  });

  const notFoundDomainResponse = await runMiddleware(new NotFoundError("Application not found"));

  assert.equal(notFoundDomainResponse.statusCode, 404);
  assert.deepEqual(notFoundDomainResponse.body, {
    message: "Application not found",
  });

  const originalConsoleError = console.error;
  console.error = () => {};
  let unexpectedResponse;

  try {
    unexpectedResponse = await runMiddleware(new Error("Unexpected development failure"));
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(unexpectedResponse.statusCode, 500);
  assert.equal(unexpectedResponse.body.message, "Unexpected development failure");
  assert.equal(unexpectedResponse.body.errors, undefined);
  assert.equal(typeof unexpectedResponse.body.stack, "string");

  const notFoundResponse = createMockResponse();
  notFoundHandler(
    {
      method: "GET",
      originalUrl: "/missing-route",
    },
    notFoundResponse,
  );

  assert.equal(notFoundResponse.statusCode, 404);
  assert.deepEqual(notFoundResponse.body, {
    message: "Route not found: GET /missing-route",
  });
}

async function checkAuthMiddleware() {
  const missingToken = await runAuthMiddleware();

  assert.ok(missingToken.error instanceof UnauthorizedError);
  assert.equal(missingToken.error.statusCode, 401);
  assert.equal(missingToken.error.message, "Authorization token is required");
  assert.equal(missingToken.request.user, undefined);

  const malformedHeader = await runAuthMiddleware({
    authorization: "Basic abc123",
  });

  assert.ok(malformedHeader.error instanceof UnauthorizedError);
  assert.equal(malformedHeader.error.statusCode, 401);
  assert.equal(malformedHeader.error.message, "Authorization token is required");
  assert.equal(malformedHeader.request.user, undefined);

  const invalidToken = await runAuthMiddleware({
    authorization: "Bearer not-a-real-jwt",
  });

  assert.ok(invalidToken.error instanceof UnauthorizedError);
  assert.equal(invalidToken.error.statusCode, 401);
  assert.equal(invalidToken.error.message, "Invalid authorization token");
  assert.equal(invalidToken.request.user, undefined);

  for (const tokenVersion of [-1, "0"]) {
    const token = jwt.sign(
      {
        sub: VALID_USER_ID,
        tokenVersion,
      },
      process.env.JWT_SECRET,
    );
    const invalidVersion = await runAuthMiddleware({
      authorization: `Bearer ${token}`,
    });

    assert.ok(invalidVersion.error instanceof UnauthorizedError);
    assert.equal(invalidVersion.error.statusCode, 401);
    assert.equal(invalidVersion.error.message, "Invalid authorization token");
    assert.equal(invalidVersion.request.user, undefined);
  }
}

function checkForgotPasswordValidation() {
  const valid = validateForgotPasswordPayload({
    email: "  STUDENT@example.test  ",
  });

  assert.deepEqual(valid, {
    value: { email: "student@example.test" },
    errors: {},
  });
  assert.deepEqual(validateForgotPasswordPayload({}).errors, {
    email: "Email is required",
  });
  assert.deepEqual(validateForgotPasswordPayload({ email: "invalid" }).errors, {
    email: "Email must be a valid email address",
  });
  assert.deepEqual(
    validateForgotPasswordPayload({
      email: "student@example.test",
      role: "admin",
    }).errors,
    {
      body: "Unsupported field(s): role",
    },
  );
}

function checkPasswordResetTokenAndProxyPolicy() {
  const rawToken = createRawPasswordResetToken();

  assert.match(rawToken, /^[a-f0-9]{64}$/);
  assert.match(hashPasswordResetToken(rawToken), /^[a-f0-9]{64}$/);
  assert.notEqual(hashPasswordResetToken(rawToken), rawToken);
  assert.equal(createApp().get("trust proxy"), false);
}

async function checkForgotPasswordRateLimit() {
  let timestamp = 1_000;
  const createMiddleware = (overrides = {}) =>
    createForgotPasswordRateLimitMiddleware({
      emailLimit: 2,
      emailWindowMs: 1_000,
      ipLimit: 3,
      ipWindowMs: 2_000,
      now: () => timestamp,
      ...overrides,
    });
  const emailMiddleware = createMiddleware({ ipLimit: 100 });
  const request = {
    ip: "127.0.0.1",
    validatedBody: { email: "student@example.test" },
  };

  assert.equal(await runRequestMiddleware(emailMiddleware, request), undefined);
  assert.equal(await runRequestMiddleware(emailMiddleware, request), undefined);

  const emailLimitError = await runRequestMiddleware(emailMiddleware, request);
  assert.ok(emailLimitError instanceof TooManyRequestsError);
  assert.equal(emailLimitError.statusCode, 429);
  assert.equal(emailLimitError.code, "RESET_RATE_LIMITED");

  const rateLimitResponse = await runMiddleware(emailLimitError);
  assert.deepEqual(rateLimitResponse.body, {
    message: "Too many password reset requests. Please try again later.",
    code: "RESET_RATE_LIMITED",
  });

  timestamp += 1_001;
  assert.equal(await runRequestMiddleware(emailMiddleware, request), undefined);

  const ipMiddleware = createMiddleware({ emailLimit: 100, ipLimit: 2 });
  for (const email of ["one@example.test", "two@example.test"]) {
    assert.equal(
      await runRequestMiddleware(ipMiddleware, {
        ip: "127.0.0.2",
        validatedBody: { email },
      }),
      undefined,
    );
  }

  const ipLimitError = await runRequestMiddleware(ipMiddleware, {
    ip: "127.0.0.2",
    validatedBody: { email: "three@example.test" },
  });
  assert.ok(ipLimitError instanceof TooManyRequestsError);
  assert.equal(ipLimitError.code, "RESET_RATE_LIMITED");
}

async function checkPasswordResetEmailAdapters() {
  const consoleDeliveries = [];
  const consoleSender = createPasswordResetEmailSender({
    provider: "console",
    consoleWriter: (delivery) => consoleDeliveries.push(delivery),
  });
  const resetUrl = "http://localhost:5173/reset-password?token=test-only-token";

  await consoleSender({
    to: "student@example.test",
    resetUrl,
  });
  assert.equal(consoleDeliveries.length, 1);
  assert.equal(consoleDeliveries[0].to, "student@example.test");
  assert.ok(consoleDeliveries[0].text.includes(resetUrl));

  const resendRequests = [];
  const resendSender = createPasswordResetEmailSender({
    provider: "resend",
    resendApiKey: "safe-test-key",
    resendFromEmail: "no-reply@example.test",
    resendClient: {
      emails: {
        async send(payload) {
          resendRequests.push(payload);
          return { data: { id: "test-email-id" }, error: null };
        },
      },
    },
  });

  await resendSender({
    to: "student@example.test",
    resetUrl,
  });
  assert.deepEqual(resendRequests[0], {
    from: "no-reply@example.test",
    to: "student@example.test",
    subject: "Reset your ApplyFlow password",
    text: consoleDeliveries[0].text,
  });

  const failingSender = createPasswordResetEmailSender({
    provider: "resend",
    resendApiKey: "safe-test-key",
    resendFromEmail: "no-reply@example.test",
    resendClient: {
      emails: {
        async send() {
          return { data: null, error: { message: "provider-private-detail" } };
        },
      },
    },
  });

  await assert.rejects(
    () =>
      failingSender({
        to: "student@example.test",
        resetUrl,
      }),
    (error) =>
      error.message === "Password reset email delivery failed" &&
      !error.message.includes("provider-private-detail"),
  );
}

async function checkPasswordResetService() {
  const userId = new ObjectId();
  const rawTokens = ["a".repeat(64), "b".repeat(64)];
  const storedTokens = [];
  const deliveries = [];
  const requestReset = createPasswordResetRequester({
    findUser: async (email) => ({ _id: userId, email }),
    replaceToken: async (currentUserId, token) => {
      const storedToken = {
        _id: new ObjectId(),
        userId: currentUserId,
        ...token,
      };
      storedTokens.push(storedToken);
      return storedToken;
    },
    deleteToken: async () => true,
    sendEmail: async (delivery) => deliveries.push(delivery),
    createRawToken: () => rawTokens.shift(),
    now: () => new Date("2026-07-19T00:00:00.000Z"),
    frontendOrigin: "http://localhost:5173",
    tokenTtlMinutes: 30,
  });

  await requestReset("student@example.test");
  await requestReset("student@example.test");

  assert.equal(storedTokens.length, 2);
  assert.equal(storedTokens[0].userId, userId);
  assert.match(storedTokens[0].tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(storedTokens[0].tokenHash, "a".repeat(64));
  assert.notEqual(storedTokens[0].tokenHash, storedTokens[1].tokenHash);
  assert.equal(storedTokens[0].createdAt.toISOString(), "2026-07-19T00:00:00.000Z");
  assert.equal(storedTokens[0].expiresAt.toISOString(), "2026-07-19T00:30:00.000Z");
  assert.equal(new URL(deliveries[0].resetUrl).searchParams.get("token"), "a".repeat(64));

  let unknownAccountMutated = false;
  const requestUnknownReset = createPasswordResetRequester({
    findUser: async () => null,
    replaceToken: async () => {
      unknownAccountMutated = true;
    },
    sendEmail: async () => {
      unknownAccountMutated = true;
    },
  });
  await requestUnknownReset("missing@example.test");
  assert.equal(unknownAccountMutated, false);

  const createdTokenId = new ObjectId();
  const deletedTokenIds = [];
  const operationalEvents = [];
  const requestWithDeliveryFailure = createPasswordResetRequester({
    findUser: async () => ({ _id: userId, email: "student@example.test" }),
    replaceToken: async (_currentUserId, token) => ({ _id: createdTokenId, ...token }),
    deleteToken: async (tokenId) => deletedTokenIds.push(tokenId),
    sendEmail: async () => {
      throw new Error("provider-private-detail");
    },
    createRawToken: () => "c".repeat(64),
    frontendOrigin: "http://localhost:5173",
    operationalLogger: {
      error(event) {
        operationalEvents.push(event);
      },
    },
  });

  await requestWithDeliveryFailure("student@example.test");
  assert.deepEqual(deletedTokenIds, [createdTokenId]);
  assert.deepEqual(operationalEvents, ["password_reset_delivery_failed"]);
  assert.ok(!JSON.stringify(operationalEvents).includes("student@example.test"));
  assert.ok(!JSON.stringify(operationalEvents).includes("c".repeat(64)));
  assert.ok(!JSON.stringify(operationalEvents).includes("provider-private-detail"));
}

function checkPasswordResetEnvironmentValidation() {
  const script = 'await import("./src/config/env.js");';
  const baseEnvironment = {
    ...process.env,
    NODE_ENV: "development",
    PORT: "4000",
    MONGODB_URI: "mongodb://127.0.0.1:27017",
    MONGODB_DB_NAME: "applyflow_test",
    JWT_SECRET: "safe-test-secret",
    FRONTEND_ORIGIN: "http://localhost:5173",
    EMAIL_PROVIDER: "console",
    RESEND_API_KEY: "",
    RESEND_FROM_EMAIL: "",
  };
  const runProbe = (overrides) =>
    execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: process.cwd(),
      env: { ...baseEnvironment, ...overrides },
      stdio: "pipe",
    });

  assert.doesNotThrow(() => runProbe({}));
  assert.doesNotThrow(() =>
    runProbe({
      NODE_ENV: "production",
      FRONTEND_ORIGIN: "https://applyflow.example.test",
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "safe-test-key",
      RESEND_FROM_EMAIL: "no-reply@example.test",
    }),
  );
  assert.throws(() =>
    runProbe({
      NODE_ENV: "production",
      FRONTEND_ORIGIN: "https://applyflow.example.test",
      EMAIL_PROVIDER: "console",
    }),
  );
  assert.throws(() =>
    runProbe({
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "",
      RESEND_FROM_EMAIL: "no-reply@example.test",
    }),
  );
  assert.throws(() => runProbe({ FRONTEND_ORIGIN: "http://localhost:5173/reset" }));
  assert.throws(() => runProbe({ PASSWORD_RESET_TOKEN_TTL_MINUTES: "0" }));
}

function checkProductionErrorMiddleware() {
  const script = `
    process.env.NODE_ENV = "production";
    process.env.PORT = "4000";
    process.env.MONGODB_URI = "mongodb://localhost:27017";
    process.env.MONGODB_DB_NAME = "ApplyFlow";
    process.env.JWT_SECRET = "test-secret";
    process.env.FRONTEND_ORIGIN = "https://applyflow.example.test";
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "safe-test-key";
    process.env.RESEND_FROM_EMAIL = "no-reply@example.test";
    console.error = () => {};
    const { errorMiddleware } = await import("./src/middlewares/error.middleware.js");
    const response = {
      body: null,
      statusCode: null,
      json(payload) {
        this.body = payload;
        return this;
      },
      status(statusCode) {
        this.statusCode = statusCode;
        return this;
      },
    };
    const error = new Error("Sensitive database detail");
    error.errors = {
      query: "Sensitive query detail",
    };
    errorMiddleware(error, {}, response, () => {});
    process.stdout.write(JSON.stringify(response));
  `;
  const output = execFileSync(process.execPath, ["--input-type=module", "--eval", script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "4000",
      MONGODB_URI: "mongodb://localhost:27017",
      MONGODB_DB_NAME: "ApplyFlow",
      JWT_SECRET: "test-secret",
    },
    encoding: "utf8",
  });
  const response = JSON.parse(output);

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    message: "Internal server error",
  });
}

async function checkServiceMalformedIdFallbacks() {
  const { deleteApplication, getApplication, updateApplication } = await import(
    "../src/modules/application/application.service.js"
  );
  const {
    createApplicationEvent,
    deleteApplicationEvent,
    listApplicationEvents,
    updateApplicationEvent,
  } = await import("../src/modules/event/event.service.js");

  await assertRejectsWithBadRequest(
    () => getApplication(VALID_USER_ID, "not-an-object-id"),
    "Application ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () => updateApplication(VALID_USER_ID, "not-an-object-id", { company: "ApplyFlow" }),
    "Application ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () => deleteApplication(VALID_USER_ID, "not-an-object-id"),
    "Application ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () => listApplicationEvents(VALID_USER_ID, "not-an-object-id"),
    "Application ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () =>
      createApplicationEvent(VALID_USER_ID, "not-an-object-id", {
        type: "note",
        title: "Invalid parent",
      }),
    "Application ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () => updateApplicationEvent(VALID_USER_ID, VALID_APPLICATION_ID, "not-an-object-id", {
      title: "Updated title",
    }),
    "Event ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () => deleteApplicationEvent(VALID_USER_ID, VALID_APPLICATION_ID, "not-an-object-id"),
    "Event ID must be a valid ObjectId",
  );
}

async function checkAuthRepositoryMalformedIdFallback() {
  const { findUserById } = await import("../src/modules/auth/auth.repository.js");
  const result = await findUserById("not-an-object-id");

  assert.equal(result, null);
}

checkObjectIdUtility();
await checkApplicationListContract();
await checkApplicationCrudContract();
await checkEventCrudContract();
checkDashboardContract();
await checkErrorMiddleware();
await checkAuthMiddleware();
checkForgotPasswordValidation();
checkPasswordResetTokenAndProxyPolicy();
await checkForgotPasswordRateLimit();
await checkPasswordResetEmailAdapters();
await checkPasswordResetService();
checkPasswordResetEnvironmentValidation();
checkProductionErrorMiddleware();
await checkServiceMalformedIdFallbacks();
await checkAuthRepositoryMalformedIdFallback();

console.log("Backend hardening checks passed.");
