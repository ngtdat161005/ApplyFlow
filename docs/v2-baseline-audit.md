# ApplyFlow V2 Baseline Audit

## 1. Audit Metadata

- Branch name: `codex/v2-01-audit-v1-baseline`
- Audit date/time: `2026-07-10 13:26:11 +07:00`
- Documents reviewed:
  - `AGENTS.md`
  - `.codex/skills/applyflow-qa-reviewer/SKILL.md`
  - `.codex/skills/applyflow-test-designer/SKILL.md`
  - `docs/v2-spec.md`
  - `docs/v2-tasks.md`
  - `docs/ApplyFlow Specification.md`
  - `docs/ApplyFlow Architecture.md`
  - `docs/test-plan.md`
  - `docs/regression-checklist.md`
  - `docs/codex-workflow.md`
  - `frontend/docs/manual-frontend-testcases.md`
  - `README.md` for setup accuracy audit only
  - `.github/workflows/ci.yml`
  - `.github/pull_request_template.md`
  - `backend/package.json`
  - `frontend/package.json`
- Source areas inspected:
  - Backend routes, middleware, domain utilities, auth/application/event/dashboard modules, mappers, validators, repositories, check scripts.
  - Frontend router, auth store/routes, API clients, auth pages, applications page/components, application detail page, event timeline/components, dashboard page/components, storage utilities, error utilities.
- Commands run:
  - `git status --short --branch`
  - `git diff --stat`
  - `npm run check:attention` from `backend`
  - `npm run check:backend-hardening` from `backend`
  - `npm run build` from `frontend`
- Environment limitations:
  - Browser/manual UI tests were not run, so visual and browser behavior is not claimed as manually verified.
  - `npm run check:e2e` was skipped because it requires a running backend connected to MongoDB; that environment was not started for this documentation-only audit.
  - GitHub Actions workflow configuration was inspected, but no remote CI run result was checked.

## 2. Overall Verdict

V1 BASELINE PARTIALLY VERIFIED

The current repository contains substantial V1 implementation evidence for backend auth, application CRUD, event CRUD, cascade delete, dashboard computation, attention rules, frontend routes, frontend state handling, manual test documentation, and CI configuration. The safe local checks passed. However, full runtime behavior is only partially verified because backend HTTP E2E and browser/manual frontend regression were not run. Several V2-sensitive risks remain: dashboard count naming differs from the V2 spec wording, `followUpAt` sorting is not implemented, CI does not run E2E, and frontend behavior needs manual browser confirmation.

## 3. Capability Matrix

