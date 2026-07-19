# ApplyFlow — V3 Specification

## 1. Product Overview

### 1.1 V3 Goal

V3 improves ApplyFlow in two areas, for the purpose of Fullstack SWE internship portfolio credibility:

1. **Data-fetching architecture** — replace the ad-hoc `refreshKey`/manual `isLoading`/`fetchError` pattern with a structured query layer.
2. **Account lifecycle completeness** — add the two flows explicitly flagged as missing in V1/V2: password reset and account deletion.

V3 also raises frontend visual quality (design tokens, auth page, in-app micro-interactions), but this is secondary to the two goals above and must not compromise them.

### 1.2 V3 Philosophy

V3 is **not** a pursuit of a real product with real users. It does not add:

- CORS for multi-domain deployment
- global rate limiting
- OAuth-based email reading (Gmail integration)
- SMS/Twilio integration
- any distributed locking / state-machine complexity beyond what is specified in §7.4

V3 must avoid becoming a rewrite. CSS stays hand-written (no Tailwind/MUI). `@tanstack/react-query` is the only mandatory new frontend runtime dependency. A narrowly scoped backend dependency for rate limiting or Resend may be added only if the implementation task documents why the existing runtime cannot meet the contract safely; dependency additions must not expand into a generic infrastructure rewrite.

### 1.3 Out of Scope for V3

- Multi-domain CORS configuration
- Global API rate limiting (forgot-password has a scoped exception — see §6.4)
- OCR/vision job-posting extraction (deferred to V4, undecided)
- Gmail/email-reading integration
- SMS reminders
- Settings page features beyond the account-deletion danger zone (e.g. profile editing, notification preferences)
- `deletionPending` state machine / deletion recovery flow (see §7.4 known limitation)

---

## 2. Query Layer

### 2.1 Dependency

Add `@tanstack/react-query` as the only new frontend runtime dependency in V3.

### 2.2 Scope

Migrate to `useQuery`/`useMutation` for these domains only:

- applications (list)
- application detail
- application events
- dashboard summary

**Explicitly excluded from migration:** `AuthProvider` / auth state (`features/auth/auth.store.js`) stays as-is.

### 2.3 Non-goals

- No optimistic updates in V3.
- No generic fetch/API abstraction framework — use `@tanstack/react-query` directly with a thin `queryFn` per domain.

### 2.4 Query key factory

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

### 2.5 Invalidation rules

| Mutation | Must invalidate |
|---|---|
| create application | `applicationKeys.lists()`, `dashboardKeys.summary()` |
| update application | `applicationKeys.detail(id)`, `applicationKeys.lists()`, `dashboardKeys.summary()` |
| delete application | `applicationKeys.lists()`, `dashboardKeys.summary()` |
| create/update/delete event | `applicationKeys.events(applicationId)`, `dashboardKeys.summary()` |

After a successful application deletion, remove the deleted application's detail and event queries from the cache in addition to invalidating list/dashboard queries. Do not leave deleted private data available through a stale detail cache entry.

Filters used in query keys must be a canonical object containing only supported API fields with stable primitive values. Do not place event objects, functions, transient UI state, or untrimmed search input in a query key.

### 2.6 Migration order

1. `queryClient` setup in `app/query-client.js` (replace current empty placeholder), `QueryClientProvider` in `app/providers.jsx`.
2. Applications list.
3. Application detail.
4. Events.
5. Dashboard.

Each step replaces `refreshKey`, local `isLoading`, and local `fetchError` state in the corresponding page with `useQuery` status fields.

---

## 3. Design Tokens

All values live in `frontend/src/styles.css` as CSS custom properties. No new files, no CSS-in-JS.

### 3.1 Type scale

```
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 20px;
--font-size-xl: 28px;
--font-size-2xl: 36px;
```

### 3.2 Spacing scale

