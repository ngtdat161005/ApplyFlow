# ApplyFlow Test Plan

This plan defines the preserved V2 checks and the V3 additions. Add task-specific checks in the PR
when a change touches behavior not covered here.

Recorded V2 execution evidence and the reusable future-run template are in [v2-test-evidence.md](v2-test-evidence.md).

## V2-02 Strategy Notes

V2-01 verified source-level implementation evidence and ran the safe local checks, but it did not run backend HTTP E2E, browser/manual regression, or inspect remote CI results. Later task reports must keep those areas separate from the verified baseline until they are actually executed.

Current implementation details that are not guaranteed V1 baseline behavior:

- Dashboard status counts use `countsByStatus`, preserved by V2-12 and consumed by V2-13; `statusCounts` is not the active contract.
- Dashboard `recentApplications` remains V2 polish/current implementation detail, verified with a limit of five by V2-12/V2-13.
- `followUpAt` sorting is not baseline behavior; V2-04 owns it as an explicit application-list contract improvement.

## CI Checks

GitHub Actions runs checks that do not require external secrets:

```sh
cd backend
npm ci
npm run check:attention
npm run check:backend-hardening
```

```sh
cd frontend
npm ci
npm run build
```

## Local Backend Checks

Run these before opening a PR for backend changes:

```sh
cd backend
npm run check:attention
npm run check:backend-hardening
```

Run the backend E2E check only when a local backend and database are available:

```sh
cd backend
npm run dev
```

In another terminal:

```sh
cd backend
npm run check:e2e
```

Use `APPLYFLOW_BACKEND_ORIGIN` if the backend is not running at the default origin.

Run E2E only against a disposable MongoDB database, never a production or personal database. The
script creates run-specific users, applications, and events, and deletes current-run applications
and their events where the API permits. The general E2E script still leaves some successful
disposable registrations even though V3 provides authenticated account deletion, so record and
clean up any retained users in the selected disposable database after the run.

## Local Frontend Checks

Run this before opening a PR for frontend changes:

```sh
cd frontend
npm run check:v3-query-qa
npm run build
```

`check:v3-query-qa` uses deterministic logic assertions, a 30-record synthetic in-memory cache,
and focused source-contract checks. It does not prove browser rendering, live HTTP behavior, or a
real database.

For manual browser QA:

```sh
cd frontend
npm run dev
```

## Manual QA Evidence

Use [frontend/docs/manual-frontend-testcases.md](../frontend/docs/manual-frontend-testcases.md) as
the canonical detailed V2 browser-regression checklist. Create an execution copy or branch-specific
record before changing testcase results; all canonical case results remain `NOT RUN`. Keep
environment-dependent failure-injection and two-user cases separate from ordinary live-environment
execution.

Use [frontend/docs/manual-v3-testcases.md](../frontend/docs/manual-v3-testcases.md) for V3
query/cache, forgot/reset password, settings deletion, accessibility, responsive, motion, skeleton,
background-refetch, and 20–50 record scenarios. Record a current run with
[the V3 evidence template](v3-qa-evidence-template.md); do not edit either canonical checklist to
claim execution.

Record:

- Browser and viewport used.
- Test account or fixture data used.
- Main happy path verified.
- Permission or unauthorized path verified when access control is involved.
- Screenshots or notes for any visual changes.

## V3 Environment-Dependent Checks

The V3 backend hardening command is mock/source evidence for forgot/reset/delete security
orchestration and controlled errors. It is not real transaction evidence.

The existing `npm run check:e2e` directly inspects MongoDB topology before its reset/delete
transaction assertions. Run it only against an explicitly disposable replica set. Record a real
replica-set PASS only when the current run reports both a replica-set name and logical-session
support; syntax checks, mocks, and standalone Mongo are separate evidence classes.

For the disposable 30-application HTTP matrix, start the backend against the confirmed disposable
database, then run:

```powershell
cd backend
$env:V3_QA_DISPOSABLE_CONFIRM='YES'
npm run check:v3-large-dataset
Remove-Item Env:V3_QA_DISPOSABLE_CONFIRM
```

Without the exact confirmation, the helper prints `SKIPPED` and performs no writes. It validates
list/search/filter/sort/dashboard behavior and attempts account-deletion cleanup. On a database
without transaction support it removes the created applications and reports that the synthetic
user remains. A successful HTTP cleanup does not by itself prove replica-set topology.

Keep evidence classes separate:

- `check:backend-hardening`: deterministic mock/source assertions;
- `check:e2e`: live HTTP/database plus explicit real-replica-set transaction scenarios;
- `check:v3-large-dataset`: live HTTP with 30 disposable synthetic applications;
- `check:v3-query-qa`: frontend logic, synthetic Query cache, and source inspection;
- browser/manual: rendered behavior at recorded browser/viewport/input preferences;
- GitHub CI: only the commands configured in the inspected workflow revision.

## Per-Task Verification Expectations

Use these expectations with the task-specific instructions in `docs/v2-tasks.md`.

| Task group | Automated checks | Manual/browser evidence |
|---|---|---|
| Backend contract tasks V2-03 through V2-06 | `npm run check:attention`; `npm run check:backend-hardening`; `npm run check:e2e` when backend/database are available | API/manual notes for changed endpoints, especially validation, malformed IDs, cross-user access, and cascade behavior |
| Frontend page tasks V2-07 through V2-10 | `npm run build` from `frontend` | Small page-specific browser notes for loading, empty, error, validation, navigation, refresh, and responsive sanity |
| Dashboard/attention tasks V2-11 through V2-13 | Backend checks for V2-11/V2-12; frontend build for V2-13; E2E when available | Dashboard/attention scenario notes, including status count naming, `recentApplications` if present, upcoming events, and attention flag separation |
| QA docs tasks V2-14 through V2-16 | Commands named in each task; do not invent passed checks | Review evidence quality, skipped-check explanations, disposable data strategy, and manual checklist usability |
| README/final audit tasks V2-17 and V2-18 | README diff for V2-17; final backend/frontend/E2E checks for V2-18 when available | README setup/testing accuracy for V2-17; final manual regression and CI status for V2-18 when available |

If a check is environment-dependent, report it as `SKIPPED` with the exact reason. Do not describe skipped E2E, browser QA, or remote CI as passed.