| Area | Capability | Status | Evidence | Risk / Note |
|---|---|---|---|---|
| Authentication | register | Implemented | `backend/src/routes/auth.route.js` defines `POST /auth/register`; `backend/src/modules/auth/auth.service.js` hashes passwords and creates users; `backend/src/modules/auth/auth.controller.js` returns `201` with safe user. | Runtime path not HTTP-E2E verified in this audit. |
| Authentication | login | Implemented | `POST /auth/login` route, `loginUser` compares bcrypt hash and returns JWT plus safe user. | Runtime path not HTTP-E2E verified in this audit. |
| Authentication | get current user | Implemented | `GET /auth/me` uses `requireAuth`; `getCurrentUser` maps user through safe mapper. | Runtime path not HTTP-E2E verified in this audit. |
| Authentication | frontend logout by clearing local token/auth state | Implemented | `frontend/src/features/auth/auth.store.js` `logout` calls `clearSession`; `frontend/src/utils/storage.utils.js` removes `applyflow.accessToken`. | Browser behavior not manually verified. |
| Authentication | protected routes | Implemented | `frontend/src/app/router.jsx` wraps app routes in `ProtectedRoute`; `AuthRoutes.jsx` redirects unauthenticated users to `/login`. | Browser redirect behavior not manually verified. |
| Authentication | token persistence | Implemented | Auth store initializes from `getStoredAccessToken`; `persistSession` writes token to localStorage. | LocalStorage behavior not manually verified in browser. |
| Authentication | password hash not exposed | Implemented | `auth.mapper.js` returns `_id`, `displayName`, `email`, timestamps only; `registerUser` and `loginUser` return mapped user. | Supported by source inspection. |
| Authentication | login/register loading and error states | Implemented | `LoginPage.jsx` and `RegisterPage.jsx` use `isSubmitting`, field errors, form errors, and disabled controls. | Visual quality not manually verified. |
| Application Management | create application | Implemented | `application.route.js` `POST /`; service creates user-scoped document; controller returns application. | Runtime path not HTTP-E2E verified in this audit. |
| Application Management | list applications | Implemented | `GET /applications`; repository queries by `userId`; frontend `ApplicationsPage.jsx` loads list. | Runtime path not HTTP-E2E verified in this audit. |
| Application Management | search by company/role | Implemented | `application.repository.js` builds case-insensitive regex `$or` for `company` and `role`; frontend filter has search input. | Needs E2E/manual data verification. |
| Application Management | filter by currentStatus | Implemented | `validateListApplicationsQuery` validates `status`; repository adds `currentStatus`; frontend status select is present. | Needs E2E/manual data verification. |
| Application Management | sort by createdAt/updatedAt | Implemented | `APPLICATION_SORT_FIELDS` includes `createdAt`, `updatedAt`; repository sorts by chosen field and `_id`; frontend exposes both. | Needs E2E/manual ordering verification. |
| Application Management | followUpAt sorting if currently present | Missing | `APPLICATION_SORT_FIELDS` excludes `followUpAt`; frontend `ApplicationFilters.jsx` exposes only `updatedAt` and `createdAt`. | This is a V2 polish candidate, not V1 baseline. |
| Application Management | detail page/API | Implemented | `GET /applications/:applicationId`; `ApplicationDetailPage.jsx` loads detail and events separately. | Browser refresh/not-found behavior not manually verified. |
| Application Management | update application | Implemented | `PATCH /applications/:applicationId`; service scopes update by user and id; frontend has edit forms. | Runtime path not HTTP-E2E verified in this audit. |
| Application Management | delete application | Implemented | `DELETE /applications/:applicationId`; frontend list/detail delete flows are present. | Runtime path not HTTP-E2E verified in this audit. |
| Application Management | forbidden update fields | Implemented | `validateUpdateApplicationPayload` allows only `company`, `role`, `jdUrl`, `source`, `notes`, `currentStatus`, `followUpAt`; unknown fields produce validation error. | Supported by source inspection. |
| Application Management | nullable optional fields | Implemented | Application validator normalizes optional `jdUrl`, `source`, `notes`, `followUpAt` to null where applicable; mapper emits null defaults. | Supported by source inspection. |
| Application Management | validation errors | Implemented | Validators return `errors`; `validate.middleware.js` throws `ValidationError`; `error.middleware.js` returns `{ message, errors }`; hardening check passed. | Full endpoint matrix not E2E verified. |
| Application Management | malformed ObjectId behavior | Implemented | Param validators reject malformed ids; service fallback uses `toObjectId`; hardening script checks malformed ids. | Exact route coverage partly from source plus script. |
| Application Management | nonexistent valid ObjectId behavior | Implemented | Service throws `NotFoundError` when scoped repository lookup returns null. | Not HTTP-E2E verified in this audit. |
| Application Management | cross-user application access | Implemented | Repository lookups include `_id` and `userId`; cross-user valid ids resolve as not found. | E2E script covers this when run, but it was not run here. |
| Application Management | user scoping | Implemented | Application repository filters include `userId`; service converts authenticated user id to ObjectId. | Supported by source inspection. |
| Recruitment Event Tracking | create event | Implemented | Nested `POST /applications/:applicationId/events`; service checks parent ownership before insert. | Runtime path not HTTP-E2E verified in this audit. |
| Recruitment Event Tracking | list events for application | Implemented | Nested `GET /applications/:applicationId/events`; repository filters by `userId` and `applicationId`. | Runtime path not HTTP-E2E verified in this audit. |
| Recruitment Event Tracking | update event | Implemented | Nested `PATCH /applications/:applicationId/events/:eventId`; repository filters by event id, user id, and application id. | Runtime path not HTTP-E2E verified in this audit. |
| Recruitment Event Tracking | delete event | Implemented | Nested `DELETE /applications/:applicationId/events/:eventId`; repository filters by event id, user id, and application id. | Runtime path not HTTP-E2E verified in this audit. |
| Recruitment Event Tracking | event type values | Implemented | `EVENT_TYPES` includes `applied`, `hr_call`, `oa`, `interview`, `follow_up`, `offer`, `rejected`, `note`; frontend constants match. | Supported by source inspection. |
| Recruitment Event Tracking | mode values | Implemented | `EVENT_MODES` includes `online`, `offline`, `phone`; frontend event mode constants match. | Supported by source inspection. |
| Recruitment Event Tracking | event ownership | Implemented | Event documents store `userId`; repository filters use `userId`; service derives user id from auth. | Supported by source inspection. |
| Recruitment Event Tracking | parent application ownership check | Implemented | `event.service.js` calls `assertUserOwnsApplication` before create/list/update/delete. | Supported by source inspection. |
| Recruitment Event Tracking | nested route mismatch protection | Implemented | Update/delete repository filters include `_id`, `userId`, and `applicationId`; wrong parent id should not match event. | Not HTTP-E2E verified in this audit. |
| Recruitment Event Tracking | malformed applicationId behavior | Implemented | Event param validators validate application id; service fallback throws `BadRequestError`. | Hardening script checks malformed application id in service path. |
| Recruitment Event Tracking | malformed eventId behavior | Implemented | Event detail param validator validates event id; service fallback throws `BadRequestError`; hardening script checks event id fallback. | Supported by source plus script. |
| Recruitment Event Tracking | timeline ordering | Implemented | `event.repository.js` calls `sortTimelineEvents`; timeline utility orders by effective date, then createdAt, then id. | Browser display ordering not manually verified. |
| Recruitment Event Tracking | validation behavior | Implemented | `event.validator.js` validates types, title, optional dates, mode, optional strings, and contact email. | Full endpoint matrix not E2E verified. |
| Cascade Delete | deleting an application deletes child events | Implemented | `application.service.js` calls `deleteEventsByApplicationForUser` before deleting application. | Runtime cascade not E2E verified in this audit. |
| Cascade Delete | cascade delete is user-scoped | Implemented | `deleteEventsByApplicationForUser` filters by `userId` and `applicationId`. | Supported by source inspection. |
| Cascade Delete | no cross-user event deletion risk | Implemented | Application delete first requires scoped application lookup; event deleteMany is also scoped by user and application. | Supported by source inspection. |
| Dashboard | total application count | Implemented | `dashboard.service.js` computes `totalApplications` from user applications. | Runtime result not E2E verified here. |
| Dashboard | status counts | Partially implemented | Backend returns `countsByStatus`; V2 spec dashboard contract names `statusCounts`; frontend consumes `countsByStatus`. | Contract naming should be resolved in V2-02/V2-12. |
| Dashboard | upcoming events | Implemented | `computeUpcomingEvents` returns scheduled events within threshold; dashboard service returns `upcomingEvents`; frontend renders panel. | Runtime result not E2E/browser verified here. |
| Dashboard | attention-needed applications | Implemented | `computeAttentionFlags` generates flags; dashboard returns `attentionFlags`; frontend renders messages. | Runtime result not E2E/browser verified here. |
| Dashboard | recentApplications if currently implemented | Implemented | `dashboard.service.js` returns five most recent applications; frontend renders `RecentApplicationsPanel`. | This is present but V2 spec treats it as polish, not guaranteed V1 baseline. |
| Dashboard | user scoping | Implemented | Dashboard service fetches applications and events by authenticated `userId`. | Runtime cross-user dashboard not E2E verified here. |
| Dashboard | empty dashboard behavior | Partially implemented | Frontend has empty arrays and empty states in panels; backend count defaults exist. | Browser empty dashboard not manually verified. |
| Dashboard | frontend dashboard display | Partially implemented | Dashboard page renders loading, error, summary, status grid, recent, upcoming, attention panels. | Visual/browser behavior not manually verified. |
| Dashboard | frontend does not duplicate backend attention logic | Implemented | Frontend dashboard only maps labels and renders backend `attentionFlags`; no local attention rule computation found. | Supported by source inspection. |
| Attention Logic | NO_RESPONSE_AFTER_APPLY | Implemented | `attention.rules.js` implements rule; `check-attention-domain.js` passed. | Covered by local script. |
| Attention Logic | NO_RESPONSE_AFTER_INTERVIEW | Implemented | `attention.rules.js` implements rule; `check-attention-domain.js` passed. | Covered by local script. |
| Attention Logic | FOLLOW_UP_OVERDUE | Implemented | `evaluateFollowUpOverdue` checks eligible statuses and date; local attention check passed. | Covered by local script. |
| Attention Logic | UPCOMING_EVENT/upcomingEvents separation | Implemented | Upcoming events are returned by `computeUpcomingEvents`; `ATTENTION_FLAG_TYPES` excludes `UPCOMING_EVENT`. | Matches V2 direction. |
| Attention Logic | status gating | Implemented | Attention types define silence, follow-up, and upcoming eligible statuses; rules call status helpers. | Covered by local script for key statuses. |
| Attention Logic | thresholds | Implemented | `ATTENTION_THRESHOLDS` defines 14, 7, and 3 day thresholds. | Covered by local script for attention examples. |
| Attention Logic | effective date behavior if visible in code | Implemented | Attention uses occurredAt then scheduledAt and excludes createdAt; timeline display can include createdAt. | Supported by `attention.utils.js` and `timeline.utils.js`. |
| Attention Logic | whether frontend duplicates backend attention logic | Implemented | Frontend dashboard constants only label flag types; no threshold or rule calculation found. | Supported by source inspection. |
| Backend Contract | route paths | Implemented | `routes/index.js` mounts `/auth`, `/applications`, nested `/applications/:applicationId/events`, `/dashboard`, and `/health`. | Base prefix is app-level dependent; inspected routes are unprefixed. |
| Backend Contract | response shape preservation | Partially implemented | Controllers return `{ success, ... }`; frontend API clients accept several shapes. Dashboard uses `countsByStatus`, not V2 `statusCounts`. | Needs V2-02/V2-12 contract decision. |
| Backend Contract | error response shape | Implemented | `error.middleware.js` returns `{ message }` and optional `{ errors }`; hardening check passed. | 500 in development includes stack by design. |
| Backend Contract | validation error shape | Implemented | `ValidationError` message is `Validation failed`; middleware includes `errors`; hardening check passed. | Supported by script and source. |
| Backend Contract | malformed ObjectId behavior | Implemented | Param validators plus `toObjectId` fallback; hardening check passed. | Full HTTP route matrix not E2E verified. |
| Backend Contract | missing/invalid token behavior | Implemented | `requireAuth` throws `UnauthorizedError` for missing, invalid, expired, or malformed bearer token. | HTTP behavior not E2E verified here. |
| Backend Contract | valid ObjectId not found behavior | Implemented | Application/event services throw `NotFoundError` for missing scoped records. | HTTP behavior not E2E verified here. |
| Backend Contract | cross-user private resource behavior | Implemented | Scoped repository filters return null and services throw not found. | HTTP behavior not E2E verified here. |
| Backend Contract | centralized error middleware | Implemented | `app.js` uses `notFoundHandler` and `errorMiddleware`; middleware file centralizes error JSON. | Supported by source inspection. |
| Backend Contract | controller/service/repository separation | Implemented | Auth, application, event modules each have route/controller/service/repository/validator/mapper; dashboard has controller/service/mapper and composes repositories. | Structure fits architecture. |
| Frontend State Handling | loading states | Implemented | Auth routes, applications list, detail, events, and dashboard all have loading states in source. | Browser behavior not manually verified. |
| Frontend State Handling | empty states | Implemented | Applications list, event timeline, dashboard panels render empty states. | Browser behavior not manually verified. |
| Frontend State Handling | filtered empty states | Implemented | Applications page changes empty message when filters/search are active. | Browser behavior not manually verified. |
| Frontend State Handling | error states | Implemented | Applications, detail/events, dashboard, auth and forms render errors and retry where applicable. | Browser behavior not manually verified. |
| Frontend State Handling | validation errors | Implemented | Auth/application/event forms map API `errors` to field errors and have client-side required checks. | Browser behavior not manually verified. |
| Frontend State Handling | unauthorized/redirect behavior | Implemented | HTTP client sends bearer token; protected route redirects unauthenticated users. | Token expiry/401 redirect after API failure is not globally handled. |
| Frontend State Handling | refresh behavior | Partially implemented | Detail page loads by URL param; list/detail have retry or reload functions. | Actual browser refresh behavior not manually verified. |
| Frontend State Handling | delete/update navigation | Implemented | Detail delete navigates to `/applications`; list delete removes item; update refreshes data. | Browser behavior not manually verified. |
| Frontend State Handling | form input preservation after validation errors where visible | Implemented | Forms keep `formValues` in state and set errors without clearing on failure. | Browser behavior not manually verified. |
| QA / Tooling | backend check scripts | Implemented | `backend/package.json` has `check:attention` and `check:backend-hardening`; both passed locally. | Good local evidence. |
| QA / Tooling | backend E2E/smoke scripts | Partially implemented | `backend/package.json` has `check:e2e`; script covers auth, applications, events, dashboard, cascade. | Skipped here because backend/database were not running. |
| QA / Tooling | frontend build | Implemented | `frontend/package.json` has `build`; `npm run build` passed locally. | Good local evidence. |
| QA / Tooling | manual frontend testcase docs | Implemented | `frontend/docs/manual-frontend-testcases.md` covers auth, dashboard, applications, detail, events, validation, cascade, visual checks. | Execution not performed here. |
| QA / Tooling | regression checklist | Implemented | `docs/regression-checklist.md` exists and covers auth, applications, events, dashboard, access control, frontend UX. | Checklist is broad but not case-table format yet. |
| QA / Tooling | GitHub Actions CI | Implemented | `.github/workflows/ci.yml` runs backend attention/hardening and frontend build on PR/push to main. | Remote CI status not inspected; E2E not in CI. |
| QA / Tooling | PR template | Implemented | `.github/pull_request_template.md` includes summary, task link, QA evidence, risk, source scope. | Supported by source inspection. |
| QA / Tooling | Codex workflow docs | Implemented | `docs/codex-workflow.md` documents task branch, checks, audit, commit loop. | Supported by doc inspection. |
| QA / Tooling | repo-local Codex skills | Implemented | `.codex/skills/applyflow-qa-reviewer/SKILL.md` and `applyflow-test-designer/SKILL.md` exist. | Supported by file inspection. |
| Documentation Accuracy | docs that match current repo | Partially implemented | V1/V2 docs match broad architecture and features; package scripts and CI match `docs/test-plan.md`. | Some contract naming differs, and docs contain encoding artifacts. |
| Documentation Accuracy | docs that appear stale | Partially implemented | README references `node --check scripts/check-backend-e2e.js`, but package script uses `npm run check:e2e`; V1 docs contain mojibake/formatting artifacts. | README not edited by this task. |
| Documentation Accuracy | README/setup accuracy only as an audit note | Partially implemented | README mostly matches stack and commands; notes backend E2E requirements and references `.env.example`. | Verify README setup/testing instructions during V2-17. |

