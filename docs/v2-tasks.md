# ApplyFlow — V2 Tasks

## 1. Purpose

This document breaks ApplyFlow V2 into small, reviewable tasks for controlled AI-assisted development.

V2 is not a rewrite. V2 is a quality-focused improvement pass over the existing ApplyFlow V1 repository.

The task plan is designed to:

1. preserve V1 behavior
2. prevent scope creep
3. harden backend contracts
4. improve frontend reliability
5. expand QA evidence
6. keep Codex implementation reviewable task by task

---

## 2. Source Documents

Every V2 task must respect these documents:

1. `docs/v2-spec.md`
2. `docs/ApplyFlow Specification.md`
3. `docs/ApplyFlow Architecture.md`
4. `docs/test-plan.md`
5. `docs/regression-checklist.md`
6. `AGENTS.md`
7. relevant repo-local Codex skill files under `.codex/skills/`

If documents conflict:

1. `docs/v2-spec.md` defines V2 behavior and V2 constraints.
2. `docs/ApplyFlow Specification.md` defines the V1 product/domain baseline.
3. `docs/ApplyFlow Architecture.md` defines the V1 architecture baseline.
4. `docs/v2-tasks.md` defines execution order and per-task scope.
5. `AGENTS.md` and Codex skills define AI workflow rules.

No task may silently override product behavior, architecture, dependency policy, or response contracts.

---

## 3. V2 Ground Rules

### 3.1 V2 Is Quality-Focused

V2 should improve:

- correctness
- backend safety
- frontend state handling
- QA/test evidence
- documentation accuracy
- Codex workflow discipline

V2 should not add large new product features.

---

### 3.2 One Task, One Branch

Each task should use one dedicated branch.

Branch format:

```txt
codex/v2-XX-short-name
```

Examples:

```txt
codex/v2-01-audit-v1-baseline
codex/v2-04-application-list-contract
codex/v2-10-dashboard-logic
```

---

### 3.3 Required Codex Workflow

For every implementation task:

```txt
read docs
inspect git status
confirm scope
implement only assigned scope
run relevant checks
self-audit diff
report exact results
stop before merge
```

Codex must not:

- merge branches unless explicitly asked
- fake test results
- add dependencies silently
- edit README outside a dedicated docs task
- rewrite architecture
- add out-of-scope features
- perform broad UI redesigns
- touch unrelated files

---

### 3.4 Definition of Done

A V2 task is done only when:

- the task requirement is implemented or completed
- scope is respected
- no unrelated files are changed
- backend checks pass if backend is affected
- frontend build passes if frontend is affected
- manual tests are run if UI behavior is affected
- validation/error behavior is checked if input is affected
- access control is checked if user data is affected
- docs/test files are updated if behavior changes
- final task summary reports changed files, tests, risks, and suggested commit message

If code is written but not verified, the task status is:

```txt
Implemented, not verified
```

not done.

---

## 4. V2 Phase Overview

V2 is split into 6 phases and 15 tasks.

| Phase | Name | Task Count |
|---|---:|---:|
| Phase 0 | Baseline & Task Planning | 2 |
| Phase 1 | Backend Contract Hardening | 3 |
| Phase 2 | Frontend UX Consistency | 3 |
| Phase 3 | Dashboard & Attention Polish | 2 |
| Phase 4 | QA Evidence Expansion | 3 |
| Phase 5 | Docs & Final Release Check | 2 |
| **Total** |  | **15** |

---

## 5. Task Overview

### Phase 0 — Baseline & Task Planning

- **V2-01** — Audit V1 repository baseline against V2 spec
- **V2-02** — Finalize V2 task/test strategy

### Phase 1 — Backend Contract Hardening

- **V2-03** — Harden shared backend error, validation, and ObjectId behavior
- **V2-04** — Harden application list search/filter/sort contract
- **V2-05** — Harden application detail/update/delete and cascade behavior

### Phase 2 — Frontend UX Consistency

- **V2-06** — Polish application list UX states and controls
- **V2-07** — Polish application detail UX states and delete/update navigation
- **V2-08** — Polish event timeline form/list UX

### Phase 3 — Dashboard & Attention Polish

- **V2-09** — Harden attention/date/timeline rule behavior
- **V2-10** — Harden dashboard summary contract and frontend display

### Phase 4 — QA Evidence Expansion

- **V2-11** — Expand backend E2E/smoke checks
- **V2-12** — Expand frontend manual regression checklist
- **V2-13** — Add V2 test evidence documentation

### Phase 5 — Docs & Final Release Check

- **V2-14** — Update README with approved V2 testing/setup section
- **V2-15** — Final V2 regression and release audit

---

# Phase 0 — Baseline & Task Planning

---

## V2-01 — Audit V1 Repository Baseline Against V2 Spec

### Goal

Confirm what the current repository actually implements before any V2 feature work begins.

### Why This Task Exists

V2 must not assume that every V1-spec capability is fully implemented. The repo must be audited first so later tasks do not build on false assumptions.

### Suggested Branch

```txt
codex/v2-01-audit-v1-baseline
```

### Suggested Skill

```txt
applyflow-qa-reviewer
```

### Allowed Scope

Documentation and audit output only.

Allowed files:

- `docs/v2-baseline-audit.md`
- `docs/test-plan.md` only if adding audit notes
- `docs/regression-checklist.md` only if adding audit notes

Do not edit backend/frontend source files.

### Implementation Requirements

Audit current repo against:

