# ApplyFlow — V3 Specification

## 1. Product Context, Authority, and Scope

### 1.1 Product identity

ApplyFlow remains a private, single-user job/internship application tracker for students, new graduates, and individual job seekers.

V3 does not change the core product defined by the V1 specification and hardened by V2. Users still manage:

- applications;
- application statuses;
- recruitment events and timelines;
- follow-up dates;
- attention flags;
- dashboard summaries.

ApplyFlow remains neither a job board nor an applicant-tracking system for employers. It does not apply to jobs on a user's behalf.

### 1.2 V3 goal

V3 improves ApplyFlow in three bounded areas for Fullstack SWE portfolio credibility:

1. **Frontend data-fetching architecture** — replace ad-hoc `refreshKey`, duplicated loading state, and manual invalidation with TanStack Query.
2. **Account lifecycle completeness** — add password reset and authenticated account deletion.
3. **Frontend quality** — strengthen design tokens, loading UX, motion restraint, accessibility, and Auth presentation.

V3 is not an attempt to prove product-market fit or pursue real users. Real-user expansion remains deferred until a concrete problem, affected user group, and current workaround have been validated through interviews.

### 1.3 Specification model

This document is an **incremental/delta specification**, not a standalone rewrite of V1 and V2.

Source-of-truth order for V3 work:

1. `AGENTS.md` controls repository/agent operating rules.
2. `docs/v3-spec.md` controls behavior explicitly added or changed by V3.
3. `docs/v3-tasks.md` controls task order, branch/PR scope, merge gates, and human-approval checkpoints.
4. `docs/v2-spec.md` controls all finalized V2 product, API, validation, privacy, and frontend contracts not changed here.
5. `docs/v1-spec.md` controls the underlying V1 product/domain baseline where V2 and V3 are silent.
6. `docs/ApplyFlow Architecture.md` controls existing architecture until a V3 task intentionally updates it.
7. `docs/test-plan.md` and `docs/regression-checklist.md` control verification procedure and evidence classification.

If two applicable sources materially conflict and this precedence does not resolve the conflict, Codex must stop and ask. It must not invent a compatibility rule merely to continue implementation.

### 1.4 V1/V2 preservation rule

Unless this document explicitly changes a contract, V3 must preserve the merged V2 behavior and the V1 domain beneath it.

V3 must not silently change:

- existing route paths or the configured API base prefix;
- existing request/response fields;
- existing HTTP status codes;
- the shared V2 error middleware contract;
- registration, login, `/auth/me`, frontend logout, and protected-route behavior;
- JWT expiry/signature behavior except for the explicit `tokenVersion` extension in §6.7;
- user ownership and cross-user `404` privacy behavior;
- application fields, statuses, search/filter/sort behavior, CRUD, or cascade semantics;
- event fields, event types, validation, ownership, CRUD, or timeline ordering;
- dashboard fields and behavior finalized by V2;
- attention-flag rules, thresholds, dates, ordering, or separation from upcoming events;
- MongoDB collection names already used by V2;
- existing environment-variable names;
- responsive and loading/empty/error states already required by V2.

Silence in V3 is not authorization to remove, rename, reinterpret, or “clean up” a V1/V2 contract.

### 1.5 Architecture preservation and intentional deltas

Backend remains a modular monolith with the existing layered flow:

```text
Route → Middleware → Controller → Service → Repository → MongoDB
```

Controllers handle HTTP concerns, services own orchestration/business rules, and repositories own MongoDB operations. V3 must not introduce Mongoose, Prisma, microservices, generic CRUD base classes, background-job infrastructure, or a broad authentication rewrite.

Frontend retains React, Vite, React Router, the existing Auth store/provider, feature/page separation, API modules, and plain CSS.

The intentional V3 architecture deltas are limited to:

- TanStack Query for application list, application detail, application events, and dashboard server state;
- an email adapter for password-reset delivery;
- `passwordResetTokens` persistence;
- `tokenVersion` validation in authenticated requests;
- MongoDB transactions for reset-token consumption and account deletion;
- the three V3 frontend routes defined in §8.