## 4. Backend Baseline Findings

- Auth: Implemented by source inspection. `backend/src/routes/auth.route.js` exposes register, login, and current-user routes. `backend/src/modules/auth/auth.service.js` hashes passwords with bcrypt, verifies credentials, creates JWTs, and returns mapped safe users. `backend/src/modules/auth/auth.mapper.js` excludes `passwordHash`. `backend/src/middlewares/auth.middleware.js` enforces bearer JWTs and returns unauthorized errors for missing/invalid/expired tokens.
- Applications: Implemented by source inspection. `backend/src/routes/application.route.js` exposes create/list/detail/update/delete. `application.service.js` converts authenticated user ids, scopes all lookups by user, creates timestamps, rejects missing records, updates only validated fields, and coordinates cascade delete. `application.repository.js` implements user-scoped list/search/filter/sort/detail/update/delete. `application.validator.js` validates payloads, query params, supported sort fields, and ObjectId params.
- Events: Implemented by source inspection. `backend/src/routes/event.route.js` exposes nested event CRUD under application id. `event.service.js` verifies parent application ownership before event operations. `event.repository.js` scopes queries by `userId` and `applicationId`, including nested update/delete mismatch protection. `event.validator.js` validates event types, modes, dates, contact email, optional fields, and ObjectIds.
- Dashboard: Partially implemented relative to the V2 wording. `dashboard.service.js` fetches user applications/events, builds status counts, total applications, recent applications, upcoming events, and attention flags. The implementation returns `countsByStatus`, while V2 dashboard examples and wording use `statusCounts`. This needs a V2-02 contract decision before dashboard hardening.
- Attention logic: Implemented and locally checked. `backend/src/domain/attention/attention.rules.js`, `attention.service.js`, `attention.types.js`, and `attention.utils.js` implement no-response-after-apply, no-response-after-interview, follow-up-overdue, upcoming events, status gating, thresholds, and effective date handling. `npm run check:attention` passed with output `Attention domain checks passed.`
- Validation/error handling: Implemented for many routes. Validators feed `validate.middleware.js`, which throws `ValidationError`; `error.middleware.js` returns `{ message }` and `{ errors }` for non-server validation failures. `npm run check:backend-hardening` passed with output `Backend hardening checks passed.`
- Ownership/access control: Implemented by source inspection. Application repositories scope by user id. Event services first assert parent application ownership and then event repositories scope by user id and parent application id. Cross-user private resources resolve as not found by scoped lookups.
- Architecture fit: Implemented by source inspection. The backend follows route -> middleware -> controller -> service -> repository/domain patterns. Dashboard appropriately composes application/event repositories and attention domain logic rather than having its own persistence repository.

