# ApplyFlow V3 Baseline Audit

## 1. Audit Metadata and Verdict

| Field | Recorded value |
|---|---|
| Audit date | 2026-07-19 (Asia/Saigon) |
| Task | V3-01 - Audit V2 Completion and V3 Implementation Baseline |
| Branch | `codex/v3-01-baseline-audit` |
| Baseline commit | `7980b08` (`main` and `origin/main` at branch creation) |
| Required workflow-preparation merge | `206ede9f11954a33b41148bdd9dfc7e8415e8123` - present in baseline history |
| V2 release merge | `a97fc24` (tag `v2.0.0`) - present in baseline history |
| Verdict | **BASELINE VERIFIED FOR V3 IMPLEMENTATION** |

The repository matches the structural assumptions needed to begin V3. This task did not implement a V3 feature or change an application source file, dependency manifest, or lockfile.

This audit distinguishes four evidence classes:

- **Current source inspection** describes code and configuration at baseline commit `7980b08`.
- **Current local automation** describes commands executed on this branch during V3-01.
- **Historical evidence** is explicitly attributed to the completed V2 audit and is not presented as a new V3 runtime result.
- **SKIPPED runtime evidence** was not executed and must not be inferred from source inspection or a successful build.

## 2. Preflight and Repository State

At branch creation:

- `git status --short --branch` showed `## main...origin/main` with no changed or untracked files.
- `git rev-list --left-right --count main...origin/main` returned `0 0`.
- `git merge-base --is-ancestor 206ede9f11954a33b41148bdd9dfc7e8415e8123 HEAD` succeeded.
- The V2 final merge and `v2.0.0` tag were present in history.
- Active skill discovery contained only `.codex/skills/applyflow-v3-executor/SKILL.md`.
- The task branch was created from `7980b08`, the shared `main`/`origin/main` tip.

No unexplained dirty or untracked files were found before the audit file was created. The frontend build generated only ignored output under `frontend/dist`.

## 3. Runtime, Package, and Toolchain Versions

The repository has no `.nvmrc`, `.node-version`, Volta configuration, or root package manifest that pins a single Node.js/npm version. The CI workflow is therefore the repository source for CI Node major versions; local commands establish only the audit machine's runtime.

| Area | Manifest version/range | Lockfile-resolved version | Evidence |
|---|---|---|---|
| Backend application | `0.1.0` | n/a | `backend/package.json` |
| `bcrypt` | `^6.0.0` | `6.0.0` | backend manifest and lockfile v3 |
| `dotenv` | `^16.4.7` | `16.6.1` | backend manifest and lockfile v3 |
| `express` | `^4.21.2` | `4.22.2` | backend manifest and lockfile v3 |
| `jsonwebtoken` | `^9.0.3` | `9.0.3` | backend manifest and lockfile v3 |
| `mongodb` | `^6.12.0` | `6.21.0` | backend manifest and lockfile v3 |
| Frontend application | `0.1.0` | n/a | `frontend/package.json` |
| `react` | `^19.2.7` | `19.2.7` | frontend manifest and lockfile v3 |
| `react-dom` | `^19.2.7` | `19.2.7` | frontend manifest and lockfile v3 |
| `react-router-dom` | `^7.18.1` | `7.18.1` | frontend manifest and lockfile v3 |
| `vite` | `^8.1.3` | `8.1.3` | frontend manifest and lockfile v3 |
| `@vitejs/plugin-react` | `^6.0.3` | `6.0.3` | frontend manifest and lockfile v3 |

`@tanstack/react-query` and Resend are not present in the current manifests or lockfiles.

The local audit runtime was Node.js `v20.20.2` and npm `10.8.2`. `.github/workflows/ci.yml` uses Node.js 22 for backend checks and Node.js 20 for the frontend build.

## 4. Current Frontend Baseline

### 4.1 Providers, Query Placeholder, and Auth State