### 1.6 Dependency policy

- `@tanstack/react-query` is the only mandatory new frontend runtime dependency.
- No Tailwind, MUI, CSS-in-JS system, animation library, Redux migration, or form framework.
- A narrowly scoped backend dependency for Resend or forgot-password rate limiting may be added only by its owning task, after inspecting current Node/package versions and documenting the justification.
- Do not add Redis or distributed rate-limit infrastructure in V3.
- Do not guess dependency versions. Resolve versions from the current repository/runtime and official package compatibility information at implementation time.

### 1.7 Out of scope

- multi-domain CORS work;
- global API rate limiting beyond the forgot-password exception;
- refresh tokens;
- OAuth or Gmail inbox access;
- Twilio/SMS;
- profile editing, notification preferences, or Settings features beyond account deletion;
- account `deleting`/recovery state machine;
- OCR/vision job-posting extraction;
- optimistic updates or animated list reordering;
- product-market-fit or user-growth work.

---

## 2. TanStack Query Layer

### 2.1 Scope

Migrate server state for these domains only:

- applications list;
- application detail;
- application events;
- dashboard summary.

The existing Auth store/provider remains the source of truth for access tokens, auth bootstrap, current user, login, register, and logout. Do not migrate Auth state to TanStack Query.

### 2.2 Provider and client

- Replace the empty `app/query-client.js` placeholder with one shared `QueryClient`.
- Mount exactly one `QueryClientProvider` in the existing provider composition.
- Preserve provider ordering required by Auth bootstrap and protected routing.
- Do not add React Query Devtools as a runtime dependency in V3.

Default behavior:

```js
{
  queries: {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: retryNetworkOrServerFailureOnce
  },
  mutations: {
    retry: false
  }
}
```

`retryNetworkOrServerFailureOnce` means:

- at most one retry for a network failure or retryable `5xx` response;
- no retry for `4xx`, including `400`, `401`, `404`, `409`, or `429`;
- no hidden infinite retry loop.

The existing global unauthorized handling remains authoritative for `401`. TanStack Query must not create a second conflicting logout/redirect mechanism.

### 2.3 Query-key factory

```js
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
```

Rules:

- Query keys contain only stable, serializable values.
- List filters are canonical objects containing only supported backend fields.
- Search is trimmed before entering the canonical key.
- Do not include DOM events, functions, component instances, raw form objects, or transient presentation state.
- Detail/event queries are disabled until the required application ID is present and valid enough for the existing route validation flow.

### 2.4 Query functions and API ownership

- Existing `src/api` modules remain the only place that constructs HTTP requests.
- Query functions call those API modules; they do not duplicate fetch/client logic in components.
- TanStack Query does not replace backend validation or authorization.
- Existing V2 response shapes remain unchanged.

### 2.5 Mutation invalidation

| Successful mutation | Required cache action |
|---|---|
| Create application | Invalidate `applicationKeys.lists()` and `dashboardKeys.summary()` |
| Update application | Invalidate `applicationKeys.detail(id)`, `applicationKeys.lists()`, and `dashboardKeys.summary()` |
| Delete application | Invalidate lists/dashboard and remove deleted detail/event queries |
| Create/update/delete event | Invalidate `applicationKeys.events(applicationId)` and `dashboardKeys.summary()` |

No optimistic updates in V3.

After application deletion, stale detail/event data for that application must not remain readable from the client cache.

### 2.6 Loading, background refetch, and errors

- Initial pending state may render a layout-matching skeleton.
- Background fetching after data exists must retain current content and use a subtle updating state; it must not replace the whole page with a skeleton.
- Mutation pending state must prevent duplicate submission for the affected action.
- Query error state must retain the V2 retry/error affordance.
- Empty and filtered-empty results remain successful data states, not errors.
- A previous successful result must not be exposed after logout or account deletion.

### 2.7 Private-cache lifecycle

Clear all private Query Client data after:

- explicit logout;
- global unauthorized session invalidation;
- successful account deletion.