## 5. Frontend Baseline Findings

- Auth flow: Implemented by source inspection. `frontend/src/api/auth.api.js` calls register/login/me. `frontend/src/features/auth/auth.store.js` persists tokens, bootstraps sessions, handles login/register/logout, and stores auth errors. `LoginPage.jsx` and `RegisterPage.jsx` include loading, disabled submit, field errors, and general errors.
- Protected routes: Implemented by source inspection. `frontend/src/app/router.jsx` wraps dashboard/applications/detail routes in `ProtectedRoute`. `AuthRoutes.jsx` shows a loading screen while bootstrapping and redirects unauthenticated users to `/login`.
- Application list: Implemented by source inspection. `ApplicationsPage.jsx` loads applications, handles create/update/delete, fetch errors, delete confirmation, and refresh. `ApplicationFilters.jsx` exposes search, status, created/updated sort, and sort order. `ApplicationList.jsx` handles loading, error, empty, action error, inline edit, and delete confirmation states.
- Application detail: Implemented by source inspection. `ApplicationDetailPage.jsx` fetches application detail and events separately, handles missing id, loading, error, retry, edit, delete, and safe navigation to `/applications` after delete.
- Event timeline: Implemented by source inspection. `EventTimeline.jsx` handles loading, error, empty, delete error, edit, and delete confirmation. `EventForm.jsx` supports create/edit fields, client-side required title, date conversion, field errors, submit loading, and error detail rendering. `EventItem.jsx` displays event metadata and actions.
- Dashboard: Partially implemented relative to V2 spec. `DashboardPage.jsx` loads summary and renders loading/error states. Dashboard components display total/counts, recent applications, upcoming events, and attention flags. The frontend consumes `countsByStatus`, aligning with current backend but not the V2 example `statusCounts`.
- State handling: Implemented by code inspection for loading/empty/error/validation states across major pages, but browser behavior and responsive rendering were not manually tested.
- Validation/error UX: Implemented by code inspection. `frontend/src/api/http-client.js` extracts readable error messages and `errors`; `auth.utils.js` maps field errors and form-level details; forms preserve local state after errors. Actual browser display remains manually unverified.
- Responsive sanity: Documented and styled, but not manually verified. `frontend/docs/manual-frontend-testcases.md` includes visual and UX checks; `frontend/src/styles.css` and dashboard CSS were not exhaustively visually inspected in a browser during this audit.