- `frontend/src/app/query-client.js` is a placeholder that exports an empty object.
- `frontend/src/app/providers.jsx` wraps the app only in the existing `AuthProvider`; there is no `QueryClientProvider`.
- No `QueryClient`, `useQuery`, or `useMutation` implementation exists in active frontend source.
- `frontend/src/features/auth/auth.store.js` owns authentication bootstrap, token/user persistence, login, registration, logout, and the authenticated-`401` listener. V3 must keep this client/auth state in the Auth provider.
- `frontend/src/api/http-client.js` owns URL construction, bearer-token attachment, JSON parsing, shared `ApiError`, V2-compatible error detail extraction, and authenticated-`401` notification.

The development proxy in `frontend/vite.config.js` rewrites `/api/*` to the backend root and proxies `/auth` without rewriting it. With no `VITE_API_BASE_URL`, `http-client.js` prefixes `/applications` and `/dashboard` with `/api`; auth requests stay under `/auth`.

### 4.2 Current API Functions

| Module | Current exports relevant to V3 |
|---|---|
| `frontend/src/api/auth.api.js` | `register`, `login`, `getCurrentUser` |
| `frontend/src/api/application.api.js` | `getApplications`, `createApplication`, `getApplication`, `updateApplication`, `deleteApplication`, response mappers |
| `frontend/src/api/event.api.js` | `getApplicationEvents`, `createApplicationEvent`, `updateApplicationEvent`, `deleteApplicationEvent`, response mappers |
| `frontend/src/api/dashboard.api.js` | `getDashboardSummary`, `getDashboardSummaryFromResponse` |
| `frontend/src/api/http-client.js` | `httpRequest`, `ApiError`, `subscribeToUnauthorizedResponse` |

The dashboard response mapper preserves the V2 field name `countsByStatus` and supplies defaults for total, recent applications, upcoming events, and attention flags.

### 4.3 Manual Server-State Patterns

- `frontend/src/pages/ApplicationsPage/ApplicationsPage.jsx` owns `applications`, `isLoading`, `fetchError`, and `refreshKey`. Create and update increment `refreshKey`; delete filters local state.
- `frontend/src/pages/ApplicationDetailPage/ApplicationDetailPage.jsx` separately owns application and event data, loading/error state, request-id refs, and `loadApplication`/`loadEvents`. Event create/update/delete call `loadEvents` again.
- `frontend/src/pages/DashboardPage/DashboardPage.jsx` owns summary data, loading/error state, request refs, and `loadDashboardSummary`.

These are the duplicated server-state paths V3-03 through V3-07 will migrate. The existing form-open, confirmation, pending-action, and validation state remains local UI state and is not a Query migration target.

### 4.4 Routes, Navigation, Styles, and Reusable Components

Current page routes are:

- `/` redirects to `/dashboard`;
- public-only `/login` and `/register`;
- protected `/dashboard`, `/applications`, and `/applications/:applicationId` under `AppLayout`;
- wildcard not-found route.

There is no `/forgot-password`, `/reset-password`, or `/settings` route. `AppLayout` navigation contains only Dashboard and Applications.

`frontend/src/styles.css` is the active global token/style source. Its `:root` defines color and shadow variables, including `--color-primary`, but no V3 type scale, spacing scale, secondary accent, or radius token. Existing radii and spacing are largely literal values. Current loading presentation includes `.full-page-loader` and `.applications-state-loading`; no reusable skeleton system or reduced-motion rule was found. Dashboard-specific styles live in `frontend/src/pages/DashboardPage/DashboardPage.css`.

Reusable visual/preview touchpoints include:

- `ApplicationCard`, `ApplicationList`, `ApplicationOverview`, and `StatusBadge`;
- `DashboardSummaryCards`, `StatusCountGrid`, `RecentApplicationsPanel`, `UpcomingEventsPanel`, and `AttentionFlagsPanel`;
- `EventItem` and `EventTimeline`;
- `ApplicationForm` and `EventForm` for existing validation/error patterns;
- `LoginPage`, `RegisterPage`, `AppLayout`, and `AuthRoutes` for V3 auth and protected-shell work.

## 5. Current Backend Baseline

### 5.1 Routes and Architecture

`backend/src/routes/index.js` exposes `/health` and mounts `/auth`, `/applications`, nested application events, and `/dashboard`. Auth currently provides only:

- `POST /auth/register`;
- `POST /auth/login`;
- `GET /auth/me` protected by `requireAuth`.

There are no forgot-password, reset-password, or `/users/me` deletion routes. Existing modules follow the route -> middleware -> controller -> service -> repository -> MongoDB boundary required by V3.

### 5.2 JWT and Authentication Behavior

`backend/src/modules/auth/auth.service.js` signs a one-day JWT whose custom payload contains only:

```js
{
  sub: user._id.toString(),
}
```

`backend/src/middlewares/auth.middleware.js` extracts a Bearer token, verifies its signature/expiry, requires `payload.sub`, and assigns `req.user = { id: payload.sub }`. It does not load the user for each protected request and does not compare a `tokenVersion`. Missing, malformed, invalid, and expired tokens become the existing unauthorized errors.

Registration stores `displayName`, normalized email, `passwordHash`, `createdAt`, and `updatedAt`; current user documents have no `tokenVersion`. The safe-user mapper excludes password hashes and returns identity/profile timestamps.

### 5.3 Collections, Mongo Client, and Session Access

`backend/src/db/collections.js` defines these existing collection names:

| Domain | Collection |
|---|---|
| Users | `users` |
| Applications | `applications` |
| Application events | `application_events` |

There is no `passwordResetTokens` collection yet.

`backend/src/config/mongodb.js` keeps module-private `client` and `db` values. It exports `connectToMongo`, `getDb`, and `closeMongoConnection`. It does not expose the connected `MongoClient`, a `startSession` helper, or another transaction entry point. Current application/event repositories do not accept session options. V3-10 and V3-12 therefore have explicit transaction plumbing touchpoints while controllers must remain session-free.

### 5.4 Environment Validation and Checks

`backend/src/config/env.js` loads a root `.env` followed by `backend/.env` without overriding values. It requires `PORT`, `MONGODB_URI`, `MONGODB_DB_NAME`, and `JWT_SECRET`, validates a positive integer port, and exports only the corresponding runtime configuration plus `NODE_ENV` defaulting to `development`. No secret values were printed or inspected.

The current backend scripts are:

- `check:attention` -> `scripts/check-attention-domain.js`;
- `check:backend-hardening` -> `scripts/check-backend-hardening.js`;
- `check:e2e` -> `scripts/check-backend-e2e.js`.

The frontend scripts are `dev`, `build`, and `preview`. Current CI installs from each lockfile, runs the two safe backend checks, and builds the frontend. CI does not run MongoDB-backed E2E, browser QA, or replica-set transaction tests.

## 6. Later V3 Task Touchpoint Matrix