- `docs/v2-spec.md`
- V1 specification
- V1 architecture
- existing backend scripts
- existing frontend manual test documentation
- current CI workflow

Classify each capability as:

```txt
Implemented
Partially implemented
Documented only
Missing
Unclear / needs manual verification
```

Audit areas:

- auth
- application CRUD
- application search/filter/sort
- event CRUD
- cascade delete
- dashboard summary
- attention flags
- validation/error handling
- frontend loading/empty/error states
- backend check scripts
- frontend manual tests
- CI workflow
- README/setup accuracy, but do not edit README in this task

### Out of Scope

Do not:

- implement fixes
- update README
- add tests
- change package files
- change source code
- create new dependencies

### Acceptance Criteria

- A baseline audit document exists.
- It clearly separates verified behavior from assumed behavior.
- It identifies high-risk gaps for V2 tasks.
- No source code is modified.
- No README changes are made.

### Verification Commands

```powershell
git status
git diff --stat
```

If safe and available:

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening

cd ../frontend
npm run build
```

### Manual Test Checklist

Run only if environment is available:

- [ ] Register/login works
- [ ] Protected routes block unauthenticated access
- [ ] Application CRUD works
- [ ] Event CRUD works
- [ ] Dashboard loads
- [ ] Cascade delete behavior works
- [ ] Cross-user access is blocked

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Task: V2-01 — Audit V1 repository baseline against V2 spec.

Read:
- docs/v2-spec.md
- docs/ApplyFlow Specification.md
- docs/ApplyFlow Architecture.md
- docs/test-plan.md
- docs/regression-checklist.md
- current package scripts and CI workflow

Do not modify source code.
Do not implement fixes.
Do not edit README.

Create docs/v2-baseline-audit.md.

Classify each major capability as Implemented, Partially implemented, Documented only, Missing, or Unclear / needs manual verification.

Report:
- verified V1 behavior
- gaps
- risks
- suggested follow-up tasks
- checks run and exact results
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-01 baseline audit.

Check:
- whether the audit distinguishes verified repo behavior from assumptions
- whether it incorrectly treats V2 polish items as V1 baseline
- whether it modified source code or README
- whether risks are concrete and useful for later V2 tasks

Return verdict: READY or NEEDS FIX.
```

---

## V2-02 — Finalize V2 Task/Test Strategy

### Goal

Turn the baseline audit into an execution plan for the remaining V2 tasks.

### Why This Task Exists

The initial V2 task plan should be confirmed against the actual repo before implementation starts.

### Suggested Branch

```txt
codex/v2-02-finalize-task-strategy
```

### Suggested Skill

```txt
applyflow-test-designer
```

### Allowed Scope

Documentation only.

Allowed files:

- `docs/v2-tasks.md`
- `docs/test-plan.md`
- `docs/regression-checklist.md`
- `docs/v2-baseline-audit.md` only for small corrections

Do not edit backend/frontend source.

### Implementation Requirements

Update the V2 task strategy based on V2-01 findings.

The task/test strategy must define:

- final V2 task order
- which tasks affect backend
- which tasks affect frontend
- which tasks affect docs only
- required checks per task
- required manual tests per task
- high-risk regression areas
- which tasks are allowed to touch README

### Out of Scope

Do not:

- implement product changes
- update README
- add dependencies
- rewrite the spec

### Acceptance Criteria

- V2 task/test strategy is consistent with the baseline audit.
- The remaining task order is clear.
- README changes are reserved for a dedicated docs task.
- No source code changes occur.

### Verification Commands

```powershell
git status
git diff --stat
```

### Manual Test Checklist

No browser manual test required.

Review manually:

- [ ] Task order is coherent
- [ ] Test strategy maps to actual repo risks
- [ ] README edits are limited to V2-14
- [ ] No feature work is included

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-test-designer skill.

Task: V2-02 — Finalize V2 task/test strategy.

Read:
- docs/v2-spec.md
- docs/v2-baseline-audit.md
- docs/test-plan.md
- docs/regression-checklist.md
- docs/v2-tasks.md

Do not modify source code.
Do not edit README.

Update docs/v2-tasks.md, docs/test-plan.md, and docs/regression-checklist.md only if needed.

Make sure the remaining V2 task plan is grounded in the actual baseline audit.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-02.

Check whether the V2 task/test strategy is grounded in the baseline audit, avoids scope creep, and sets clear verification expectations for later tasks.

Return verdict: READY or NEEDS FIX.
```

---

# Phase 1 — Backend Contract Hardening

---

## V2-03 — Harden Shared Backend Error, Validation, and ObjectId Behavior

### Goal

Make backend error behavior predictable for V2-touched routes.

### Why This Task Exists

Frontend reliability and QA tests depend on stable backend error contracts.

### Suggested Branch

```txt
codex/v2-03-backend-error-contract
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Backend shared validation/error utilities and tests/check scripts.

Likely files:

- `backend/src/middlewares/error.middleware.js`
- `backend/src/utils/object-id.utils.js`
- backend domain/shared error files
- backend validators if needed
- backend check scripts
- `docs/test-plan.md` if behavior is documented

### Implementation Requirements

Implement or verify the mandatory V2 error contract for V2-touched behavior:

- missing token: `401`
- invalid token: `401`
- malformed ObjectId: `400`
- valid ObjectId not found: `404`
- valid ObjectId owned by another user: `404`
- validation failure: `400`

Validation error shape:

```json
{
  "message": "Validation failed",
  "errors": {
    "fieldName": "Human-readable error"
  }
}
```

General error shape:

```json
{
  "message": "Human-readable error"
}
```

Rules:

- do not expose raw stack traces to frontend
- do not change all response shapes broadly unless needed
- preserve existing compatible behavior
- do not rewrite route architecture
- do not add dependencies unless explicitly approved

### Out of Scope

Do not:

- change frontend UI
- add new product features
- rewrite all validators
- update README
- change API routes

### Acceptance Criteria

- malformed ObjectId behavior is consistent for touched routes
- validation errors use consistent shape
- general errors use consistent shape
- cross-user private resource behavior is not exposed
- existing backend checks still pass

### Verification Commands

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening
```

Optional if available:

```powershell
npm run check:e2e
```

### Manual Test Checklist

API/manual checks if environment is available:

- [ ] missing token returns 401
- [ ] invalid token returns 401
- [ ] malformed application ID returns 400
- [ ] nonexistent valid ID returns 404
- [ ] cross-user valid ID returns 404
- [ ] validation error returns `{ message, errors }`

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-03 — Harden shared backend error, validation, and ObjectId behavior.

Read docs/v2-spec.md first, especially error contract, validation policy, ownership, and architecture preservation.

Implement only the shared backend hardening needed to make V2-touched backend behavior predictable.

Do not change frontend.
Do not update README.
Do not add dependencies.
Do not rewrite route architecture.

Run:
cd backend
npm run check:attention
npm run check:backend-hardening

Report exact results.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-03.

Focus on:
- status codes
- JSON error shape
- ObjectId handling
- cross-user private resource behavior
- architecture preservation
- no unrelated refactor
- test evidence

Return verdict: READY or NEEDS FIX.
```

---

## V2-04 — Harden Application List Search/Filter/Sort Contract

### Goal

Make application list query behavior precise, safe, and testable.

### Why This Task Exists

Application list is a core flow, and V2 spec clarifies search/filter/sort behavior.

### Suggested Branch

```txt
codex/v2-04-application-list-contract
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Backend application list route/service/repository/validator and relevant checks.

Likely files:

- backend application module
- backend application validator
- backend check scripts
- `docs/test-plan.md` if needed

### Implementation Requirements

Implement or verify:

#### Search

- searches `company` and `role`
- trims whitespace
- empty search behaves like no search
- case-insensitive if current implementation supports it or task implements it safely
- user-scoped

#### Filter

- `status` filters by `currentStatus`
- valid statuses:
  - `saved`
  - `applied`
  - `in_process`
  - `offer`
  - `rejected`
  - `withdrawn`
- invalid status returns `400` with validation error shape

#### Sort

V1 sort fields:

- `createdAt`
- `updatedAt`

V2 extension:

- `followUpAt`

`followUpAt` sorting is a V2 extension and must be implemented only in this application-list polish task or later explicit task.

Supported sort order:

- `asc`
- `desc`

Default sort:

```txt
sortBy=updatedAt
sortOrder=desc
```

Invalid `sortBy` or `sortOrder` returns `400`.

#### Unknown Params

Unknown query params should be ignored unless existing verified behavior rejects them. If changing behavior, document it in task summary.

### Out of Scope

Do not:

- change frontend list UI
- add pagination unless explicitly approved
- add full-text search dependency
- update README
- change application response shape unnecessarily

### Acceptance Criteria

- search/filter/sort behavior is deterministic
- invalid query values return clear validation errors
- user scoping is preserved
- backend checks pass
- relevant backend E2E/check coverage is updated if practical

### Verification Commands

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening
```

Optional if available:

```powershell
npm run check:e2e
```

### Manual Test Checklist

API/manual checks:

- [ ] search by company
- [ ] search by role
- [ ] search with whitespace
- [ ] empty search
- [ ] filter each valid status
- [ ] invalid status returns 400
- [ ] sort by createdAt
- [ ] sort by updatedAt
- [ ] sort by followUpAt if implemented
- [ ] invalid sortBy returns 400
- [ ] invalid sortOrder returns 400
- [ ] user A cannot see user B applications

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-04 — Harden application list search/filter/sort contract.

Read docs/v2-spec.md first.

Implement only backend application list contract hardening:
- search company/role
- status filter
- sortBy/sortOrder
- invalid query validation
- user scoping

Do not change frontend.
Do not add pagination.
Do not update README.
Do not add dependencies.

Run relevant backend checks and report exact results.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-04.

Focus on:
- query validation
- user scoping
- default sort
- followUpAt being treated as V2 extension
- no pagination/scope creep
- no response shape breakage
- backend check evidence
```

---

## V2-05 — Harden Application Detail/Update/Delete and Cascade Behavior

### Goal

Verify and harden application detail, update, delete, and child-event cascade behavior.

### Why This Task Exists

Application deletion and update are high-risk because they affect ownership, forbidden fields, stale frontend state, and child event data.

### Suggested Branch

```txt
codex/v2-05-application-crud-hardening
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Backend application and event repository/service files as needed.

Likely files:

- backend application module
- backend event repository only for cascade delete
- backend validators
- backend check scripts

### Implementation Requirements

Verify or implement:

- detail returns only owner resource
- malformed ID returns `400`
- nonexistent valid ID returns `404`
- cross-user valid ID returns `404`
- update only allows:
  - `company`
  - `role`
  - `jdUrl`
  - `source`
  - `notes`
  - `currentStatus`
  - `followUpAt`
- forbidden update fields return `400`
- optional nullable fields can be cleared with `null`
- required strings are trimmed and cannot be blank after trimming
- delete removes application
- delete removes child events
- delete is user-scoped