Do not clear private cache before account deletion succeeds. Wrong-password and service-unavailable responses must keep the authenticated session and current data intact.

### 2.8 Migration order

1. Query Client/provider and key factory.
2. Applications list.
3. Application detail.
4. Events.
5. Dashboard.

Each migration removes the corresponding `refreshKey` and duplicated request state only after equivalent V2 loading, empty, error, retry, validation, privacy, and navigation behavior is preserved.

---

## 3. Design Tokens

### 3.1 Token location and scope

Global values remain CSS custom properties in `frontend/src/styles.css`. V3 does not introduce CSS-in-JS or a second styling system.

### 3.2 Type scale

```css
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 20px;
--font-size-xl: 28px;
--font-size-2xl: 36px;
```

### 3.3 Spacing scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

### 3.4 Color and radius

- Preserve the existing primary accent and status-color semantics.
- Add one `--color-accent-secondary` for deliberate emphasis.
- Secondary accent must meet WCAG AA text contrast where used for text.
- Color must never be the only state signal; pair it with text and/or an icon.
- Preserve the system radius of 8px through the existing or normalized `--radius-base` token.

### 3.5 Migration boundary

Tokenize repeated typography and spacing patterns where the corresponding scale value preserves visual intent.

V3 does **not** require zero raw pixel values. Do not mechanically replace:

- breakpoints;
- border widths;
- icon sizes;
- illustration geometry;
- component-specific min/max dimensions;
- calculated values;
- values whose change would alter layout behavior.

The token task must not become an Auth redesign, layout rewrite, or broad formatting churn.

---

## 4. Motion and Accessibility

These rules apply to all motion introduced by V3.

1. Respect `prefers-reduced-motion: reduce`.
2. Under reduced motion, disable gradient animation, parallax, hover transitions, and decorative fades; preserve instant functional state changes.
3. Disable pointer parallax on touch/coarse-pointer devices.
4. Pointer tracking uses CSS variables and `requestAnimationFrame`; never React `setState` for every pointer event.
5. Animate only `opacity`, `box-shadow`, `background-position`, and decorative `transform`.
6. Dense-list cards must not scale or translate on hover.
7. Animation must not cause layout shift.
8. Route transitions are fade-in on mount, not true crossfades or animation-presence systems.
9. Decorative skeleton nodes use `aria-hidden="true"`; a screen-reader loading announcement remains available.
10. Modal focus moves into the dialog, remains trapped while open, and returns to the invoking control when closed.
11. Forms retain programmatic labels, keyboard submission, understandable errors, and visible focus.

---

## 5. Frontend Visual Work

### 5.1 Shared identity

Auth and protected pages remain one product:

- same font family;
- same primary accent;
- same radius/token system;
- same status semantics;
- compatible form/button language.

Auth may use richer presentation and slower decorative motion; protected pages prioritize repeated use and restraint.

### 5.2 Login and Register

- Use a split-screen layout at suitable desktop width and a single-column layout on narrow screens.
- One side contains the existing functional form.
- The other side may show real presentational components with hardcoded sample data clearly labeled `Sample data`.
- Preview content is inert: no navigation, API call, mutation, or real user data.
- A small, optional `readOnly`/preview mode is permitted only when it does not distort production component behavior.
- If reuse requires meaningful router/action coupling or broad production-component edits, use a static CSS/HTML illustration instead. Do not fork production markup into a fake duplicate application UI.
- Gradient animation uses CSS `background-position`, duration at least 12 seconds.
- Decorative parallax is limited to approximately ±8px and follows §4.
- Login/Register mount with opacity fade-in; true route crossfade is not required.
- Preserve every V2 form, validation, auth bootstrap, protected redirect, and logout behavior.

### 5.3 Protected pages

- Dashboard, Applications, Application Detail, and Settings may fade in over 150–200ms on mount.
- Card hover changes box shadow only.
- Initial skeletons approximate real page geometry.
- Application filter/sort feedback uses opacity only, no animated reordering.
- Background query refetch does not blank or skeletonize an already usable page.
- Existing empty, filtered-empty, not-found, validation, API-error, and navigation behavior remains required.

