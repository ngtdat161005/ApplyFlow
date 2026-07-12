# ApplyFlow Test Plan

This plan defines the default checks for V2 branches. Add task-specific checks in the PR when a change touches behavior not covered here.

## V2-02 Strategy Notes

V2-01 verified source-level implementation evidence and ran the safe local checks, but it did not run backend HTTP E2E, browser/manual regression, or inspect remote CI results. Later task reports must keep those areas separate from the verified baseline until they are actually executed.

Current implementation details that are not guaranteed V1 baseline behavior:

- Dashboard status counts currently use `countsByStatus`; V2 examples use `statusCounts`. V2-12 owns the contract decision, and V2-13 must follow it.
- Dashboard `recentApplications` currently exists, but it is V2 polish/current implementation detail to verify in V2-12/V2-13.
- `followUpAt` sorting is not baseline behavior. It is only required if V2-04 implements it as an application-list contract improvement.

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

## Local Frontend Checks

Run this before opening a PR for frontend changes:

```sh
cd frontend
npm run build
```

For manual browser QA:

```sh
cd frontend
npm run dev
```

## Manual QA Evidence

Record:

- Browser and viewport used.
- Test account or fixture data used.
- Main happy path verified.
- Permission or unauthorized path verified when access control is involved.
- Screenshots or notes for any visual changes.

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