## 6. QA / Test Baseline Findings

- Backend scripts: Implemented. `backend/package.json` exposes `check:attention`, `check:backend-hardening`, and `check:e2e`.
- Backend attention check: Passed locally. The script covers attention flag thresholds, status gating, later-event suppression, missing effective dates, immutability, upcoming events, and output shape.
- Backend hardening check: Passed locally. The script covers ObjectId utilities, error middleware response shape, validation error shape, production 500 masking, service malformed-id fallbacks, and auth repository malformed-id fallback.
- Backend E2E/smoke check: Partially implemented but skipped. `backend/scripts/check-backend-e2e.js` covers health, register/login/me, validation errors, cross-user application access, application CRUD/search/filter/sort, event CRUD, dashboard shape, and cascade delete. It was not run because it requires a running backend and MongoDB test database.
- Frontend build: Passed locally. `npm run build` completed with Vite output showing 62 modules transformed and production assets emitted.
- Manual regression docs: Implemented as docs. `frontend/docs/manual-frontend-testcases.md` and `docs/regression-checklist.md` exist. They were reviewed but not executed.
- CI workflow: Implemented as configuration. `.github/workflows/ci.yml` runs `npm ci`, backend attention/hardening checks, and frontend build on PR and pushes to `main`. Remote CI status was not inspected.
- Coverage gaps: No automated frontend E2E framework is present. Backend E2E is not in CI. Manual testcases are practical but not yet recorded as executed evidence. Contract coverage for dashboard naming and full validation/status-code matrix should be hardened in later V2 tasks.