### 5.4 Responsive baseline

- No horizontal page overflow at the existing supported mobile widths.
- Auth preview may move below the form or be hidden when space is insufficient, but the functional form remains first-class.
- Dialogs fit within narrow viewports and remain keyboard usable.
- Motion is not required to communicate any state.

---

## 6. Password Reset and Session Invalidation

### 6.1 End-to-end flow

1. User submits email to `POST /auth/forgot-password`.
2. Backend validates and normalizes the email using existing conventions.
3. Rate limits are applied whether or not the account exists.
4. If the account exists, old reset tokens are invalidated, a new high-entropy token is created, only its hash is stored, and the raw token appears only in the delivery URL.
5. If no account exists, the same public success contract is returned.
6. User opens `/reset-password?token=...` on the configured frontend origin.
7. Frontend sends the token only when submitting `POST /auth/reset-password`.
8. Backend atomically consumes the token, updates the password, and increments `tokenVersion`.
9. Reset does not issue a JWT or automatically log the user in.

There is no backend reset-token validation `GET` endpoint in V3.

### 6.2 Password-reset token

- Generate with `crypto.randomBytes(32).toString('hex')`.
- Store `SHA-256(rawToken)` as a fixed-length hexadecimal hash.
- Do not use bcrypt for the high-entropy reset token.
- Hash the submitted token and compare fixed-length buffers with `crypto.timingSafeEqual` where comparison occurs in application code.
- Default expiry: 30 minutes.
- Raw token must not enter application logs, committed evidence, analytics, local storage, or persisted auth state.

