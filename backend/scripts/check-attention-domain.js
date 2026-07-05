import assert from "node:assert/strict";
import { ATTENTION_FLAG_TYPES } from "../src/domain/attention/attention.types.js";
import {
  computeAttentionFlags,
  computeUpcomingEvents,
} from "../src/domain/attention/attention.service.js";

const now = new Date("2026-07-05T00:00:00.000Z");

function daysAgo(days) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function daysFromNow(days) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function application(overrides = {}) {
  return {
    _id: overrides._id ?? "app_1",
    company: overrides.company ?? "Company",
    role: overrides.role ?? "Engineer",
    currentStatus: overrides.currentStatus ?? "applied",
    followUpAt: overrides.followUpAt ?? null,
  };
}

function event(overrides = {}) {
  return {
    _id: overrides._id ?? "event_1",
    applicationId: overrides.applicationId ?? "app_1",
    type: overrides.type ?? "applied",
    title: overrides.title ?? "Event",
    occurredAt: overrides.occurredAt,
    scheduledAt: overrides.scheduledAt,
    createdAt: overrides.createdAt,
  };
}

function typesFor(applications, events) {
  return computeAttentionFlags(applications, events, now).map((flag) => flag.flagType);
}

function assertHasType(actualTypes, expectedType) {
  assert.ok(actualTypes.includes(expectedType), `Expected ${expectedType}`);
}

function assertMissingType(actualTypes, expectedType) {
  assert.ok(!actualTypes.includes(expectedType), `Did not expect ${expectedType}`);
}

const applyFlagType = ATTENTION_FLAG_TYPES.NO_RESPONSE_AFTER_APPLY;
const interviewFlagType = ATTENTION_FLAG_TYPES.NO_RESPONSE_AFTER_INTERVIEW;
const followUpFlagType = ATTENTION_FLAG_TYPES.FOLLOW_UP_OVERDUE;

assertHasType(
  typesFor([application()], [event({ occurredAt: daysAgo(16) })]),
  applyFlagType,
);

assertMissingType(
  typesFor([application()], [event({ occurredAt: daysAgo(10) })]),
  applyFlagType,
);

assertMissingType(
  typesFor(
    [application()],
    [
      event({ occurredAt: daysAgo(16) }),
      event({ _id: "event_2", type: "hr_call", occurredAt: daysAgo(5) }),
    ],
  ),
  applyFlagType,
);

for (const currentStatus of ["rejected", "withdrawn"]) {
  assertMissingType(
    typesFor([application({ currentStatus })], [event({ occurredAt: daysAgo(16) })]),
    applyFlagType,
  );
}

assertMissingType(
  typesFor(
    [application()],
    [
      event({ _id: "event_old", occurredAt: daysAgo(20) }),
      event({ _id: "event_recent", occurredAt: daysAgo(10) }),
    ],
  ),
  applyFlagType,
);

assertHasType(
  typesFor(
    [application({ currentStatus: "in_process" })],
    [event({ type: "interview", occurredAt: daysAgo(8) })],
  ),
  interviewFlagType,
);

assertMissingType(
  typesFor([application()], [event({ type: "interview", occurredAt: daysAgo(5) })]),
  interviewFlagType,
);

for (const laterType of ["offer", "rejected", "follow_up"]) {
  assertMissingType(
    typesFor(
      [application({ currentStatus: "in_process" })],
      [
        event({ _id: "interview", type: "interview", occurredAt: daysAgo(8) }),
        event({ _id: laterType, type: laterType, occurredAt: daysAgo(2) }),
      ],
    ),
    interviewFlagType,
  );
}

for (const currentStatus of ["offer", "rejected", "withdrawn"]) {
  assertMissingType(
    typesFor(
      [application({ currentStatus })],
      [event({ type: "interview", occurredAt: daysAgo(8) })],
    ),
    interviewFlagType,
  );
}