## 7. Documentation Accuracy Findings

- Docs that match current repo:
  - `docs/ApplyFlow Architecture.md` broadly matches current backend layering and frontend page/feature/API structure.
  - `docs/test-plan.md` matches local backend check scripts and frontend build.
  - `.github/workflows/ci.yml` matches the no-secret CI checks described in `docs/test-plan.md`.
  - `frontend/docs/manual-frontend-testcases.md` matches the major frontend flows present in source.
- Stale or risky docs:
  - V1 and V2 docs contain visible encoding/mojibake artifacts in headings and punctuation. This does not block code behavior but affects reviewability.
  - V2 spec examples use `statusCounts`, while current backend/frontend use `countsByStatus`.
  - `followUpAt` sorting is listed as a V2 polish candidate and is not implemented in current code.
  - `recentApplications` is implemented but should be treated as V2 polish/current implementation detail, not a required V1 baseline unless V2-02 explicitly preserves it.
- README/setup risks without editing README:
  - README mostly matches the current stack, API endpoints, and check commands.
  - README setup/testing instructions should be verified during the dedicated README task.
  - README includes `node --check scripts/check-backend-e2e.js`, while the package script for functional E2E is `npm run check:e2e`. This is not necessarily wrong because it is syntax checking, but V2-17 should clarify testing instructions.