### 6.3 `passwordResetTokens` collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "tokenHash": "string",
  "expiresAt": "Date",
  "createdAt": "Date"
}
```

Required indexes:

- `{ userId: 1 }` for user-token replacement/cleanup;
- TTL index `{ expiresAt: 1 }` with `expireAfterSeconds: 0`.

TTL is cleanup only. Authorization always checks `expiresAt > now`; document existence does not prove validity because TTL deletion is asynchronous.

Service invariant: at most one active reset token per user. A new request invalidates previous tokens before the replacement becomes active. Replacement must not rely on TTL timing.

### 6.4 Forgot-password request

Endpoint, under the existing API base prefix:

```http
POST /auth/forgot-password
Content-Type: application/json
```

Request:

```json
{ "email": "user@example.com" }
```

Validation:

- body accepts only `email`;
- email is required, string, trimmed/lowercased through the existing normalization rule, and valid format;
- malformed input uses the preserved V2 validation shape from §10.2;
- unknown body fields follow the V2 shared validation policy.

Normal public response for both existing and non-existing accounts:

```http
200 OK
```

```json
{
  "message": "If an account with that email exists, a reset link has been sent."
}
```

The endpoint is deliberately `200`, not `202`, because V3 has no background job/queue contract.

### 6.5 Scoped rate limiting

Forgot-password is the only V3 exception to “no global rate limiting”:

- 5 requests per 15 minutes per normalized email;
- 20 requests per 60 minutes per client IP;
- rate-limited response: `429` using the V3 extension shape from §10.3;
- response does not reveal whether email or IP triggered the limit;
- policy applies equally to existing and non-existing accounts;
- do not trust arbitrary forwarded headers; align proxy trust with actual deployment configuration.

Canonical V3 implementation is an **in-memory, single-instance limiter**. Accepted limitations:

- counters reset on process restart;
- counters are not shared across server instances;
- it is not distributed abuse protection.

Do not add Redis or a MongoDB rate-limit collection. These limitations are acceptable for the current portfolio deployment and must be documented, not hidden.

The email limiter key should be derived from a one-way hash of the normalized email rather than retaining the raw email as an in-memory key. Limiter keys must not be logged.

### 6.6 Email adapter and reset URL

Interface:

```js
sendPasswordResetEmail({ to, resetUrl })
```

Rules:

- Resend is the production-like provider and is accessed only through the adapter.
- Auth controller/service must not call provider-specific APIs directly.
- `FRONTEND_ORIGIN` is validated at startup and used to construct the reset URL.
- Do not construct the URL from an untrusted request `Origin`, `Host`, or forwarded header.
- Resulting URL is `${FRONTEND_ORIGIN}/reset-password?token=${encodeURIComponent(rawToken)}`.
- Email content contains no password, stored hash, access token, or sensitive account details.
- `EMAIL_PROVIDER=console` is development/test only and must be rejected in production.
- Tests capture/suppress the console delivery without printing raw tokens in normal CI output.
- `EMAIL_PROVIDER=resend` requires `RESEND_API_KEY` and validated sender configuration.
- CI does not call real Resend.

If delivery fails for an existing account:

- remove/disable the just-created usable token;
- record a sanitized operational error without raw email or token;
- retain the same generic public `200` response so provider failure does not reveal account existence.

External email sending must not occur inside a MongoDB transaction callback that the driver may retry.

### 6.7 `tokenVersion`

Users gain:

```json
{ "tokenVersion": 0 }
```

Rules:

- New users store `tokenVersion: 0`.
- Existing users without the field are read as version `0`; V3 does not force logout on deployment.
- Every newly issued session JWT includes numeric, non-negative `tokenVersion`.
- A JWT missing the claim is interpreted as version `0` for migration compatibility.
- Non-numeric or negative JWT versions are invalid (`401`).
- `requireAuth` verifies signature/expiry, loads the current user, and compares stored/current versions.
- Missing user or version mismatch uses the existing unauthorized response behavior.
- `/auth/me`, login, register, and other safe-user responses do not expose `tokenVersion`.
- Successful reset increments the stored version by one in the same transaction as password update/token consumption.

Accepted architectural cost: every protected request now requires a user lookup after JWT verification. Full protected-route/backend regression is mandatory.

### 6.8 Atomic reset consumption

Endpoint:

```http
POST /auth/reset-password
Content-Type: application/json
```

Request:

```json
{
  "token": "raw-reset-token",
  "newPassword": "new-password"
}
```

Validation:

- accept only `token` and `newPassword`;
- both are required strings;
- password reuses the existing minimum-eight-character policy;
- frontend confirmation is UX-only and is not sent as authoritative backend input.

Within one shared `ClientSession` transaction:

1. hash the raw token;
2. atomically claim/delete one matching token with `expiresAt > now`;
3. update the referenced user's password hash;
4. increment `tokenVersion`;
5. commit.

Do not implement “find now, delete later”. Two concurrent requests using one raw token cannot both succeed. If any transaction step fails, abort restores the token claim and previous password/version.

If transactions are unsupported/unavailable, return `503 RESET_UNAVAILABLE`; never fall back to a replay-prone non-atomic sequence. Always end the session in `finally`. Do not expose raw MongoDB errors.

### 6.9 Password policy

V3 preserves the existing policy: minimum 8 characters, no new complexity rules. Passwords continue to use the existing bcrypt configuration. V3 does not silently change bcrypt cost or registration/login validation.

---

## 7. Authenticated Account Deletion

### 7.1 Endpoint and contract

Under the existing API base prefix:

```http
DELETE /users/me
Authorization: Bearer <session-token>
Content-Type: application/json
```

Request:

```json
{ "password": "current-password" }
```

Rules:

- body accepts only `password`;
- target identity always comes from `requireAuth`;
- endpoint accepts no user ID parameter;
- current password is rechecked against the current user;
- wrong password mutates nothing and returns `401 INVALID_PASSWORD` through §10.3;
- success returns `200` with `{ "message": "Account deleted." }` only;
- do not return deleted documents, collection names, counts, hashes, or transaction details.

### 7.2 Atomic cascade

Use one `ClientSession` from the existing shared `MongoClient`. Every repository operation receives the same `{ session }`.

Delete in this order:

1. `application_events` owned by the authenticated user;
2. `applications` owned by the authenticated user;
3. `passwordResetTokens` owned by the authenticated user;
4. the authenticated `users` document.

If any step fails, abort the transaction and commit no partial deletion. Always end the session.

Unsupported/unavailable transactions return `503 DELETE_UNAVAILABLE`; no non-atomic fallback.

### 7.3 Ownership and privacy

- Client cannot nominate another user.
- Existing cross-user application/event privacy remains unchanged.
- Wrong password must not reveal additional account information.
- A deleted user's old JWT fails subsequent authentication because the user lookup fails.

### 7.4 Accepted concurrency limitation

V3 does not add an account `deleting` state or recovery state machine. A separately authenticated mutation could theoretically interleave with deletion and create child data outside the transaction's snapshot.

This limitation must be documented in architecture/release notes. Do not claim that V3 prevents every concurrent orphan scenario. The cascade itself remains atomic within its transaction.

### 7.5 Frontend behavior

- Account deletion exists only in protected `/settings` danger zone.
- User must deliberately open confirmation and enter current password.
- No optimistic logout/deletion.
- Wrong password shows inline error and keeps session/data.
- `503` or generic failure keeps session/data and permits retry.
- Only successful `200` clears Auth state and all private query cache, then replaces/navigates to Login.
- Browser Back must not reveal a cached private page after success.

---

## 8. New Frontend Routes and Page-State Contracts

### 8.1 Routes

| Route | Access | Purpose |
|---|---|---|
| `/forgot-password` | Public | Request password-reset delivery |
| `/reset-password?token=...` | Public | Set a new password using the email token |
| `/settings` | Protected | Account danger zone |

These routes extend, not replace, existing V2 routing.

### 8.2 Forgot Password page

Required states:

| State | Required behavior |
|---|---|
| Idle | Labeled email field and submit; link back to Login |
| Client validation | Preserve input and show understandable field error |
| Submitting | Disable duplicate submission and announce progress |
| Success | Show the generic response; never confirm account existence |
| Rate limited | Show a generic try-again-later message |
| Service/network failure | Preserve email input and offer retry without claiming an email was sent |

Login contains a discoverable “Forgot password?” link.

### 8.3 Reset Password page

Required states:

| State | Required behavior |
|---|---|
| Missing URL token | Do not submit; show invalid/expired-link guidance |
| Idle | New password and confirmation fields |
| Mismatch/weak password | Preserve form values where safe and show field guidance |
| Submitting | Disable duplicate submission and announce progress |
| Invalid/used/expired token | Present one safe message: link is invalid or expired |
| Reset unavailable | Show temporary-unavailability message; do not imply success |
| Success | Clear password fields and navigate/link to Login; do not auto-login |

Raw reset token remains ephemeral and is never copied into Auth persistence/local storage.

### 8.4 Settings page

- Protected-route bootstrap/redirect behavior follows V2.
- Scope is account deletion only in V3.
- Danger-zone copy explains permanence and that applications/events are deleted.
- Confirmation uses an accessible modal/dialog.
- Cancel performs no API call and clears password input.
- Wrong-password, submitting, unavailable, generic failure, and success behavior follow §7.5.

### 8.5 Form/error consistency

- Reuse existing V2 field-error/general-error presentation where practical.
- Preserve user input after recoverable validation/network errors.
- Clear sensitive password inputs after success and when closing deletion confirmation.
- Do not show internal error codes as the only human-facing message.

---

## 9. Configuration and Environment

### 9.1 New variables

| Variable | Required behavior |
|---|---|
| `FRONTEND_ORIGIN` | Absolute allowed frontend origin used to build reset URL; no path/query |
| `EMAIL_PROVIDER` | `resend` or `console`; console forbidden in production |
| `RESEND_API_KEY` | Required for Resend provider |
| `RESEND_FROM_EMAIL` | Verified sender/from address required for Resend |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Positive integer, default `30` |
| `RESET_REQUEST_RATE_LIMIT_PER_EMAIL` | Positive integer, default `5` |
| `RESET_REQUEST_RATE_LIMIT_EMAIL_WINDOW_MINUTES` | Positive integer, default `15` |
| `RESET_REQUEST_RATE_LIMIT_PER_IP` | Positive integer, default `20` |
| `RESET_REQUEST_RATE_LIMIT_IP_WINDOW_MINUTES` | Positive integer, default `60` |

### 9.2 Validation

- Centralized environment validation remains authoritative.
- In development/test, `EMAIL_PROVIDER` may default to `console`; production must explicitly select `resend`.
- Missing/invalid variables fail fast with a clear configuration error when required by the selected environment/provider.
- `FRONTEND_ORIGIN` must use `http` or `https`; production requires the deployed HTTPS origin.
- `.env.example` contains placeholders only.
- CI uses safe dummy configuration and no real Resend credentials.
- Existing V1/V2 environment names remain unchanged.

### 9.3 Secret handling

Never commit or report:

- real MongoDB connection strings;
- JWT secrets;
- Resend API keys;
- raw reset tokens;
- password values;
- private test-account credentials.

Test evidence may use redacted identifiers and disposable accounts.

---

## 10. Validation, API, and Error Compatibility

### 10.1 Existing V2 contract remains primary

V3 does not replace the shared V2 API/error policy.

Existing validation errors remain:

```json
{
  "message": "Validation failed",
  "errors": {
    "fieldName": "Human-readable error"
  }
}
```

Existing general errors remain:

```json
{
  "message": "Human-readable error"
}
```

Do not retrofit every V1/V2 endpoint with new codes during V3.

### 10.2 V3 validation policy

For new V3 endpoints:

- trim/normalize fields before validation where specified;
- reject missing or invalid required fields with `400` and V2 `{ message, errors }` shape;
- reject unknown body fields according to V2 shared validation policy;
- never return stack traces, provider responses, hashes, transaction internals, or raw database errors;
- frontend must present understandable messages and not rely solely on code strings.

### 10.3 Machine-readable V3 error extension

V3 endpoints may add a `code` while retaining the V2 human-readable `message`:

```json
{
  "message": "Human-readable error",
  "code": "MACHINE_READABLE_CODE"
}
```

This is an extension for new V3 endpoint errors, not a replacement for existing V2 shapes.

Canonical V3 errors:

| Endpoint/condition | Status | Code | Public message intent |
|---|---:|---|---|
| Forgot-password rate limit | 429 | `RESET_RATE_LIMITED` | Too many requests; try later |
| Reset token malformed/not found/used/expired | 400 | `INVALID_TOKEN` | Link invalid or expired |
| New password below policy | 400 | validation shape or `WEAK_PASSWORD` | Password must meet existing policy |
| Reset transaction unavailable | 503 | `RESET_UNAVAILABLE` | Reset temporarily unavailable |
| Delete wrong current password | 401 | `INVALID_PASSWORD` | Current password is incorrect |
| Delete transaction unavailable | 503 | `DELETE_UNAVAILABLE` | Account deletion temporarily unavailable |

V3 deliberately uses the same `INVALID_TOKEN` contract for malformed, missing, used, and expired reset tokens. The frontend and public API do not need to reveal which internal condition occurred.

Unexpected errors use the existing server-error middleware contract and must not expose internals.

### 10.4 API prefix and routing

All endpoint paths in this document are relative to the existing configured API base prefix (for example `/api/v1`). V3 must mount new routes consistently with current route composition rather than creating an unversioned parallel API.

---

## 11. Security and Transaction Rules

### 11.1 Transaction boundary

- Obtain sessions only from the shared MongoClient lifecycle.
- Pass the same `{ session }` to every repository operation in one transaction.
- Keep controllers unaware of MongoDB transaction mechanics.
- Always end sessions in `finally`.
- Do not perform email/network side effects inside retryable transaction callbacks.
- No silent non-atomic fallback for reset consumption or account deletion.

### 11.2 Testing environments

- Mocked transaction tests prove orchestration only.
- Standalone MongoDB does not prove replica-set transactions.
- Real replica-set evidence is required for V3-10 and V3-12 merge recommendations.
- If the necessary environment is unavailable, report `SKIPPED` and follow the human hard-gate policy in `v3-tasks.md`; never report a mock as real transaction evidence.

### 11.3 Enumeration and logging

- Existing/non-existing forgot-password accounts share normal status/body.
- Rate-limit policy is applied before account-existence-dependent behavior.
- Operational logs use sanitized identifiers/events, not raw email or token.
- Response timing need only avoid an obvious branch difference; V3 does not claim cryptographic timing indistinguishability.

---

## 12. Verification and Acceptance

### 12.1 Query layer

- [ ] Exactly one Query Client provider exists.
- [ ] Auth state remains outside TanStack Query.
- [ ] Applications list/detail/events/dashboard use defined keys and API modules.
- [ ] Search/filter/sort retain V2 behavior and stable keys.
- [ ] Every mutation performs the required invalidation.
- [ ] Deleted application detail/events are removed from cache.
- [ ] Logout, unauthorized invalidation, and successful account deletion clear private cache.
- [ ] Initial pending, background refetch, empty, filtered-empty, error, and mutation states are distinct.

### 12.2 Password reset

- [ ] Existing and non-existing accounts receive the same normal forgot-password status/body.
- [ ] Malformed email uses V2 validation shape.
- [ ] Email/IP rate limits and `429` contract work.
- [ ] A second reset request invalidates the first token.
- [ ] TTL cleanup is not used as validity proof.
- [ ] Provider failure leaves no usable new token and does not enumerate the account.
- [ ] Raw email/token is absent from normal logs/evidence.
- [ ] Valid reset succeeds once and updates the password.
- [ ] Concurrent use of one token cannot succeed twice.
- [ ] Expired/invalid/used tokens produce safe errors.
- [ ] Old JWT is rejected after successful reset.
- [ ] Reset does not auto-login.

### 12.3 Account deletion

- [ ] Endpoint uses authenticated identity and accepts no user ID.
- [ ] Wrong password deletes nothing and keeps frontend session.
- [ ] Successful transaction deletes events, applications, reset tokens, and user.
- [ ] Forced mid-cascade failure rolls back all deletion.
- [ ] Unsupported transaction returns `503` with no fallback.
- [ ] Deleted JWT no longer authenticates.
- [ ] Successful frontend flow clears Auth/private query cache.
- [ ] Browser Back cannot reveal private cached content.
- [ ] Accepted concurrent-mutation limitation is documented accurately.

### 12.4 Visual/accessibility

- [ ] Design tokens are applied without mechanical layout rewrite.
- [ ] Auth sample data is labeled and inert.
- [ ] Login/Register/reset behavior remains functional.
- [ ] Reduced-motion disables non-essential motion.
- [ ] Parallax is disabled on touch/coarse pointer.
- [ ] Skeletons match layouts and are accessible.
- [ ] Background refetch does not flash a full-page skeleton.
- [ ] Forms/modal work by keyboard at desktop and mobile widths.
- [ ] Filtering/sorting 20–50 disposable applications causes no layout shift or reorder animation.

### 12.5 Regression baseline

- [ ] Existing backend attention/hardening checks pass.
- [ ] Existing backend E2E passes when its environment is available.
- [ ] Frontend clean install/build passes.
- [ ] Existing login/register/me/logout and protected routes regress cleanly.
- [ ] Existing application/event/dashboard/attention contracts remain unchanged.
- [ ] Cross-user private resources still return the V2 privacy behavior.
- [ ] Test evidence separates CI, local automation, mocks, replica set, source inspection, and browser QA.

---

## 13. V3 Completion Rule

V3 is complete only when:

1. all tasks in `docs/v3-tasks.md` are completed in dependency order;
2. human-approval hard gates are respected;
3. no critical V3 acceptance criterion is silently skipped;
4. V1/V2 regression behavior is preserved;
5. architecture/README/environment documentation matches the merged implementation;
6. final regression records exact `PASS`, `FAIL`, and `SKIPPED` evidence;
7. V3-18 returns `READY` with no release blocker.

V3 does not claim production-scale abuse protection, distributed rate limiting, perfect deletion/mutation concurrency prevention, or validated product-market fit.
