import dns from "node:dns";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { config } from "../src/config/env.js";
import { closeMongoConnection, connectToMongo } from "../src/config/mongodb.js";
import { getUsersCollection } from "../src/db/collections.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const DEFAULT_ORIGIN = "http://127.0.0.1:4000";
const API_ORIGIN = (process.env.APPLYFLOW_BACKEND_ORIGIN || DEFAULT_ORIGIN).replace(/\/+$/, "");
const RUN_ID = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const RUN_MARKER = `ApplyFlow E2E ${RUN_ID}`;
const LIST_SCOPE = `${RUN_MARKER} list`;
const APPLICATION_STATUSES = ["saved", "applied", "in_process", "offer", "rejected", "withdrawn"];

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
    `${label} (${response.request.method} ${response.request.path}) expected HTTP ${expectedStatus}, ` +
      `got ${response.status}: ${formatResponseBody(response.body)}`,
  );
}

function redactSensitiveValues(value, key = "") {
  if (/password|token|authorization|secret/i.test(key)) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValues(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactSensitiveValues(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

function formatResponseBody(body) {
  const formatted = JSON.stringify(redactSensitiveValues(body));

  return formatted && formatted.length > 500 ? `${formatted.slice(0, 500)}...` : formatted;
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

async function request(method, path, { token, authorization, body } = {}) {
  const headers = {};

  if (authorization !== undefined) {
    headers.Authorization = authorization;
  } else if (token) {
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
    request: { method, path },
  };
}

async function createTestUser(label) {
  const user = {
    displayName: `${RUN_MARKER} ${label}`,
    email: `applyflow-e2e-${label}-${RUN_ID}@example.test`,
    password: "ApplyFlowE2E123!",
  };

  const registerResponse = await request("POST", "/auth/register", { body: user });
  assertStatus(registerResponse, 201, `${label} register`);
  assert(registerResponse.body?.user?.email === user.email, `${label} register should return user`);
  assertSafeUser(registerResponse.body?.user, `${label} register`);

  const loginResponse = await request("POST", "/auth/login", {
    body: {
      email: user.email,
      password: user.password,
    },
  });
  assertStatus(loginResponse, 200, `${label} login`);
  assert(loginResponse.body?.accessToken, `${label} login should return an access token`);
  assertSafeUser(loginResponse.body?.user, `${label} login`);

  return {
    ...user,
    token: loginResponse.body.accessToken,
    userId: loginResponse.body.user?._id,
  };
}

async function cleanupApplication(token, applicationId) {
  if (!token || !applicationId) {
    return null;
  }

  try {
    const response = await request("DELETE", `/applications/${applicationId}`, { token });

    if (![200, 404].includes(response.status)) {
      return `application ${applicationId}: HTTP ${response.status} ${formatResponseBody(response.body)}`;
    }
  } catch (error) {
    return `application ${applicationId}: ${error.message}`;
  }

  return null;
}

function forgetCreatedApplication(applicationId) {
  const index = createdApplications.findIndex((item) => item.applicationId === applicationId);

  assert(index >= 0, `application ${applicationId} should be tracked for cleanup`);
  createdApplications.splice(index, 1);
}

function applicationPayload(overrides = {}) {
  return {
    company: `${RUN_MARKER} Company`,
    role: `${RUN_MARKER} Backend Test Engineer`,
    currentStatus: "applied",
    jdUrl: "https://example.test/applyflow-e2e",
    source: "E2E script",
    notes: `${RUN_MARKER}; created by backend/scripts/check-backend-e2e.js`,
    followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

function compareApplicationField(first, second, fieldName, direction) {
  const firstTime = new Date(first[fieldName]).getTime();
  const secondTime = new Date(second[fieldName]).getTime();
  const dateDifference = firstTime - secondTime;

  if (dateDifference !== 0) {
    return direction * dateDifference;
  }

  return direction * first._id.localeCompare(second._id);
}

function assertApplicationOrder(actual, reference, fieldName, sortOrder, label) {
  const direction = sortOrder === "asc" ? 1 : -1;
  const expectedIds = [...reference]
    .sort((first, second) => compareApplicationField(first, second, fieldName, direction))
    .map((application) => application._id);
  const actualIds = actual.map((application) => application._id);

  assert(
    actualIds.length === expectedIds.length &&
      actualIds.every((applicationId, index) => applicationId === expectedIds[index]),
    `${label} should order ${fieldName} ${sortOrder}; expected ${expectedIds.join(", ")}, ` +
      `got ${actualIds.join(", ")}`,
  );
}

function assertExactKeys(value, expectedKeys, label) {
  const actualKeys = Object.keys(value ?? {}).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  assert(
    actualKeys.length === sortedExpectedKeys.length &&
      actualKeys.every((key, index) => key === sortedExpectedKeys[index]),
    `${label} should have keys ${sortedExpectedKeys.join(", ")}; got ${actualKeys.join(", ")}`,
  );
}

function assertSafeUser(user, label) {
  assert(user && typeof user === "object", `${label} should return a user`);
  assert(!("passwordHash" in user), `${label} must not expose passwordHash`);
  assert(!("tokenVersion" in user), `${label} must not expose tokenVersion`);
}

function createSessionToken(userId, tokenVersion) {
  const payload = { sub: userId };

  if (tokenVersion !== undefined) {
    payload.tokenVersion = tokenVersion;
  }

  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1d" });
}

async function checkTokenVersionContract(primaryUser) {
  const userId = new ObjectId(primaryUser.userId);
  const users = getUsersCollection();
  const registeredUser = await users.findOne({
    _id: userId,
    email: primaryUser.email,
  });

  assert(registeredUser?.tokenVersion === 0, "new users should store tokenVersion 0");

  const issuedPayload = jwt.verify(primaryUser.token, config.jwtSecret);
  assert(
    typeof issuedPayload.tokenVersion === "number" && issuedPayload.tokenVersion === 0,
    "login should issue numeric tokenVersion 0",
  );

  const unsetResult = await users.updateOne(
    { _id: userId, email: primaryUser.email },
    { $unset: { tokenVersion: "" } },
  );
  assert(unsetResult.matchedCount === 1, "legacy-user setup should match the disposable user");

  const currentTokenForLegacyUser = await request("GET", "/auth/me", {
    token: primaryUser.token,
  });
  assertStatus(currentTokenForLegacyUser, 200, "current token for user missing tokenVersion");

  const legacyToken = createSessionToken(primaryUser.userId);
  const legacyTokenResponse = await request("GET", "/auth/me", { token: legacyToken });
  assertStatus(legacyTokenResponse, 200, "legacy token and user missing tokenVersion");

  for (const tokenVersion of [-1, "0"]) {
    const invalidVersionResponse = await request("GET", "/auth/me", {
      token: createSessionToken(primaryUser.userId, tokenVersion),
    });
    assertStatus(invalidVersionResponse, 401, `invalid tokenVersion ${JSON.stringify(tokenVersion)}`);
    assertControlledError(
      invalidVersionResponse,
      `invalid tokenVersion ${JSON.stringify(tokenVersion)}`,
    );
  }

  const missingUserResponse = await request("GET", "/auth/me", {
    token: createSessionToken(new ObjectId().toString(), 0),
  });
  assertStatus(missingUserResponse, 401, "session for missing user");
  assertControlledError(missingUserResponse, "session for missing user");

  const incrementResult = await users.updateOne(
    { _id: userId, email: primaryUser.email },
    { $set: { tokenVersion: 1 } },
  );
  assert(incrementResult.matchedCount === 1, "version-mismatch setup should match the disposable user");

  const protectedRoutes = [
    ["GET", "/auth/me"],
    ["POST", "/applications"],
    ["GET", "/applications"],
    ["GET", "/applications/000000000000000000000000"],
    ["PATCH", "/applications/000000000000000000000000"],
    ["DELETE", "/applications/000000000000000000000000"],
    ["POST", "/applications/000000000000000000000000/events"],
    ["GET", "/applications/000000000000000000000000/events"],
    ["PATCH", "/applications/000000000000000000000000/events/000000000000000000000000"],
    ["DELETE", "/applications/000000000000000000000000/events/000000000000000000000000"],
    ["GET", "/dashboard/summary"],
  ];

  for (const [method, path] of protectedRoutes) {
    const mismatchResponse = await request(method, path, { token: primaryUser.token });
    assertStatus(mismatchResponse, 401, `tokenVersion mismatch on ${method} ${path}`);
    assertControlledError(mismatchResponse, `tokenVersion mismatch on ${method} ${path}`);
  }

  const refreshedLogin = await request("POST", "/auth/login", {
    body: {
      email: primaryUser.email,
      password: primaryUser.password,
    },
  });
  assertStatus(refreshedLogin, 200, "login after tokenVersion increment");
  assertSafeUser(refreshedLogin.body?.user, "login after tokenVersion increment");

  const refreshedPayload = jwt.verify(refreshedLogin.body.accessToken, config.jwtSecret);
  assert(refreshedPayload.tokenVersion === 1, "new login should issue current tokenVersion 1");

  const refreshedMe = await request("GET", "/auth/me", {
    token: refreshedLogin.body.accessToken,
  });
  assertStatus(refreshedMe, 200, "auth me with current tokenVersion");
  assertSafeUser(refreshedMe.body?.user, "auth me with current tokenVersion");

  console.log("PASS tokenVersion issuance, migration compatibility, and protected-route invalidation");
  return refreshedLogin.body.accessToken;
}

async function main() {
  console.log(`ApplyFlow backend E2E checks against ${API_ORIGIN}`);

  await connectToMongo();

  const healthResponse = await request("GET", "/health");
  assertStatus(healthResponse, 200, "health check");
  assert(healthResponse.body?.success === true, "health check should report success");
  assert(
    typeof healthResponse.body?.message === "string" && healthResponse.body.message.length > 0,
    "health check should return a readable message",
  );
  console.log("PASS health check");

  const primaryUser = await createTestUser("primary");
  primaryToken = await checkTokenVersionContract(primaryUser);

  const missingTokenResponse = await request("GET", "/auth/me");
  assertStatus(missingTokenResponse, 401, "auth me without token");
  assertControlledError(missingTokenResponse, "auth me without token");

  const malformedAuthorizationResponse = await request("GET", "/auth/me", {
    authorization: "Basic invalid-credentials",
  });
  assertStatus(malformedAuthorizationResponse, 401, "auth me with malformed authorization");
  assertControlledError(malformedAuthorizationResponse, "auth me with malformed authorization");

  const invalidTokenResponse = await request("GET", "/auth/me", {
    token: "not-a-valid-jwt",
  });
  assertStatus(invalidTokenResponse, 401, "auth me with invalid token");
  assertControlledError(invalidTokenResponse, "auth me with invalid token");

  const meResponse = await request("GET", "/auth/me", { token: primaryToken });
  assertStatus(meResponse, 200, "auth me");
  assert(meResponse.body?.user?.email === primaryUser.email, "auth me should return current user");
  assertSafeUser(meResponse.body?.user, "auth me");
  console.log("PASS auth register/login/me and authorization errors");

  const badLoginResponse = await request("POST", "/auth/login", {
    body: {
      email: primaryUser.email,
      password: "wrong-password",
    },
  });
  assertStatus(badLoginResponse, 401, "bad login");
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
  assert(
    ownerDetailAfterCrossUserDelete.body?.application?.company === application.company &&
      ownerDetailAfterCrossUserDelete.body?.application?.role === application.role,
    "cross-user update/delete attempts must not mutate the owner's application",
  );

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
  assert(listResponse.body?.success === true, "list applications should report success");
  assert(Array.isArray(listResponse.body?.applications), "list applications should return an array");
  assert(
    listResponse.body?.applications?.some((item) => item._id === applicationId),
    "list applications should include created application",
  );
  console.log("PASS application create and list response shape");

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
      company: `  ${LIST_SCOPE} Company Updated  `,
      role: `  ${LIST_SCOPE} Backend Contract Engineer  `,
      currentStatus: "in_process",
      jdUrl: null,
      source: null,
      notes: null,
      followUpAt: null,
    },
  });
  assertStatus(updateResponse, 200, "application update");
  assert(
    updateResponse.body?.application?.company === `${LIST_SCOPE} Company Updated`,
    "application update should trim company",
  );
  assert(
    updateResponse.body?.application?.role === `${LIST_SCOPE} Backend Contract Engineer`,
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

  const listFixtureDateBase = Date.now() + 3 * 24 * 60 * 60 * 1000;
  const sharedFollowUpAt = new Date(listFixtureDateBase).toISOString();
  const listFixturePayloads = [
    {
      company: `${LIST_SCOPE} [A+B](QA)?`,
      role: `${LIST_SCOPE} Platform Engineer`,
      currentStatus: "saved",
      followUpAt: sharedFollowUpAt,
    },
    {
      company: `${LIST_SCOPE} Search Company`,
      role: `${LIST_SCOPE} Rare Role ${RUN_ID}`,
      currentStatus: "offer",
      followUpAt: sharedFollowUpAt,
    },
    {
      company: `${LIST_SCOPE} Applied Company`,
      role: `${LIST_SCOPE} Applied Engineer`,
      currentStatus: "applied",
      followUpAt: new Date(listFixtureDateBase + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      company: `${LIST_SCOPE} Rejected Company`,
      role: `${LIST_SCOPE} Rejected Engineer`,
      currentStatus: "rejected",
      followUpAt: new Date(listFixtureDateBase + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      company: `${LIST_SCOPE} Withdrawn Company`,
      role: `${LIST_SCOPE} Withdrawn Engineer`,
      currentStatus: "withdrawn",
      followUpAt: new Date(listFixtureDateBase + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  const listFixtureIds = [];

  for (const fixture of listFixturePayloads) {
    const response = await request("POST", "/applications", {
      token: primaryToken,
      body: applicationPayload(fixture),
    });
    assertStatus(response, 201, `create list fixture ${fixture.currentStatus}`);
    const fixtureId = response.body?.application?._id;
    assert(fixtureId, "list fixture should return an application id");
    listFixtureIds.push(fixtureId);
    createdApplications.push({ token: primaryToken, applicationId: fixtureId });
  }

  const restoreFollowUpResponse = await request("PATCH", `/applications/${applicationId}`, {
    token: primaryToken,
    body: {
      followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
  assertStatus(restoreFollowUpResponse, 200, "restore follow-up for list sorting");

  const encodedListScope = encodeURIComponent(LIST_SCOPE);
  const scopedListResponse = await request("GET", `/applications?search=${encodedListScope}`, {
    token: primaryToken,
  });
  assertStatus(scopedListResponse, 200, "run-scoped application list");
  const scopedApplications = scopedListResponse.body?.applications;
  assert(
    Array.isArray(scopedApplications) && scopedApplications.length === 6,
    "run-scoped list should contain exactly six primary fixtures",
  );

  const companySearchResponse = await request(
    "GET",
    `/applications?search=${encodeURIComponent("[A+B](QA)?")}`,
    { token: primaryToken },
  );
  assertStatus(companySearchResponse, 200, "literal regex-character company search");
  assert(
    companySearchResponse.body?.applications?.length === 1 &&
      companySearchResponse.body.applications[0]._id === listFixtureIds[0],
    "company search should treat regex characters literally",
  );

  const roleSearchResponse = await request(
    "GET",
    `/applications?search=${encodeURIComponent(`  Rare Role ${RUN_ID}  `)}`,
    { token: primaryToken },
  );
  assertStatus(roleSearchResponse, 200, "trimmed role search");
  assert(
    roleSearchResponse.body?.applications?.length === 1 &&
      roleSearchResponse.body.applications[0]._id === listFixtureIds[1],
    "role search should trim surrounding whitespace and match role text",
  );

  const filterResponse = await request(
    "GET",
    `/applications?search=${encodedListScope}&status=saved`,
    { token: primaryToken },
  );
  assertStatus(filterResponse, 200, "status-filtered run-scoped list");
  assert(
    filterResponse.body?.applications?.length === 1 &&
      filterResponse.body.applications[0]._id === listFixtureIds[0],
    "status filter should combine with search and return only saved applications",
  );

  const invalidListQueries = [
    { path: "/applications?status=invalid_status", fieldName: "status", label: "invalid list status" },
    { path: "/applications?sortBy=company", fieldName: "sortBy", label: "invalid list sort field" },
    { path: "/applications?sortOrder=sideways", fieldName: "sortOrder", label: "invalid list sort order" },
    { path: "/applications?unexpected=true", fieldName: "query", label: "unknown list query" },
  ];

  for (const { path, fieldName, label } of invalidListQueries) {
    const response = await request("GET", path, { token: primaryToken });
    assertStatus(response, 400, label);
    assertValidationError(response, fieldName, label);
  }

  const defaultSortResponse = await request("GET", `/applications?search=${encodedListScope}`, {
    token: primaryToken,
  });
  assertStatus(defaultSortResponse, 200, "default application sort");
  assertApplicationOrder(
    defaultSortResponse.body.applications,
    scopedApplications,
    "updatedAt",
    "desc",
    "default application sort",
  );

  for (const sortBy of ["createdAt", "updatedAt", "followUpAt"]) {
    for (const sortOrder of ["asc", "desc"]) {
      const response = await request(
        "GET",
        `/applications?search=${encodedListScope}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { token: primaryToken },
      );
      assertStatus(response, 200, `${sortBy} ${sortOrder} sort`);
      assertApplicationOrder(
        response.body.applications,
        scopedApplications,
        sortBy,
        sortOrder,
        `${sortBy} ${sortOrder} sort`,
      );
    }
  }
  console.log("PASS application search/filter/default sort/supported sorts/query validation");

  const secondaryApplicationResponse = await request("POST", "/applications", {
    token: secondUser.token,
    body: applicationPayload({
      company: `${RUN_MARKER} Secondary User Company`,
      role: `${RUN_MARKER} Secondary User Role`,
    }),
  });
  assertStatus(secondaryApplicationResponse, 201, "create secondary application");
  const secondaryApplicationId = secondaryApplicationResponse.body?.application?._id;
  assert(secondaryApplicationId, "secondary application should return an application id");
  createdApplications.push({
    token: secondUser.token,
    applicationId: secondaryApplicationId,
  });

  const primaryScopedListResponse = await request(
    "GET",
    `/applications?search=${encodeURIComponent(RUN_ID)}`,
    { token: primaryToken },
  );
  assertStatus(primaryScopedListResponse, 200, "primary user-scoped application list");
  assert(
    primaryScopedListResponse.body?.applications?.length === 6 &&
      primaryScopedListResponse.body.applications.every(
        (item) => item._id !== secondaryApplicationId,
      ),
    "primary application list must include its six fixtures and exclude the secondary user's data",
  );

  const secondaryScopedListResponse = await request(
    "GET",
    `/applications?search=${encodeURIComponent(RUN_ID)}`,
    { token: secondUser.token },
  );
  assertStatus(secondaryScopedListResponse, 200, "secondary user-scoped application list");
  assert(
    secondaryScopedListResponse.body?.applications?.length === 1 &&
      secondaryScopedListResponse.body.applications[0]._id === secondaryApplicationId,
    "secondary application list must include only its own run fixture",
  );

  const wrongParentApplicationResponse = await request("POST", "/applications", {
    token: primaryToken,
    body: applicationPayload({
      company: `${RUN_MARKER} Wrong Parent Company`,
      role: `${RUN_MARKER} Wrong Parent Role`,
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
        title: `${RUN_MARKER} Secondary user event`,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
      title: `${RUN_MARKER} Technical Interview`,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      mode: "online",
      meetingLink: "https://meet.example.test/applyflow-e2e",
      note: `${RUN_MARKER} event note`,
    },
  });
  assertStatus(createEventResponse, 201, "create event");
  const event = createEventResponse.body?.event;
  assert(event?._id, "create event should return an event id");

  const secondaryToPrimaryEventRequests = [
    {
      method: "POST",
      path: `/applications/${applicationId}/events`,
      body: { type: "note", title: `${RUN_MARKER} forbidden create` },
      label: "secondary-to-primary event create",
    },
    {
      method: "GET",
      path: `/applications/${applicationId}/events`,
      label: "secondary-to-primary event list",
    },
    {
      method: "PATCH",
      path: `/applications/${applicationId}/events/${event._id}`,
      body: { title: `${RUN_MARKER} forbidden update` },
      label: "secondary-to-primary event update",
    },
    {
      method: "DELETE",
      path: `/applications/${applicationId}/events/${event._id}`,
      label: "secondary-to-primary event delete",
    },
  ];

  for (const { method, path, body, label } of secondaryToPrimaryEventRequests) {
    const response = await request(method, path, { token: secondUser.token, body });
    assertStatus(response, 404, label);
    assertControlledError(response, label);
  }

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

  const ownerEventsAfterWrongParentRequests = await request(
    "GET",
    `/applications/${applicationId}/events`,
    { token: primaryToken },
  );
  assertStatus(ownerEventsAfterWrongParentRequests, 200, "owner events after wrong-parent requests");
  assert(
    ownerEventsAfterWrongParentRequests.body?.events?.some(
      (item) => item._id === event._id && item.title === event.title,
    ),
    "wrong-parent update/delete attempts must not mutate or delete the original event",
  );

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
        title: `  ${RUN_MARKER} Updated Technical Interview  `,
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
    updateEventResponse.body?.event?.title === `${RUN_MARKER} Updated Technical Interview`,
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
      title: `${RUN_MARKER} Timeline created fallback`,
    },
    {
      type: "note",
      title: `${RUN_MARKER} Timeline occurred first`,
      occurredAt: new Date(timelineBase).toISOString(),
    },
    {
      type: "note",
      title: `${RUN_MARKER} Timeline scheduled second`,
      scheduledAt: new Date(timelineBase + 60 * 60 * 1000).toISOString(),
    },
    {
      type: "note",
      title: `${RUN_MARKER} Timeline occurred wins`,
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

  const deletedEventUpdateResponse = await request(
    "PATCH",
    `/applications/${applicationId}/events/${event._id}`,
    { token: primaryToken, body: { title: `${RUN_MARKER} deleted event update` } },
  );
  assertStatus(deletedEventUpdateResponse, 404, "update deleted event");

  const deletedEventDeleteResponse = await request(
    "DELETE",
    `/applications/${applicationId}/events/${event._id}`,
    { token: primaryToken },
  );
  assertStatus(deletedEventDeleteResponse, 404, "delete already-deleted event");

  const eventsAfterEventDeleteResponse = await request(
    "GET",
    `/applications/${applicationId}/events`,
    { token: primaryToken },
  );
  assertStatus(eventsAfterEventDeleteResponse, 200, "events after event delete");
  assert(
    eventsAfterEventDeleteResponse.body?.events?.every((item) => item._id !== event._id),
    "deleted event must no longer appear in the parent timeline",
  );
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
      title: `${RUN_MARKER} Cascade check follow-up`,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  });
  assertStatus(cascadeEventResponse, 201, "create cascade event");

  const secondaryDashboardResponse = await request("GET", "/dashboard/summary", {
    token: secondUser.token,
  });
  assertStatus(secondaryDashboardResponse, 200, "secondary dashboard summary");
  const secondaryDashboard = secondaryDashboardResponse.body?.dashboard;
  assert(secondaryDashboardResponse.body?.success === true, "secondary dashboard should report success");
  assert(
    secondaryDashboard?.totalApplications === 1,
    "secondary dashboard should count only the secondary user's application",
  );
  assert(
    secondaryDashboard?.recentApplications?.length === 1 &&
      secondaryDashboard.recentApplications[0].applicationId === secondaryApplicationId,
    "secondary dashboard recent applications should be user-scoped",
  );
  assert(
    secondaryDashboard?.upcomingEvents?.some(
      (item) => item.applicationId === secondaryApplicationId,
    ),
    "secondary dashboard should include its own upcoming event",
  );
  assertExactKeys(
    secondaryDashboard?.countsByStatus,
    APPLICATION_STATUSES,
    "secondary dashboard countsByStatus",
  );
  assert(
    secondaryDashboard.countsByStatus.applied === 1 &&
      APPLICATION_STATUSES.filter((status) => status !== "applied").every(
        (status) => secondaryDashboard.countsByStatus[status] === 0,
      ),
    "secondary dashboard should report exact user-scoped status counts",
  );
  for (const sectionName of ["recentApplications", "upcomingEvents", "attentionFlags"]) {
    assert(
      secondaryDashboard?.[sectionName]?.every(
        (item) => item.applicationId === secondaryApplicationId,
      ),
      `secondary dashboard ${sectionName} should exclude primary user data`,
    );
  }
  console.log("PASS dashboard user scoping");

  const dashboardBeforeDeleteResponse = await request("GET", "/dashboard/summary", {
    token: primaryToken,
  });
  assertStatus(dashboardBeforeDeleteResponse, 200, "dashboard summary");
  assert(dashboardBeforeDeleteResponse.body?.success === true, "dashboard should report success");
  const dashboardBeforeDelete = dashboardBeforeDeleteResponse.body?.dashboard;
  const statusCounts = dashboardBeforeDelete?.countsByStatus;
  assert(
    typeof dashboardBeforeDelete?.totalApplications === "number",
    "dashboard should include totalApplications",
  );
  assert(statusCounts && typeof statusCounts === "object", "dashboard should include status counts");
  assertExactKeys(statusCounts, APPLICATION_STATUSES, "primary dashboard countsByStatus");
  assert(
    !Object.hasOwn(dashboardBeforeDelete, "statusCounts"),
    "dashboard should preserve countsByStatus as the single status-count field",
  );
  assert(
    APPLICATION_STATUSES.every((status) => typeof statusCounts[status] === "number"),
    "dashboard should include every supported status count",
  );
  assert(
    dashboardBeforeDelete.totalApplications ===
      Object.values(statusCounts).reduce((total, count) => total + count, 0),
    "dashboard totalApplications should equal the status-count total",
  );
  assert(
    Array.isArray(dashboardBeforeDelete?.recentApplications),
    "dashboard should include recentApplications",
  );
  assert(
    dashboardBeforeDelete.recentApplications.length === 5,
    "dashboard recentApplications should truncate six applications to the limit of five",
  );
  for (const recentApplication of dashboardBeforeDelete.recentApplications) {
    assertExactKeys(
      recentApplication,
      ["applicationId", "company", "role", "currentStatus", "updatedAt", "followUpAt"],
      "dashboard recent application",
    );
  }
  assert(
    dashboardBeforeDelete.recentApplications.every(
      (item) => item.applicationId !== secondaryApplicationId,
    ),
    "primary dashboard recent applications should exclude secondary user data",
  );
  for (const sectionName of ["recentApplications", "upcomingEvents", "attentionFlags"]) {
    assert(
      dashboardBeforeDelete?.[sectionName]?.every(
        (item) => item.applicationId !== secondaryApplicationId,
      ),
      `primary dashboard ${sectionName} should exclude secondary user data`,
    );
  }
  assert(
    Array.isArray(dashboardBeforeDelete?.upcomingEvents),
    "dashboard should include upcomingEvents",
  );
  assert(
    Array.isArray(dashboardBeforeDelete?.attentionFlags),
    "dashboard should include attentionFlags",
  );
  assert(
    dashboardBeforeDelete.totalApplications === 6 &&
      APPLICATION_STATUSES.every((status) => statusCounts[status] === 1),
    "dashboard should report one application in each status for six primary run fixtures",
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

  for (const listFixtureId of listFixtureIds) {
    const response = await request("DELETE", `/applications/${listFixtureId}`, {
      token: primaryToken,
    });
    assertStatus(response, 200, `delete list fixture ${listFixtureId}`);
    forgetCreatedApplication(listFixtureId);
  }

  const dashboardAfterDeleteResponse = await request("GET", "/dashboard/summary", {
    token: primaryToken,
  });
  assertStatus(dashboardAfterDeleteResponse, 200, "dashboard after delete");
  const dashboardAfterDelete = dashboardAfterDeleteResponse.body?.dashboard;
  assert(
    dashboardAfterDelete.totalApplications === 0,
    "empty dashboard should report zero applications",
  );
  assertExactKeys(
    dashboardAfterDelete.countsByStatus,
    APPLICATION_STATUSES,
    "empty dashboard countsByStatus",
  );
  assert(
    APPLICATION_STATUSES.every((status) => dashboardAfterDelete.countsByStatus[status] === 0),
    "empty dashboard should report zero for every status",
  );
  assert(
    dashboardAfterDelete.upcomingEvents.every((item) => item.applicationId !== applicationId),
    "dashboard should not include events for deleted application",
  );
  assert(
    dashboardAfterDelete.attentionFlags.every((item) => item.applicationId !== applicationId),
    "dashboard should not include flags for deleted application",
  );
  for (const sectionName of ["recentApplications", "upcomingEvents", "attentionFlags"]) {
    assert(
      Array.isArray(dashboardAfterDelete[sectionName]) &&
        dashboardAfterDelete[sectionName].length === 0,
      `empty dashboard ${sectionName} should be an empty array`,
    );
  }

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

let mainError = null;

try {
  await main();
} catch (error) {
  mainError = error;
  console.error(`FAIL ${error.message}`);
} finally {
  const cleanupFailures = [];

  for (const { token, applicationId } of [...createdApplications].reverse()) {
    const cleanupFailure = await cleanupApplication(token, applicationId);

    if (cleanupFailure) {
      cleanupFailures.push(cleanupFailure);
    }
  }

  for (const cleanupFailure of cleanupFailures) {
    console.error(`FAIL cleanup ${cleanupFailure}`);
  }

  await closeMongoConnection();

  console.log(
    "INFO successful disposable user registrations remain in the configured test database " +
      "because ApplyFlow has no user-delete endpoint.",
  );

  if (mainError || cleanupFailures.length > 0) {
    process.exitCode = 1;
  } else {
    console.log("PASS ApplyFlow backend E2E checks completed");
  }
}