## 8. High-Risk Gaps for V2

- Risk: Dashboard count response naming is inconsistent with V2 spec wording.
  - Why it matters: Frontend/backend contract work may accidentally rename or duplicate fields without a clear compatibility decision.
  - Suggested follow-up task: V2-02 should explicitly decide whether to preserve `countsByStatus`, migrate to `statusCounts`, or support both in V2-12.
- Risk: Backend E2E exists but was not run and is not part of CI.
  - Why it matters: Ownership, cascade delete, dashboard shape, and full CRUD behavior are only source-inspected in this audit, not runtime verified.
  - Suggested follow-up task: V2-02 should keep V2-14 or add earlier E2E execution requirements for backend contract tasks when a database is available.
- Risk: Browser/manual frontend behavior is not verified.
  - Why it matters: Loading, empty, error, navigation, and responsive states can look correct in code but still fail in the browser.
  - Suggested follow-up task: V2-02 should require manual frontend smoke evidence for V2-07 through V2-13.
- Risk: `followUpAt` sorting is missing.
  - Why it matters: V2 spec treats it as a possible polish field, so later list-contract work must avoid assuming it is baseline.
  - Suggested follow-up task: Keep it in V2-04 only if the task explicitly includes it.
- Risk: `recentApplications` is already implemented but is V2 polish in the spec.
  - Why it matters: Later dashboard tasks need to decide whether to preserve, harden, or document this current behavior instead of treating it as new.
  - Suggested follow-up task: V2-02 should call out `recentApplications` as present-current behavior to evaluate in V2-12/V2-13.