### Out of Scope

Do not:

- change frontend delete UI
- redesign application schema
- add soft delete
- update README
- implement unrelated event CRUD changes

### Acceptance Criteria

- detail/update/delete contract is consistent
- cascade delete is verified
- forbidden fields are rejected
- cross-user behavior does not leak private data
- backend checks pass

### Verification Commands

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening
```

Optional if available:

```powershell
npm run check:e2e
```

### Manual Test Checklist

API/manual checks:

- [ ] owner can get application detail
- [ ] malformed ID returns 400
- [ ] nonexistent valid ID returns 404
- [ ] cross-user valid ID returns 404
- [ ] valid update works
- [ ] blank required string is rejected
- [ ] forbidden field update rejected
- [ ] nullable optional fields can be cleared
- [ ] delete removes application
- [ ] delete removes child events

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-05 — Harden application detail/update/delete and cascade behavior.

Read docs/v2-spec.md first.

Focus only on backend application detail/update/delete behavior and application-event cascade delete.

Do not change frontend.
Do not update README.
Do not add soft delete.
Do not redesign schema.

Run backend checks and report exact results.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-05.

Focus on:
- ownership checks
- ObjectId behavior
- update field safety
- null clearing
- cascade delete
- cross-user 404 behavior
- no unrelated event/dashboard changes
```

---

# Phase 2 — Frontend UX Consistency

---

## V2-06 — Polish Application List UX States and Controls

### Goal

Make the Applications page reliable and testable from the user’s perspective.

### Why This Task Exists

Backend list behavior is now clearer; frontend controls and states should match it.

### Suggested Branch

```txt
codex/v2-06-application-list-ux
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Frontend application list/page/API files and related CSS.

Likely files:

- frontend application API client
- Applications page
- application list/filter components
- related CSS
- `docs/regression-checklist.md` if manual cases change

### Implementation Requirements

Implement or polish:

- loading state
- empty state
- filtered empty state
- error state
- search input
- status filter
- sort control if backend supports it
- reset filters action if useful
- validation/error display for query failures
- preserve route/navigation behavior
- keep form input stable during validation errors where relevant

Rules:

- no UI library unless explicitly approved
- no MUI
- no broad redesign
- no backend changes unless a small API-client alignment is needed

### Out of Scope

Do not:

- change backend contracts
- add pagination unless explicitly approved
- redesign the whole app
- update README
- add charts or analytics

### Acceptance Criteria

- application list loads with data
- no-data state is clear
- filtered-empty state is clear
- API error state is clear
- search/filter/sort controls match backend behavior
- create/edit/delete flows are not regressed
- frontend build passes

### Verification Commands

```powershell
cd frontend
npm run build
```

Optional:

```powershell
git diff --stat
```

### Manual Test Checklist

- [ ] open Applications page with data
- [ ] open Applications page with no data
- [ ] search by company
- [ ] search by role
- [ ] search with no matching result
- [ ] filter by status
- [ ] sort if available
- [ ] reset filters if available
- [ ] refresh page
- [ ] create application still works
- [ ] edit/delete entry points still work
- [ ] basic responsive sanity

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-06 — Polish application list UX states and controls.

Read docs/v2-spec.md first.

Implement frontend-only application list UX improvements:
- loading state
- empty state
- filtered empty state
- error state
- search/filter/sort controls aligned with backend
- no broad redesign

Do not change backend.
Do not add UI libraries.
Do not update README.

Run frontend build and report exact result.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-06.

Focus on:
- frontend state completeness
- backend query contract alignment
- no UI-library drift
- no broad redesign
- manual test coverage
- frontend build result
```

---

## V2-07 — Polish Application Detail UX States and Delete/Update Navigation

### Goal

Make the Application Detail page reliable across loading, refresh, errors, invalid IDs, update, and delete.

### Why This Task Exists

The detail page is a high-use operational page and must not break on refresh or stale deleted data.

### Suggested Branch

```txt
codex/v2-07-application-detail-ux
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Frontend application detail/page/API files and related CSS.

Likely files:

- Application detail page
- application API client
- application detail components
- event timeline container only if necessary for state display
- related CSS
- regression checklist if needed

### Implementation Requirements

Implement or polish:

- loading state
- invalid ID/not-found state
- unauthorized handling
- API error state
- refresh behavior
- edit/update UX state
- delete confirmation if not already present
- safe navigation after delete
- stale deleted data must not remain visible
- event timeline section remains visible or shows empty state

Rules:

- preserve route structure
- no major redesign
- no backend changes unless required by API-client mismatch
- no README changes

### Out of Scope

Do not:

- redesign event timeline UX broadly
- add attention flags to detail unless explicitly required
- change backend delete behavior
- add UI library

### Acceptance Criteria

- valid detail loads
- refresh works
- invalid/nonexistent ID shows controlled state
- update flow remains usable
- delete navigates safely
- event section does not disappear incorrectly
- frontend build passes

### Verification Commands

```powershell
cd frontend
npm run build
```

### Manual Test Checklist

- [ ] open existing application detail
- [ ] refresh detail page
- [ ] open malformed/invalid detail URL if routable
- [ ] open nonexistent valid ID if testable
- [ ] edit application
- [ ] delete application
- [ ] confirm navigation after delete
- [ ] confirm list no longer shows deleted app
- [ ] confirm event section empty state works
- [ ] basic responsive sanity

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-07 — Polish application detail UX states and delete/update navigation.

Read docs/v2-spec.md first.

Implement frontend-only detail page UX hardening:
- loading
- not found
- error
- refresh
- update state
- delete navigation
- event section empty state

Do not add UI libraries.
Do not change backend unless absolutely necessary for API-client alignment.
Do not update README.

Run frontend build and report exact result.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-07.

Focus on:
- controlled detail states
- safe delete navigation
- refresh behavior
- no stale deleted data
- no broad redesign
- build/manual test evidence
```

