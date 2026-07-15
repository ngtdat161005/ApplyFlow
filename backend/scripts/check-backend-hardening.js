import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { ObjectId } from "mongodb";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../src/domain/shared/domain-errors.js";
import {
  buildApplicationsFilter,
  buildApplicationsSort,
} from "../src/modules/application/application.repository.js";
import { validateListApplicationsQuery } from "../src/modules/application/application.validator.js";
import { validateQuery } from "../src/middlewares/validate.middleware.js";
import { toObjectId } from "../src/utils/object-id.utils.js";

process.env.NODE_ENV ??= "development";
process.env.PORT ??= "4000";
process.env.MONGODB_URI ??= "mongodb://localhost:27017";
process.env.MONGODB_DB_NAME ??= "ApplyFlow";
process.env.JWT_SECRET ??= "test-secret";

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

  let nextError;
  requireAuth(request, {}, (error) => {
    nextError = error;
  });

  return {
    request,
    error: nextError,
  };
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
}

function checkProductionErrorMiddleware() {
  const script = `
    process.env.NODE_ENV = "production";
    process.env.PORT = "4000";
    process.env.MONGODB_URI = "mongodb://localhost:27017";
    process.env.MONGODB_DB_NAME = "ApplyFlow";
    process.env.JWT_SECRET = "test-secret";
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
  const { getApplication } = await import("../src/modules/application/application.service.js");
  const {
    deleteApplicationEvent,
    listApplicationEvents,
    updateApplicationEvent,
  } = await import("../src/modules/event/event.service.js");

  await assertRejectsWithBadRequest(
    () => getApplication(VALID_USER_ID, "not-an-object-id"),
    "Application ID must be a valid ObjectId",
  );

  await assertRejectsWithBadRequest(
    () => listApplicationEvents(VALID_USER_ID, "not-an-object-id"),
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
await checkErrorMiddleware();
await checkAuthMiddleware();
checkProductionErrorMiddleware();
await checkServiceMalformedIdFallbacks();
await checkAuthRepositoryMalformedIdFallback();

console.log("Backend hardening checks passed.");