- Risk: Documentation encoding artifacts and README setup mismatch may confuse review.
  - Why it matters: V2 is meant to improve explainability, and mojibake or unclear README setup/testing instructions weaken that goal.
  - Suggested follow-up task: V2-02 should decide whether limited Markdown encoding/heading cleanup is needed before V2 implementation continues; README corrections should remain reserved for V2-17.

## 9. Recommended Adjustments for V2-02

- Keep the current V2 task plan mostly as-is. The repository already has a broad V1 implementation, and the planned backend, frontend, dashboard, QA, and docs hardening tasks remain appropriate.
- Add a V2-02 contract note for dashboard count naming: current code uses `countsByStatus`; V2 examples use `statusCounts`.
- Add a V2-02 contract note for current `recentApplications`: it exists now, but should be treated as current implementation/V2 polish and verified before changing.
- Keep `followUpAt` sorting out of baseline assumptions. If desired, include it only in V2-04 as an explicit application-list contract change.
- Do not reorder the major phases unless the team wants backend E2E execution earlier. If a database is available, consider running `npm run check:e2e` before V2-03.
- Do not merge tasks. The existing task split is useful for review and risk control.
- Add a missing explicit V2-02 item to verify README setup/testing accuracy later, while keeping actual README edits reserved for V2-17.
- Keep manual frontend regression expansion in V2-15, but require smaller page-specific manual evidence during frontend V2 tasks.

## 10. Checks Run

| Command | Result | Exact output summary |
|---|---|---|
| `git status --short --branch` | PASS | Output before writing audit: `## codex/v2-01-audit-v1-baseline` with no changed files. |
| `git diff --stat` | PASS | Output before writing audit: empty output. |
| `cd backend; npm run check:attention` | PASS | `> applyflow-backend@0.1.0 check:attention`; `> node scripts/check-attention-domain.js`; `Attention domain checks passed.` |
| `cd backend; npm run check:backend-hardening` | PASS | `> applyflow-backend@0.1.0 check:backend-hardening`; `> node scripts/check-backend-hardening.js`; `Backend hardening checks passed.` |
| `cd backend; npm run check:e2e` | SKIPPED | Requires a running backend and MongoDB database. This documentation-only audit did not start backend/database services. |
| `cd frontend; npm run build` | PASS | `vite v8.1.3 building client environment for production...`; `62 modules transformed`; emitted `dist/index.html`, CSS, and JS assets; `built in 1.31s`. |
| Browser/manual regression tests | SKIPPED | Manual browser tests were not run; UI behavior is only source-inspected and documented as needing manual verification where applicable. |
| Remote GitHub Actions result | SKIPPED | Workflow configuration was inspected, but no remote CI run result was checked. |

## 11. Final Recommendation

PROCEED TO V2-02 WITH RISKS

The missing V2-01 artifact is now created and the repository baseline is sufficiently documented to inform V2-02. V2-02 should not start from an assumption that all V1 behavior has been runtime verified. It should explicitly carry forward the dashboard naming risk, skipped E2E/browser checks, missing `followUpAt` sorting, existing `recentApplications`, and documentation/setup cleanup notes.