for (const currentStatus of ["saved", "applied"]) {
  assertHasType(
    typesFor([application({ currentStatus, followUpAt: daysAgo(1) })], []),
    followUpFlagType,
  );
}

assertMissingType(
  typesFor([application({ followUpAt: daysFromNow(1) })], []),
  followUpFlagType,
);

for (const currentStatus of ["rejected", "withdrawn"]) {
  assertMissingType(
    typesFor([application({ currentStatus, followUpAt: daysAgo(1) })], []),
    followUpFlagType,
  );
}

assertMissingType(
  typesFor(
    [application()],
    [event({ createdAt: daysAgo(30), occurredAt: undefined, scheduledAt: undefined })],
  ),
  applyFlagType,
);

assertMissingType(
  typesFor(
    [application({ currentStatus: "in_process" })],
    [
      event({
        type: "interview",
        createdAt: daysAgo(30),
        occurredAt: undefined,
        scheduledAt: undefined,
      }),
    ],
  ),
  interviewFlagType,
);

const multipleApplications = [
  application({ _id: "app_apply", company: "A", role: "Backend" }),
  application({ _id: "app_follow", company: "B", role: "Frontend", followUpAt: daysAgo(1) }),
];
const multipleEvents = [event({ _id: "apply", applicationId: "app_apply", occurredAt: daysAgo(16) })];
const flattenedFlags = computeAttentionFlags(multipleApplications, multipleEvents, now);

assert.equal(flattenedFlags.length, 2);
assert.ok(flattenedFlags.every(Boolean));
assert.deepEqual(
  flattenedFlags.map(({ flagType, applicationId, company, role, message, referenceDate }) => ({
    flagType,
    applicationId,
    company,
    role,
    message: typeof message,
    referenceDate: typeof referenceDate,
  })),
  [
    {
      flagType: applyFlagType,
      applicationId: "app_apply",
      company: "A",
      role: "Backend",
      message: "string",
      referenceDate: "string",
    },
    {
      flagType: followUpFlagType,
      applicationId: "app_follow",
      company: "B",
      role: "Frontend",
      message: "string",
      referenceDate: "string",
    },
  ],
);

const immutableApplications = [application({ _id: "immutable_app" })];
const immutableEvents = [
  event({ _id: "immutable_event", applicationId: "immutable_app", occurredAt: daysAgo(16) }),
];
const applicationSnapshot = JSON.stringify(immutableApplications);
const eventSnapshot = JSON.stringify(immutableEvents);

computeAttentionFlags(immutableApplications, immutableEvents, now);

assert.equal(JSON.stringify(immutableApplications), applicationSnapshot);
assert.equal(JSON.stringify(immutableEvents), eventSnapshot);

const upcomingEvents = computeUpcomingEvents(
  [
    application({ _id: "active_app", currentStatus: "in_process", company: "Active" }),
    application({ _id: "rejected_app", currentStatus: "rejected", company: "Rejected" }),
  ],
  [
    event({
      _id: "soon",
      applicationId: "active_app",
      type: "interview",
      title: "Technical Interview",
      scheduledAt: daysFromNow(2),
    }),
    event({
      _id: "later",
      applicationId: "active_app",
      type: "oa",
      title: "Online Assessment",
      scheduledAt: daysFromNow(4),
    }),
    event({
      _id: "closed",
      applicationId: "rejected_app",
      type: "interview",
      title: "Closed Interview",
      scheduledAt: daysFromNow(1),
    }),
    event({
      _id: "missing_date",
      applicationId: "active_app",
      type: "hr_call",
      title: "Missing Date",
    }),
  ],
  now,
);

assert.deepEqual(upcomingEvents, [
  {
    eventId: "soon",
    applicationId: "active_app",
    company: "Active",
    role: "Engineer",
    type: "interview",
    title: "Technical Interview",
    scheduledAt: daysFromNow(2),
  },
]);

console.log("Attention domain checks passed.");
