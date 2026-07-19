# ApplyFlow V2 Test Evidence

This document records what was actually verified for ApplyFlow V2, what each check proves, and what remains limited. It complements the [test plan](test-plan.md), the [canonical frontend manual regression checklist](../frontend/docs/manual-frontend-testcases.md), and the separate [final V2 regression audit](v2-final-regression.md).

## 1. Evidence Metadata

| Field | Recorded value |
|---|---|
| Checkpoint date | 2026-07-19 (Asia/Saigon) |
| Branch | `main` |
| Commit | `e0d388294266610525cf8ad2d406266ae76cc981` |
| Commit context | V2-15 merge commit |
| Environment | Windows, Node.js `v20.20.2`, npm `10.8.2` |
| Backend origin | `http://127.0.0.1:4000` |
| Frontend origin | `http://127.0.0.1:5173` |
| Database | Configured remote MongoDB SRV; reachable during the checkpoint; credentials redacted |
| Remote CI | [GitHub Actions run 29656398297](https://github.com/ngtdat161005/ApplyFlow/actions/runs/29656398297) |
| Checkpoint verdict | **READY WITH DOCUMENTED LOW/MEDIUM RISKS** |

No product failures were found during this checkpoint. Manual results were 79 PASS, 19 BLOCKED, and 3 NOT APPLICABLE. Blocked and not-applicable cases are not passes.

## 2. Automated Checks

| Command | Result | Exit code | What it proves | What it does not prove |
|---|---|---:|---|---|
| `cd backend; npm run check:attention` | PASS | 0 | Deterministic attention and timeline domain assertions passed. | It does not prove HTTP routing, MongoDB integration, authentication middleware, or browser display. |
| `cd backend; npm run check:backend-hardening` | PASS | 0 | Focused backend validation, error, ownership-filter, contract, and dashboard hardening assertions passed. | It does not replace live HTTP/database E2E or visual frontend testing. |
| `cd backend; node --check scripts/check-backend-e2e.js` | PASS | 0 | The E2E script parsed successfully in Node.js. | Syntax success does not prove any scenario ran or passed. |
| `cd backend; npm run check:e2e` | PASS | 0 | The live backend and configured disposable MongoDB database passed the HTTP E2E scenarios summarized below. | It does not prove every frontend state, responsive layout, browser race, or manual testcase. |
| `cd frontend; npm run build` | PASS | 0 | Vite produced a production bundle; 62 modules were transformed. | A build does not prove runtime UI behavior, accessibility, routing races, or API integration. |
| `git diff --check` | PASS | 0 | The checkpoint found no whitespace-error diff. | It does not validate application behavior or documentation accuracy. |

The backend attention and hardening commands are focused assertion scripts. They are useful, repeatable evidence for their named domains, but they must not be described as complete backend integration coverage.

## 3. Backend HTTP E2E

The checkpoint started the real backend at `http://127.0.0.1:4000` and used the configured remote MongoDB SRV with disposable data. `npm run check:e2e` completed successfully.

Passed E2E areas:

- health endpoint
- registration, login, current-user lookup, and authentication error paths
- application create, list, detail, update, delete, and validation
- company/role search, whitespace normalization, status filtering, and supported sorting
- `followUpAt` sorting behavior
- malformed IDs and controlled not-found behavior
- cross-user application access
- event create, list, update, delete, validation, ordering, and wrong-parent behavior
- cross-user event access
- dashboard response shape and authenticated-user scoping
- `countsByStatus` and all six status keys
- `recentApplications` limit of five
- successful empty dashboard
- application/event cascade cleanup

This run proves the scripted live HTTP/database scenarios passed against the recorded commit and environment. It does not prove every browser-rendered loading, empty, error, responsive, keyboard, or stale-response state.

The E2E script deleted current-run applications and their events where the API permits. Successful disposable user registrations remained because ApplyFlow has no user-delete endpoint.

## 4. Frontend Build

`cd frontend; npm run build` passed with 62 modules transformed. This confirms that the V2 frontend source compiled into a production bundle at the recorded commit.

Build success does not prove that:

- the browser can reach the backend
- authentication or protected routes work at runtime
- forms submit the expected payloads
- loading, empty, and error states are visually correct
- desktop/mobile layouts avoid every overflow or overlap
- manual regression cases passed

Those concerns require live browser evidence.

## 5. Manual and Browser Regression

The [canonical 101-case checklist](../frontend/docs/manual-frontend-testcases.md) was used for the full checkpoint. Every unique testcase ID received exactly one result.

| Section | PASS | BLOCKED | NOT APPLICABLE |
|---|---:|---:|---:|
| Authentication | 9 | 2 | 0 |
| Protected routes | 5 | 2 | 0 |
| Dashboard | 7 | 3 | 0 |
| Application list | 15 | 1 | 0 |
| Application CRUD | 12 | 5 | 2 |
| Application detail | 5 | 2 | 0 |
| Event timeline/forms | 12 | 2 | 1 |
| Cascade | 1 | 0 | 0 |
| Cross-user | 3 | 0 | 0 |
| API failures/races | 6 | 1 | 0 |
| Responsive/keyboard | 4 | 1 | 0 |
| **Total** | **79** | **19** | **3** |

There were 0 FAIL and 0 NOT RUN results.

Blocked testcase IDs:

- `AUTH-08`, `AUTH-09`
- `ROUTE-05`, `ROUTE-07`
- `DASH-01`, `DASH-05`, `DASH-11`
- `LIST-01`
- `APP-C-02`, `APP-C-07`, `APP-C-09`
- `APP-U-04`, `APP-U-06`
- `DETAIL-01`, `DETAIL-06`
- `EVENT-F-03`, `EVENT-F-08`
- `ERROR-07`
- `RESP-05`

Not-applicable testcase IDs:

- `APP-C-08`
- `APP-U-05`
- `EVENT-F-05`

The live browser pass covered authentication, protected routes, dashboard data and empty states, application list controls and CRUD, detail routes, event timeline/forms, cascade behavior, two-user ownership, selected API failures/retries, and desktop/mobile layout sanity. Browser console warnings/errors recorded at the end of the run: zero.

No mock-backed case was claimed. Manual/browser regression proves only the cases and environment recorded for that run; it is not a substitute for future regression after behavior changes.

## 6. Remote CI

GitHub Actions run [29656398297](https://github.com/ngtdat161005/ApplyFlow/actions/runs/29656398297) inspected commit `e0d388294266610525cf8ad2d406266ae76cc981`.

| CI area | Result |
|---|---|
| Backend attention/hardening job | PASS |
| Frontend build job | PASS |
| Overall workflow conclusion | SUCCESS |

Remote CI reran the repository's no-secret backend checks and frontend build in GitHub Actions. It did not run the live MongoDB-backed E2E script or the 101-case browser checklist.

## 7. Environment Limitations

- No local `mongod` executable or MongoDB service was available. The configured remote disposable MongoDB database was reachable and was used for E2E and browser QA.
- Reliable request throttling/reordering and authenticated `401` injection were not available for every race-focused browser case.
- The browser runtime could not safely drive or malformed-submit every native `datetime-local` control.
- Keyboard sequencing support was insufficient for the complete keyboard testcase.
- Four disposable users created by the combined checkpoint/E2E activity remained because the product has no user-delete endpoint.

All checkpoint applications and events were deleted. Backend/frontend processes were stopped, browser tabs were closed, temporary logs were removed, and ports `4000` and `5173` were released.

## 8. Known Risks

- The 19 blocked cases remain evidence gaps for timing, stale-response, authenticated-401, duplicate-busy-state, native-date, and keyboard interactions.
- The 3 native malformed-date cases remain not applicable to the available browser tooling; backend date validation is separately covered by hardening/E2E assertions.
- E2E is environment-dependent and is not part of the current no-secret GitHub Actions workflow.
- Disposable test users accumulate unless the selected database is cleaned outside the application API.
- The historical checkpoint applies to its recorded commit. Future source changes require proportionate reruns.

## 9. Future-Run Evidence Template

Copy this section into a new execution record. Do not edit historical results in this document to represent a different run.

### Run Metadata

| Field | Value |
|---|---|
| Date/time and timezone | |
| Tester | |
| Branch | |
| Commit | |
| OS | |
| Node.js/npm versions | |
| Backend/frontend origins | |
| Database type and disposable-data confirmation | |

### Commands

| Command | PASS / FAIL / SKIPPED | Exit code | Concise evidence or exact skip reason |
|---|---|---:|---|
| `cd backend; npm run check:attention` | | | |
| `cd backend; npm run check:backend-hardening` | | | |
| `cd backend; node --check scripts/check-backend-e2e.js` | | | |
| `cd backend; npm run check:e2e` | | | |
| `cd frontend; npm run build` | | | |
| `git diff --check` | | | |

### Manual Results

| Result | Count |
|---|---:|
| PASS | |
| FAIL | |
| BLOCKED | |
| NOT RUN | |
| NOT APPLICABLE | |
| Total unique testcase IDs | |

Blocked, skipped, and not-applicable IDs with exact reasons:

-

### CI, Cleanup, and Verdict

| Field | Value |
|---|---|
| CI URL and commit | |
| Backend CI result | |
| Frontend CI result | |
| Overall CI conclusion | |
| Applications/events cleanup | |
| Disposable users remaining | |
| Processes/ports/log cleanup | |
| Defects and severity | |
| Known risks | |
| Release verdict | |