---

## V2-08 — Polish Event Timeline Form/List UX

### Goal

Make event timeline management clearer and more reliable in the frontend.

### Why This Task Exists

Events drive dashboard and attention logic. The UI must make event creation/editing understandable.

### Suggested Branch

```txt
codex/v2-08-event-timeline-ux
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Frontend event components/API/page integration and related CSS.

Likely files:

- event API client
- EventTimeline
- EventItem
- EventForm
- ApplicationDetailPage integration
- related CSS
- regression checklist if needed

### Implementation Requirements

Implement or polish:

- event list loading/empty/error states
- create event form validation display
- update event form validation display
- delete event UX
- preserve form input after backend validation errors
- event type options match V2 spec
- mode options match V2 spec
- date fields are understandable
- meetingLink/contactEmail validation errors display clearly if backend returns them
- timeline order display is stable

Rules:

- no calendar integration
- no notification system
- no interview-round model
- no UI library unless explicitly approved

### Out of Scope

Do not:

- add backend event fields
- implement calendar view
- implement email reminders
- update README
- redesign whole detail page

### Acceptance Criteria

- user can create event
- user can update event
- user can delete event
- empty event timeline is clear
- backend validation errors are understandable
- frontend build passes

### Verification Commands

```powershell
cd frontend
npm run build
```

### Manual Test Checklist

- [ ] detail page with no events
- [ ] create applied event
- [ ] create interview event
- [ ] create follow_up event
- [ ] invalid date shows error if testable
- [ ] invalid email/link shows error if testable
- [ ] edit event
- [ ] delete event
- [ ] refresh and confirm timeline consistency
- [ ] basic responsive sanity

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-08 — Polish event timeline form/list UX.

Read docs/v2-spec.md first.

Implement frontend-only event timeline UX improvements:
- list states
- empty state
- validation error display
- create/update/delete UX
- stable timeline display

Do not add calendar/email/reminder features.
Do not add UI libraries.
Do not update README.

Run frontend build and report exact result.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-08.

Focus on:
- event form/list UX
- validation display
- event type/mode consistency
- no new event domain fields
- no calendar/email scope creep
- build/manual test evidence
```

---

# Phase 3 — Dashboard & Attention Polish

---

## V2-09 — Harden Attention/Date/Timeline Rule Behavior

### Goal

Make attention flag and timeline date behavior deterministic and testable.

### Why This Task Exists

Attention logic is high-risk because it depends on status, event type, effective dates, thresholds, and “later event” reasoning.

### Suggested Branch