```
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

### 3.3 Color

- Existing primary accent is unchanged.
- Add one secondary accent (`--color-accent-secondary`), used only for deliberate emphasis (e.g. a highlighted stat on the dashboard), never as the sole indicator of state — must always be paired with text or an icon.
- Secondary accent must meet WCAG AA contrast (4.5:1) against its background.

### 3.4 Radius

`--radius-base: 8px` — unchanged, already consistent across the app.

---

## 4. Motion & Accessibility Rules

These rules are binding for every animation added in V3:

1. Respect `prefers-reduced-motion: reduce` — when set, disable non-essential motion (parallax, gradient animation, hover elevation transition); keep only instant state changes.
2. Parallax (auth page) is disabled on touch devices and under reduced-motion.
3. Continuous pointer-tracking effects (parallax) must update via CSS custom properties or `requestAnimationFrame`, never via `setState` on every `mousemove` event.
4. Allowed animated properties: `opacity`, `box-shadow`, `background-position`, `transform` (transform only for decorative elements, never for cards in dense lists — see §5.3).
5. No layout shift caused by animation.
6. Skeleton loaders must carry `aria-hidden="true"` on decorative skeleton nodes, plus a visually-hidden loading announcement for screen readers.
7. Route/page transitions are **fade-in on mount**, not crossfade — React Router unmounts the previous route immediately, so there is no previous element left to fade out. No shared-layout or animation-presence logic is required in V3.

These rules apply to all frontend motion introduced by V3, including auth pages, protected pages, loading states, and the new Settings page. They do not change backend behavior.

---

## 5. Frontend — Visual Work

### 5.1 Auth pages (Login/Register)

- Split-screen layout. Form on one side; a static-content panel on the other.
- Panel content: reuse real presentational components (`ApplicationCard`, `StatusBadge`, a dashboard summary block) fed with hardcoded sample data, clearly labeled "Sample data" in the UI.
  - **Guardrail:** if wiring a component into the preview panel requires modifying that component's production behavior (adding new required props, coupling it to router context it doesn't already need, etc.), stop and replace the panel with a static illustration instead. Do not fork or duplicate markup to fake a preview.
  - Preview must not trigger navigation or any mutation.
  - No real user data may appear in the panel before login.
- Background: CSS `@keyframes` animating `background-position` on a gradient. Duration ≥ 12s, ease, infinite loop.
- Parallax: pointer-tracked tilt on the illustration panel only, ±8px translation, via CSS variables updated through a throttled pointer handler. Disabled per §4.2–4.3.
- Login ↔ Register transition: fade-in on mount per §4.7.

### 5.2 In-app pages (Dashboard, Applications, Application Detail)

- Route fade-in on mount, 150–200ms, per §4.7.
- Card hover: `box-shadow` elevation only. No `transform: scale`.
- Replace `full-page-loader` with a skeleton matching each page's real layout (card skeleton for list/dashboard, detail skeleton for application detail).
- List filter/sort transition: `opacity` only, ≤200ms total, no reordering animation in V3.
- Shared identity with auth pages: same font-family, same primary accent, same `--radius-base`. Motion pacing may differ.

---

## 6. Backend — Password Reset

### 6.1 Flow

1. `POST /auth/forgot-password` with `{ email }`.
2. Server normalizes email (existing `normalizeEmail` — lowercase/trim).
3. If a user with that email exists: invalidate/delete any existing reset token(s) for that user, generate a new token, store its hash, send email via the email adapter (§6.6).
4. If no user exists: perform equivalent-cost work (see §6.4) and respond identically.
5. The user opens the reset link → the frontend reset-password page reads the token from the URL; there is no backend `GET` reset endpoint and the frontend does not call the API until submit.
6. `POST /auth/reset-password` with `{ token, newPassword }` → validate token, update password, increment `tokenVersion`, delete the token.

### 6.2 Token generation and storage

- Raw token: `crypto.randomBytes(32).toString('hex')`.
- Stored value: `crypto.createHash('sha256').update(rawToken).digest('hex')` — **SHA-256, not bcrypt**. The token is already high-entropy random data; bcrypt's slow hashing is unnecessary cost designed for low-entropy human passwords, not for this case.
- Comparison: hash the incoming token and compare with `crypto.timingSafeEqual` against the stored hash.
- Expiry: 30 minutes from creation.

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

Indexes:
- `{ userId: 1 }` — used to enforce "invalidate existing token before creating new one" at the service layer (see rule below).
- TTL index on `expiresAt` — **cleanup only, not an authorization mechanism.** The TTL background monitor runs periodically and does not guarantee immediate deletion at the exact expiry moment. `reset-password` must always check `expiresAt` against the current time directly in application logic; it must never rely on "the document still exists" as proof the token is unexpired.

Service-layer invariant: "at most one active token per user" is enforced by explicitly deleting/invalidating all existing tokens for a `userId` before inserting a new one — not by any index constraint. Deleting old tokens and inserting the replacement should use one transaction when the active deployment supports transactions. The reset flow must remain correct even while an expired token document is still waiting for TTL cleanup.

One-time-use concurrency rule: password reset must not use a non-atomic "find token, then later delete token" sequence. Inside one transaction, atomically claim the matching unexpired token (for example with `findOneAndDelete` using `tokenHash` and `expiresAt: { $gt: now }`), update the password hash, and increment `tokenVersion`. If any step fails, aborting the transaction must restore the token claim. This prevents two concurrent submissions from successfully using the same raw token. If transactions are unavailable, return `503` with `{ "error": "RESET_UNAVAILABLE" }`; do not fall back to a replay-prone sequence.

Logging rule: raw tokens and raw emails must never be written to application logs. Log the `userId` and event type only.

### 6.4 Rate limiting (scoped exception to "no global rate limiting")

`POST /auth/forgot-password` is rate-limited:

- Limit: 5 requests per 15 minutes, keyed by normalized email.
- Limit: 20 requests per hour, keyed by IP.
- On limit exceeded: `429`, generic error body, no indication of which key (email or IP) triggered the limit.
- The rate-limit policy is identical regardless of whether the email belongs to a real account — do not skip rate-limiting for the "email not found" branch.
- The "email exists" and "email does not exist" branches should perform comparable work (e.g. the non-existent-email branch still does a normalized lookup and a constant-time no-op) to avoid an obvious timing signal that reveals account existence. Exact timing parity is not required — the goal is to avoid a trivially observable difference, not to guarantee cryptographic timing safety.
- The chosen limiter must define trusted-proxy/IP behavior explicitly and must not trust arbitrary forwarded headers by default. If an in-memory limiter is used for the single-instance portfolio deployment, document that counters reset on restart and are not shared across instances; do not present it as distributed protection.

### 6.5 Response contract

Both branches (`POST /auth/forgot-password`) return the same shape and status on success:

```json
{ "message": "If an account with that email exists, a reset link has been sent." }
```

`POST /auth/reset-password` error cases:

| Condition | Status | Body |
|---|---|---|
| token missing/malformed | 400 | `{ "error": "INVALID_TOKEN" }` |
| token not found / already used | 400 | `{ "error": "INVALID_TOKEN" }` |
| token expired | 400 | `{ "error": "TOKEN_EXPIRED" }` |
| password fails policy (< 8 chars) | 400 | `{ "error": "WEAK_PASSWORD" }` |
| transaction support unavailable | 503 | `{ "error": "RESET_UNAVAILABLE" }` |
| success | 200 | `{ "message": "Password updated." }` |

`INVALID_TOKEN` and `TOKEN_EXPIRED` are distinguished server-side but both should be presented to the user as "this link is invalid or has expired" — no need for the frontend to branch on which one.

### 6.6 Email adapter

- Interface: `sendPasswordResetEmail({ to, resetUrl })`, implemented by a `backend/src/services/email/` module.
- Default implementation: Resend, called only from inside this adapter — never directly from `auth.controller.js` or `auth.service.js`.
- Test/local implementation: console-log transport (prints the reset URL instead of sending), selected via `EMAIL_PROVIDER=console`.
- The console transport is development-only. It must not be selectable in production, and tests must capture it without exposing the raw token in normal CI output.
- CI must not depend on a real Resend API call.
- Missing `RESEND_API_KEY` when `EMAIL_PROVIDER=resend` must fail fast at startup with a clear configuration error, not fail silently on first send attempt.
- A provider failure must never change the public response in a way that reveals whether the email exists. Record a sanitized operational error and ensure no usable token is left active when delivery fails.

### 6.7 `tokenVersion`

- New field on the `users` collection: `tokenVersion: number`, default `0` for new users. Existing users without the field are treated as `tokenVersion: 0` (chosen migration path — no forced logout on deploy).
- JWT payload includes `tokenVersion` whenever a session token is issued. Password reset itself does not issue a new JWT and does not automatically log the user in.
- `requireAuth` middleware: verify JWT signature, then load the user by id and compare `user.tokenVersion === payload.tokenVersion`. A mismatch is treated as an invalid session (401), same as an expired token.
- **Architectural trade-off, explicitly accepted:** this changes `requireAuth` from a stateless JWT-only check to a JWT-plus-database-lookup check on every protected request. This is an accepted cost for the security guarantee (reset invalidates all other sessions), not a "free" change — full protected-route regression testing is required after this lands (§9).
- On successful password reset: `$inc: { tokenVersion: 1 }` on the user document.
- A JWT whose payload omits `tokenVersion` is treated as version `0`. A non-numeric or negative payload version is invalid and returns `401`.
- Safe user response objects (`/auth/me`, login response) do not include `tokenVersion`.

### 6.8 Password policy

Reuses the existing register/login policy: minimum 8 characters, no additional complexity rules in V3.

---

## 7. Backend — Account Deletion

### 7.1 Endpoint

`DELETE /users/me` — requires auth, requires current password in the request body:

```json
{ "password": "string" }
```

- The target user is always the authenticated user from the verified token — the endpoint accepts no `userId` parameter.
- Incorrect password: `401`, `{ "error": "INVALID_PASSWORD" }`. Auth state is not cleared client-side on this response.
- Success: `200`, `{ "message": "Account deleted." }`. No deleted user document or counts are returned.
- Unexpected cascade/transaction failure: use the existing shared server-error contract. Do not reveal collection names, deletion counts, or transaction internals.

### 7.2 Cascade order

1. Delete `application_events` for all applications owned by the user.
2. Delete `applications` owned by the user.
3. Delete `passwordResetTokens` for the user.
4. Delete the `users` document.

### 7.3 Transaction implementation

- Obtain a `ClientSession` from the existing shared `MongoClient` instance.
- Every delete operation in the cascade receives `{ session }`.
- If any step fails, abort the transaction — no partial deletion is committed.
- If the current deployment/connection does not support transactions (e.g. a non-replica-set MongoDB instance), the endpoint must fail explicitly with `503`, `{ "error": "DELETE_UNAVAILABLE" }` — it must **not** silently fall back to a non-atomic cascade.
- MongoDB Atlas (including the M0 free tier) runs as a replica set and supports multi-document transactions. A local standalone MongoDB instance typically does not.
- Test environments: unit/integration tests either run against a replica-set-enabled MongoDB (e.g. `mongodb-memory-server` in replica-set mode) or mock the transaction boundary. Any E2E suite running against a standalone instance must report the account-deletion transaction test as **SKIPPED**, never as a false pass.

### 7.4 Race condition — known limitation (accepted for V3)

A request that creates an application/event for the user could interleave with an in-flight deletion transaction, since V3 does not introduce a `deleting` account status or a mutation-rejection check. This is an accepted, documented limitation for this scope:

- Not solved: a `deletionPending`/`accountStatus` state machine with recovery semantics is out of scope for V3 — it materially increases scope (failure/recovery handling if the cascade fails after the account is marked as deleting).
- Mitigated by: requiring password re-entry (adds friction/delay that makes accidental interleaving rare) and by running the cascade itself inside a single transaction (so within the transaction's own view, deletion is atomic).
- This must be stated in `docs/v3-spec.md` (this document) and in the architecture doc, not silently left undocumented.

### 7.5 Frontend behavior

- Danger-zone action lives on a **new Settings/Profile page** (`pages/SettingsPage/`) — this page does not currently exist and must be created as a new route.
- Confirmation modal → password field → submit is disabled while the request is in flight (no double-submit).
- On `401 INVALID_PASSWORD`: show inline error, keep the user authenticated.
- On success: clear local auth state, redirect to Login. Local state is only cleared after a successful `200` response, never optimistically before the request completes.

---

## 8. New Frontend Routes/Screens Introduced in V3

| Route | Purpose |
|---|---|
| `/forgot-password` | Request a reset link (email form) |
| `/reset-password?token=...` | Set a new password using the token from the email link |
| `/settings` | Account settings; contains the delete-account danger zone |

---

## 9. Environment Variables (new in V3)

| Variable | Purpose |
|---|---|
| `EMAIL_PROVIDER` | `resend` \| `console` — selects the email adapter implementation |
| `RESEND_API_KEY` | Required when `EMAIL_PROVIDER=resend` |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Default `30` |
| `RESET_REQUEST_RATE_LIMIT_PER_EMAIL` | Default `5` per 15 minutes |
| `RESET_REQUEST_RATE_LIMIT_PER_IP` | Default `20` per hour |

The rate-limit windows must also be configurable or be represented by clearly named constants validated at startup; do not encode ambiguous values such as `5` and `20` without their associated window semantics.

---

## 10. Verification / QA Checklist for V3

- [ ] Applications list, detail, events, dashboard all read/write through React Query; `refreshKey` pattern removed from all four pages.
- [ ] Mutation on an application updates the dashboard summary without a manual page refresh.
- [ ] `prefers-reduced-motion: reduce` disables gradient animation, parallax, and hover elevation transitions on the auth page.
- [ ] Parallax is inactive on a touch-device viewport.
- [ ] Requesting a second password reset invalidates the first token (first token no longer works after the second request).
- [ ] A reset link is unusable after its password has been successfully changed once.
- [ ] Forgot-password returns the same HTTP status and public JSON body for an existing and a non-existing email; neither branch exposes account existence. Rate-limited requests may return the separately documented `429` contract.
- [ ] Two concurrent submissions using the same reset token cannot both succeed.
- [ ] 6th forgot-password request within 15 minutes for the same email returns `429`.
- [ ] JWT issued before a password reset is rejected (401) on any protected route after the reset completes.
- [ ] Account deletion removes all applications and events for that user (verified by direct DB query in test).
- [ ] Account deletion with wrong password does not delete any data and does not clear the client session.
- [ ] Account-deletion transaction test is explicitly marked SKIPPED in CI if run against a non-replica-set MongoDB instance, not marked as passing.
- [ ] `/settings` page exists and is reachable only when authenticated.