| Task | Confirmed baseline touchpoints and uncertainty |
|---|---|
| V3-02 | Expand `frontend/src/styles.css` tokens and apply them within the task boundary; inspect `DashboardPage.css` and existing auth/app shell/component styles. No required V3 type, spacing, radius, or secondary-accent tokens exist yet. |
| V3-03 | Install the owned Query dependency; replace `query-client.js` placeholder; add the provider in `providers.jsx`; define query keys/functions while preserving API ownership and AuthProvider behavior. |
| V3-04 | Migrate ApplicationsPage list reads and application mutations from manual state/`refreshKey`; preserve filters, V2 response mapping, UI states, and action behavior. |
| V3-05 | Migrate ApplicationDetailPage application read/update/delete state; preserve controlled 400/404 unavailable behavior and post-delete navigation. |
| V3-06 | Migrate nested event reads/mutations currently refreshed through `loadEvents`; preserve timeline order, parent ownership, and event form/action states. |
| V3-07 | Migrate DashboardPage summary loading and retry; retain `countsByStatus` and audit invalidation from application/event mutations. |
| V3-08 | Add user `tokenVersion`, include it in issued JWTs, and make `requireAuth` validate it against current user data without weakening existing auth errors. This is a human-approval hard gate. |
| V3-09 | Add forgot-password route/service/repository/validator work, the `passwordResetTokens` collection, scoped rate limits, email adapter, and new environment validation. No implementation or provider dependency exists. This is a human-approval hard gate. |
| V3-10 | Add reset-password token consumption and transaction/session plumbing through service/repository layers. Real replica-set and concurrency capability is not established by this audit. This is a human-approval hard gate. |
| V3-11 | Add forgot/reset API calls, public routes/pages, and login entry point while reusing V2 form/error conventions. |
| V3-12 | Add authenticated `/users/me` deletion, service-owned transaction orchestration, repository session support, and cascade across the four V3 collections. Real replica-set capability remains an explicit uncertainty. This is a human-approval hard gate. |
| V3-13 | Add Settings route/navigation/delete-confirmation flow and clear Auth plus Query private cache after success. No settings UI exists. This is a human-approval hard gate. |
| V3-14 | Redesign Login/Register presentation using existing pages, shared identity, form behavior, and plain CSS; add no new framework. |
| V3-15 | Replace in-app text loading states with scoped skeletons and add restrained CSS interaction/motion with reduced-motion handling. Auth bootstrap can retain the full-page loader per the V3 boundary. |
| V3-16 | Extend backend checks/E2E and frontend regression coverage for Query, reset, deletion, security, transaction, browser, and large-dataset behavior. Existing CI covers only safe checks/build. |
| V3-17 | Update README and architecture/setup/security documentation after implementation; current architecture docs remain the pre-V3 baseline. |
| V3-18 | Re-run final V3 regression and record release evidence after V3-01 through V3-17 merge in order. This audit is not final release evidence. V3-18 is a human-approval hard gate. |

## 7. Verification Evidence

### Current Local Automation

| Command | Result | Evidence |
|---|---|---|
| `git status --short --branch` | PASS | Clean task branch before audit creation; only this audit file is expected afterward. |
| `git log --oneline --decorate -n 20` | PASS | V2 final and required workflow-preparation merges are present; task branch starts at `7980b08`. |
| `cd backend; npm run check:attention` | PASS | `Attention domain checks passed.` |
| `cd backend; npm run check:backend-hardening` | PASS | `Backend hardening checks passed.` |
| `cd frontend; npm run build` | PASS | Vite `8.1.3` transformed 62 modules and produced a production build. |

### Historical V2 Evidence

`docs/v2-final-regression.md` records a V2 verdict of `READY WITH KNOWN RISKS`, passing focused backend checks, live HTTP/database E2E, frontend build, final critical-path browser smoke, and successful then-current CI. Those results establish the completed V2 baseline at its recorded commits; they are not rerun V3-01 runtime evidence.

### Skipped in V3-01

| Evidence class | Result | Exact reason |
|---|---|---|
| HTTP/database E2E | SKIPPED | V3-01 permits only safe existing checks and does not change runtime behavior; no backend/database test environment was started for this source audit. |
| Browser/manual QA | SKIPPED | No application behavior or UI changed, and no browser session was started. A production build is not browser evidence. |
| Real replica-set transaction | SKIPPED | No transaction code exists yet and replica-set capability was not tested. |
| Mocked transaction | SKIPPED | No transaction code or task-owned mock check exists yet. |
| Resend delivery | SKIPPED | No email adapter/provider implementation or credential is part of V3-01. |
| Current PR GitHub CI | SKIPPED pending PR | Remote CI can only be classified after this task branch is pushed and its PR checks complete. |

## 8. Risks and Required Preservation

- Later Query migrations must preserve V2 loading, empty, filtered-empty, validation, error, not-found, search/filter/sort, and cross-user behavior while removing only server-state duplication.
- Token-version, password-reset, and account-deletion tasks change security-critical behavior and require their task-specific evidence plus explicit approval.
- Transaction support must be proven against a real MongoDB replica set; source inspection or mocks cannot establish that result.
- Current CI is a useful regression gate but is not independent evidence for browser cache clearing, concurrent token use, transaction rollback, or real email delivery.
- Existing route paths, API/error shapes, collection names, `countsByStatus`, auth provider ownership, and user-scoped privacy behavior remain preserved unless a V3 task explicitly changes them.

No factual mismatch was found that requires changing `docs/v3-spec.md` or `docs/v3-tasks.md`.