```txt
codex/v2-09-attention-rules
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Backend attention/timeline domain logic and related checks.

Likely files:

- backend `domain/attention/*`
- backend `domain/timeline/*`
- date utilities
- dashboard service only if needed for integration
- backend check scripts

### Implementation Requirements

Implement or verify:

#### Effective Event Date

Priority:

1. `occurredAt`
2. `scheduledAt`
3. `createdAt`

#### Attention Ordering

For attention flag calculations:

- “most recent event” uses effective event date
- “later event” means effective event date later than reference event effective date
- if effective dates tie, use `createdAt`
- if still tied, use `_id` for stable ordering

#### Silence Flags

`NO_RESPONSE_AFTER_APPLY` only for:

- `applied`
- `in_process`

`NO_RESPONSE_AFTER_INTERVIEW` only for:

- `applied`
- `in_process`

#### Thresholds

- no response after apply: 14 days
- no response after interview: 7 days

#### Follow-up Overdue

Only for:

- `saved`
- `applied`
- `in_process`

Not for:

- `offer`
- `rejected`
- `withdrawn`

### Out of Scope

Do not:

- change frontend dashboard UI
- add user-configurable thresholds
- auto-sync status from events
- implement calendar/email reminders
- update README

### Acceptance Criteria

- attention rules are deterministic
- status gating is correct
- “later event” behavior is testable
- date threshold behavior is centralized
- backend checks pass
- test/check coverage is improved if practical

### Verification Commands

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening
```

Optional:

```powershell
npm run check:e2e
```

### Manual Test Checklist

API/check scenarios:

- [ ] applied 16 days ago, no progress, status applied → apply flag
- [ ] applied 16 days ago, later hr_call → no apply flag
- [ ] applied 16 days ago, withdrawn → no apply flag
- [ ] interview 8 days ago, no later progress, in_process → interview flag
- [ ] interview 8 days ago, later rejected → no interview flag
- [ ] overdue followUpAt, applied → overdue flag
- [ ] overdue followUpAt, rejected → no overdue flag
- [ ] events with occurredAt/scheduledAt/createdAt sort correctly

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-09 — Harden attention/date/timeline rule behavior.

Read docs/v2-spec.md first.

Focus only on backend attention/timeline domain logic.

Implement deterministic effective-date ordering, later-event comparison, status gating, and threshold behavior.

Do not change frontend.
Do not add user-configurable thresholds.
Do not auto-sync currentStatus.
Do not update README.

Run backend checks and report exact results.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-09.

Focus on:
- attention business correctness
- effective-date ordering
- tie-breakers
- silence flag status gating
- follow-up overdue status gating
- no frontend/dashboard UI scope creep
- check evidence
```

---

## V2-10 — Harden Dashboard Summary Contract and Frontend Display

### Goal

Make dashboard backend summary and frontend display reliable, user-scoped, and explainable.

### Why This Task Exists

Dashboard is the product’s main value page. It must show backend-derived data without frontend duplicating business logic.

### Suggested Branch

```txt
codex/v2-10-dashboard-polish
```

### Suggested Skill

```txt
applyflow-task-runner
```

### Allowed Scope

Backend dashboard service/API and frontend dashboard page/components.

Likely files:

- backend dashboard module
- backend attention integration
- backend check scripts
- frontend dashboard API client
- frontend dashboard page/components
- related CSS
- regression checklist if needed

### Implementation Requirements

Backend dashboard must provide:

- total applications
- status counts
- upcoming events
- attention flags

`recentApplications` is a V2 dashboard polish item, not a V1 baseline. It may be included only if this task explicitly implements or verifies it.

#### Dashboard Date Rules

Use server time.

Upcoming event included when:

1. `scheduledAt` exists
2. `scheduledAt >= now`
3. `scheduledAt < now + 3 days`
4. parent application `currentStatus` is one of:
   - `saved`
   - `applied`
   - `in_process`

Closed statuses for dashboard upcoming-event logic:

- `offer`
- `rejected`
- `withdrawn`

Upcoming events must be returned in `upcomingEvents`, not in `attentionFlags`, unless a task explicitly changes this behavior.

#### Ordering

If present:

- `recentApplications`: `updatedAt desc`, then `createdAt desc`
- `upcomingEvents`: `scheduledAt asc`, then `createdAt asc`
- `attentionFlags`: `referenceDate asc`, then `applicationId asc`

Default limits must be documented in task summary. If no limit is implemented, return all matching records.

Frontend dashboard must:

- display backend-derived data
- not reimplement attention logic
- handle loading state
- handle empty dashboard
- handle empty subsection
- handle API error state
- explain why attention items exist using backend messages

### Out of Scope

Do not:

- add charts unless explicitly approved
- add analytics
- add frontend duplicate attention logic
- add calendar view
- update README
- add UI library

### Acceptance Criteria

- dashboard summary is user-scoped
- status counts are correct
- upcoming event window is deterministic
- attention flags come from backend logic
- frontend displays loading/empty/error states
- frontend build passes
- backend checks pass

### Verification Commands

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening

cd ../frontend
npm run build
```

Optional:

```powershell
cd ../backend
npm run check:e2e
```

### Manual Test Checklist

- [ ] dashboard with no applications
- [ ] dashboard with multiple statuses
- [ ] dashboard with upcoming events inside 3-day window
- [ ] dashboard excludes past events
- [ ] dashboard excludes events at/after now + 3 days
- [ ] dashboard excludes closed-status upcoming events
- [ ] attention flags display backend messages
- [ ] frontend does not calculate flags locally
- [ ] dashboard as user B does not show user A data
- [ ] refresh dashboard page

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-task-runner skill.

Task: V2-10 — Harden dashboard summary contract and frontend display.

Read docs/v2-spec.md first.

Implement or verify backend dashboard contract and frontend dashboard display:
- status counts
- upcomingEvents
- attentionFlags
- optional recentApplications as V2 polish if already supported or explicitly implemented here
- loading/empty/error states

Do not add charts.
Do not add analytics.
Do not duplicate attention logic in frontend.
Do not add UI libraries.
Do not update README.

Run backend checks and frontend build. Report exact results.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-10.

Focus on:
- dashboard user scoping
- upcoming event date window
- closed statuses
- attention logic not duplicated in frontend
- recentApplications treated as V2 polish
- frontend state handling
- backend/frontend check evidence
```

---

# Phase 4 — QA Evidence Expansion

---

## V2-11 — Expand Backend E2E/Smoke Checks

### Goal

Expand backend verification for V2-critical behavior.

### Why This Task Exists

V2 is quality-focused. Backend check scripts should demonstrate auth, ownership, validation, application/event, cascade, and dashboard behavior.

### Suggested Branch

```txt
codex/v2-11-backend-e2e-checks
```

### Suggested Skill

```txt
applyflow-test-designer
```

### Allowed Scope

Backend scripts/package docs for scripts only.

Likely files:

- `backend/scripts/check-backend-e2e.js`
- `backend/package.json` only if adding/updating script command
- `docs/test-plan.md`
- `docs/v2-test-evidence.md` if already introduced

### Implementation Requirements

Expand backend checks to cover:

- health
- register/login/me
- missing token
- invalid token
- application CRUD
- application search/filter/sort
- application validation errors
- malformed ObjectId
- cross-user application access
- event CRUD
- cross-user event access
- cascade delete
- dashboard summary shape
- dashboard user scoping

Rules:

- use disposable users/data
- cleanup created test data where practical
- keep script readable
- avoid introducing a full test framework unless explicitly approved
- do not require CI secrets unless explicitly configured

### Out of Scope

Do not:

- add Jest/Vitest unless explicitly approved
- add frontend browser automation
- update README
- change product behavior just to make tests pass
- add dependencies without approval

### Acceptance Criteria

- backend E2E/smoke script covers key flows
- test data is disposable
- failures are readable
- script can run locally with documented requirements
- existing backend checks still pass

### Verification Commands

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening
npm run check:e2e
```

### Manual Test Checklist

- [ ] run e2e with backend/database available
- [ ] confirm failure output is readable
- [ ] confirm disposable data strategy
- [ ] confirm script does not depend on private real user data

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-test-designer skill.

Task: V2-11 — Expand backend E2E/smoke checks.

Read docs/v2-spec.md first.

Expand backend E2E/smoke checks for high-risk V2 behavior:
- auth
- ownership
- validation
- applications
- events
- cascade delete
- dashboard

Do not add a new test framework unless explicitly approved.
Do not update README.
Do not change product behavior just to make tests pass.

Run backend checks and report exact results.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-11.

Focus on:
- meaningful backend coverage
- disposable data
- clear failures
- no test-framework scope creep
- no product behavior changes hidden inside test task
```

---

## V2-12 — Expand Frontend Manual Regression Checklist

### Goal

Make manual frontend regression testing strong enough for V2 review and internship explanation.

### Why This Task Exists

Frontend browser behavior is difficult to prove through build checks alone. Manual evidence should be structured.

### Suggested Branch

```txt
codex/v2-12-frontend-regression-checklist
```

### Suggested Skill

```txt
applyflow-test-designer
```

### Allowed Scope

Documentation only.

Likely files:

- `docs/regression-checklist.md`
- existing frontend manual testcase docs
- `docs/test-plan.md`

### Implementation Requirements

Expand checklist for:

- auth
- protected routes
- dashboard
- application list
- application search/filter/sort
- application create/edit/delete
- detail page refresh/error/not-found
- event timeline create/edit/delete
- validation errors
- API error state where testable
- cascade delete visible behavior
- cross-user scenarios where manually testable
- responsive sanity

Organize checklist by page/flow.

Each case should include:

- precondition
- action
- expected result
- status field for tester result

### Out of Scope

Do not:

- change source code
- add browser automation framework
- update README
- add screenshots unless explicitly requested

### Acceptance Criteria

- checklist is specific and usable
- major V2 flows are covered
- edge cases are included
- no source code changes occur

### Verification Commands

```powershell
git status
git diff --stat
```

### Manual Test Checklist

Use the checklist once if environment is available:

- [ ] mark confusing cases
- [ ] refine wording if necessary

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-test-designer skill.

Task: V2-12 — Expand frontend manual regression checklist.

Read docs/v2-spec.md first.

Update docs/regression-checklist.md and related manual test docs only.

Do not modify source code.
Do not add browser automation.
Do not update README.

Make the checklist usable by a tester, with preconditions, actions, expected results, and result/status fields.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-12.

Focus on:
- testcase clarity
- coverage of high-risk flows
- no source changes
- no automation scope creep
- usefulness for QA internship discussion
```

---

## V2-13 — Add V2 Test Evidence Documentation

### Goal

Create a concise record of what V2 checks and manual tests prove.

### Why This Task Exists

A tester-oriented portfolio project should not only have tests; it should also explain what was tested and what remains risky.

### Suggested Branch

```txt
codex/v2-13-test-evidence-docs
```

### Suggested Skill

```txt
applyflow-test-designer
```

### Allowed Scope

Documentation only.

Likely files:

- `docs/v2-test-evidence.md`
- `docs/test-plan.md`
- `docs/regression-checklist.md` only if linking/cleanup is needed

### Implementation Requirements

Create or update V2 test evidence documentation with:

- backend check commands
- what each backend check covers
- frontend build purpose
- manual regression checklist purpose
- known limitations
- evidence template for future test runs
- clear distinction between automated checks and manual tests

Do not claim tests were run unless they actually were.

### Out of Scope

Do not:

- update README
- change source code
- add new test framework
- fake test results
- add screenshots unless explicitly requested

### Acceptance Criteria

- V2 test evidence doc exists
- automated vs manual evidence is separated
- commands are accurate
- limitations are explicit
- no fake results are included

### Verification Commands

```powershell
git status
git diff --stat
```

### Manual Test Checklist

No browser manual test required.

Review manually:

- [ ] commands are accurate
- [ ] coverage descriptions are not exaggerated
- [ ] limitations are honest
- [ ] no unrun tests are marked as passed

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-test-designer skill.

Task: V2-13 — Add V2 test evidence documentation.

Read docs/v2-spec.md first.

Create/update docs/v2-test-evidence.md and related test docs only.

Do not modify source code.
Do not update README.
Do not claim tests passed unless actually run.

Document automated checks, manual regression, known limitations, and evidence template.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-13.

Focus on:
- honest QA evidence
- clear distinction between automated/manual checks
- no inflated claims
- no source code changes
- no premature README update
```

---

# Phase 5 — Docs & Final Release Check

---

## V2-14 — Update README With Approved V2 Testing/Setup Section

### Goal

Update README only after V2 behavior and test strategy are stable.

### Why This Task Exists

README changes are explicitly restricted to approved documentation tasks.

### Suggested Branch

```txt
codex/v2-14-readme-v2-testing-section
```

### Suggested Skill

```txt
applyflow-qa-reviewer
```

### Allowed Scope

Documentation only.

Allowed files:

- `README.md`
- `docs/v2-test-evidence.md`
- `docs/test-plan.md` only if syncing links
- `docs/regression-checklist.md` only if syncing links

### Implementation Requirements

README should include or update:

- project purpose
- V2 quality focus
- local setup overview
- backend check commands
- frontend build command
- optional E2E command and requirements
- manual regression checklist link
- CI explanation
- known limitations

Rules:

- do not claim unimplemented features
- do not exaggerate AI/Codex involvement
- do not include secrets
- keep README concise
- do not modify source code

### Out of Scope

Do not:

- change backend/frontend code
- add features
- add dependencies
- change CI workflow unless explicitly approved

### Acceptance Criteria

- README commands match repo structure
- README testing section is accurate
- README references V2 docs/checklists
- README does not overclaim
- no source code changes occur

### Verification Commands

```powershell
git diff -- README.md
git status
```

Optional command sanity if environment available:

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening

cd ../frontend
npm run build
```

### Manual Test Checklist

- [ ] README setup steps are understandable
- [ ] check commands match actual scripts
- [ ] manual regression docs are linked
- [ ] no non-goal features are described as implemented

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Task: V2-14 — Update README with approved V2 testing/setup section.

This is the dedicated README task.

Read:
- docs/v2-spec.md
- docs/v2-test-evidence.md
- docs/test-plan.md
- docs/regression-checklist.md

Update README only for accurate setup/testing/V2 quality documentation.

Do not modify source code.
Do not add features.
Do not exaggerate claims.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-14.

Focus on:
- README accuracy
- no overclaiming
- command correctness
- no source code changes
- V2 docs links
```

---

## V2-15 — Final V2 Regression and Release Audit

### Goal

Run the final V2 verification pass and produce a release-quality audit summary.

### Why This Task Exists

V2 should end with evidence that the repo is stable, not just with many commits.

### Suggested Branch

```txt
codex/v2-15-final-regression-audit
```

### Suggested Skill

```txt
applyflow-qa-reviewer
```

### Allowed Scope

Audit docs and small documentation corrections only.

Allowed files:

- `docs/v2-final-regression.md`
- `docs/v2-test-evidence.md`
- `docs/regression-checklist.md` if marking final run
- `README.md` only for tiny factual corrections discovered during final audit

Source code fixes should become separate fix branches unless the issue is trivial and explicitly approved.

### Implementation Requirements

Run or record:

- backend checks
- frontend build
- backend E2E if environment is available
- manual regression checklist if environment is available
- CI status if pushed
- final docs consistency check
- final git status/diff review

Final regression doc should include:

- date/time of run
- branch
- commands run
- exact results
- manual tests run
- failures or skipped checks
- known risks
- release verdict

Verdict options:

```txt
READY
READY WITH KNOWN RISKS
NEEDS FIX
```

### Out of Scope

Do not:

- add new features
- do broad refactor
- change dependencies
- rewrite docs broadly
- hide failed checks
- mark unrun tests as passed

### Acceptance Criteria

- final regression document exists
- exact command results are recorded
- skipped checks are clearly marked
- known risks are honest
- release verdict is clear
- no unexpected untracked files remain

### Verification Commands

```powershell
git status

cd backend
npm run check:attention
npm run check:backend-hardening
npm run check:e2e

cd ../frontend
npm run build
```

If E2E cannot run:

```txt
Mark E2E as skipped and explain why.
```

### Manual Test Checklist

Use `docs/regression-checklist.md`.

At minimum, cover:

- [ ] register/login/logout
- [ ] protected routes
- [ ] application list/search/filter/sort
- [ ] create/edit/delete application
- [ ] detail refresh/not-found
- [ ] event create/edit/delete
- [ ] cascade delete
- [ ] dashboard empty/data states
- [ ] cross-user access where testable
- [ ] responsive sanity

### Implementation Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Task: V2-15 — Final V2 regression and release audit.

Read:
- docs/v2-spec.md
- docs/v2-test-evidence.md
- docs/regression-checklist.md
- README.md

Run final verification where environment allows:
- backend checks
- frontend build
- backend E2E if available
- manual regression if available

Create docs/v2-final-regression.md.

Do not add features.
Do not hide failed checks.
Do not mark skipped checks as passed.
Do not modify source code unless explicitly approved.
```

### Review Prompt

```txt
Use AGENTS.md and the applyflow-qa-reviewer skill.

Review V2-15.

Focus on:
- honesty of final regression evidence
- exact command results
- skipped checks clearly explained
- no hidden source changes
- release verdict supported by evidence
```

---

## 6. Suggested Execution Order

Use this exact order unless the baseline audit reveals a strong reason to adjust:

```txt
V2-01
V2-02
V2-03
V2-04
V2-05
V2-06
V2-07
V2-08
V2-09
V2-10
V2-11
V2-12
V2-13
V2-14
V2-15
```

---

## 7. Recommended Human Review Gates

### Gate A — After Phase 0

Before backend/frontend implementation starts:

- confirm baseline audit
- confirm final task order
- confirm high-risk gaps
- confirm V2 scope remains quality-focused

### Gate B — After Phase 1

Before frontend polish:

- confirm backend contracts are stable
- confirm validation/error behavior
- confirm search/filter/sort behavior
- confirm cascade delete behavior

### Gate C — After Phase 3

Before QA docs expansion:

- confirm core app behavior is stable
- confirm dashboard/attention behavior
- confirm no frontend duplicate business logic

### Gate D — Before Merge of V2 Final

Before considering V2 complete:

- run final regression
- review README
- review docs consistency
- check CI
- check branch history
- check untracked files

---

## 8. Final Note

V2 should demonstrate that ApplyFlow was developed with:

- controlled scope
- stable backend contracts
- reliable frontend states
- access-control awareness
- validation discipline
- practical regression testing
- honest documentation

The goal is not to make ApplyFlow larger.

The goal is to make ApplyFlow more credible.
