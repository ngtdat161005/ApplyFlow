# ApplyFlow V2 Final Regression and Release Audit

## 1. Audit Metadata

| Field | Recorded value |
|---|---|
| Audit date | 2026-07-19 (Asia/Saigon) |
| Tester | Codex browser automation and repository checks |
| Task branch | `codex/v2-18-final-regression-audit` |
| Product commit tested | `3f7393d8a98ee828d7138c00bfbdc38593227693` |
| Product commit context | V2-17 merge commit on clean, updated `main` |
| OS | Windows |
| Node.js / npm | `v20.20.2` / `10.8.2` |
| Backend origin | `http://127.0.0.1:4000` |
| Frontend origin | `http://127.0.0.1:5173` |
| Database | Configured remote MongoDB SRV; reachable; credentials redacted |
| Release verdict | **READY WITH KNOWN RISKS** |

The product commit contains V2-17 and all earlier V2 source changes. V2-16 and V2-17 changed documentation only after the historical full checkpoint, so this audit used proportionate automated reruns and a separate final critical-path browser smoke. It does not overwrite or reclassify the historical 101-case results.

## 2. Environment Readiness

- Backend and frontend dependency directories were present.
- The repository root environment file was present. `backend/.env` and `frontend/.env` were absent, which is supported by the documented root environment lookup and optional frontend environment behavior.
- No local `mongod` command, MongoDB service, or port `27017` listener was available.
- Starting the backend and receiving HTTP `200` from `/health` established that the configured remote database was reachable.
- Ports `4000` and `5173` were initially free.
- GitHub CLI authentication was active. No token or credential value was recorded.

## 3. Automated Verification

| Command | Result | Exit code | Concise evidence |
|---|---|---:|---|
| `cd backend; npm run check:attention` | PASS | 0 | `Attention domain checks passed.` |
| `cd backend; npm run check:backend-hardening` | PASS | 0 | `Backend hardening checks passed.` |
| `cd backend; node --check scripts/check-backend-e2e.js` | PASS | 0 | Node syntax check completed without output or errors. |
| `cd backend; npm run check:e2e` | PASS | 0 | Live HTTP/database E2E completed all scripted scenarios. |
| `cd frontend; npm run build` | PASS | 0 | Vite `8.1.3` transformed 62 modules and built in 618 ms. |

These results prove their named scripted and build scopes. They do not turn blocked browser cases into passes or prove every visual, timing, keyboard, or native-control behavior.

## 4. Backend HTTP E2E

The backend was started with `node src/server.js`, which is the command invoked by the repository's `npm run dev` and `npm start` scripts. The health endpoint returned HTTP `200`, then `npm run check:e2e` passed:

- health
- registration, login, current-user lookup, and authentication errors
- application validation, CRUD, not-found, and ownership behavior
- application company/role search, whitespace handling, status filtering, default sorting, all supported sorts, and query validation
- event parent ownership, validation, CRUD, null clearing, wrong-parent access, cross-user access, and timeline ordering
- dashboard user scoping, exact `countsByStatus` shape, all six status keys, `recentApplications` limit, and empty dashboard
- user-scoped application/event cascade deletion

The E2E script removed its application and event fixtures. Two successful disposable user registrations from the E2E run remain because ApplyFlow has no user-delete endpoint.

## 5. Final Critical-Path Browser Smoke

The final smoke ran against the real frontend, backend, and configured database. It sampled the canonical checklist by critical flow instead of repeating all 101 cases.

| Area | Result | Evidence observed |
|---|---|---|
| Register, login, logout | PASS | Two disposable users registered; registration success returned to login with email preserved; both users logged in; logout returned to login. |
| Protected redirect and refresh | PASS | Logged-out direct detail access redirected to `/login` without private content; authenticated dashboard and detail refresh restored the correct user and route. |
| Dashboard empty state | PASS | A new account showed `No applications yet` and the applications action. |
| Dashboard populated state and counts | PASS | Two applications produced total `2`, `in_process: 1`, `offer: 1`, and zero for the other four `countsByStatus` values; recent applications and subsection empty states rendered. |
| Application list/search/filter/sort | PASS | Empty and populated lists rendered; company search returned one match; offer filtering returned one match; reset restored both records; `createdAt asc` displayed the older record first. |
| Application create/update/delete | PASS | Two applications were created; one was updated from Applied to In Process with a changed role; both were deleted through the UI. |
| Detail refresh and unavailable routes | PASS | Direct detail refresh restored the updated application; malformed and cross-user detail URLs showed controlled `Application unavailable` states without event controls. |
| Event create/update/delete | PASS | Two events were created; one title/mode was updated; one event was deleted; the remaining event persisted until parent deletion. |
| Timeline ordering | PASS WITH LIMITATION | Two created-date fallback events retained the same ascending order after refresh. Effective-date precedence and tie behavior passed in live backend E2E. Native datetime automation is recorded separately below. |
| Visible cascade behavior | PASS | Deleting the parent removed its detail and event UI; an unrelated application remained; dashboard total changed from `2` to `1`. |
| Cross-user isolation | PASS | User B had an empty dashboard, could not view User A's detail, saw the same unavailable state, and had no application/event mutation controls for User A data. |
| API error and retry | PASS | With the backend deliberately stopped, the in-session application list showed `Could not load applications` and `Try again`; after restart, retry restored the current list. |
| Desktop responsive sanity | PASS | At `1280x800`, dashboard, application list, and detail had no horizontal document overflow. |
| Mobile responsive sanity | PASS | At `375x667`, auth, populated dashboard, application list/controls, and detail/actions fit without horizontal document overflow; screenshots showed readable wrapping and reachable controls. |
| Browser console | PASS | Zero warning/error entries were recorded at the end of the run. |

Relevant canonical rows and sections sampled included `AUTH-01`, `AUTH-06`, `ROUTE-01`, `ROUTE-02`, `ROUTE-03`, `ROUTE-06`, `DASH-02`, `DASH-03`, `DASH-07`, `DASH-09`, `LIST-02`, `LIST-03`, `LIST-04`, `LIST-09`, `LIST-10`, `LIST-11`, `LIST-14`, `DETAIL-02`, `DETAIL-03`, `CASCADE-01`, `XUSER-01`, `XUSER-02`, `ERROR-02`, and `RESP-01` through `RESP-04`. Application and event create/update/delete sections were also sampled with smaller fixtures than the full checklist specifies; those rows were not reclassified in the historical record.

## 6. Historical Full Checkpoint

The authoritative full checkpoint remains documented in [V2 test evidence](v2-test-evidence.md):

- branch: `main`
- commit: `e0d388294266610525cf8ad2d406266ae76cc981`
- GitHub Actions run: [29656398297](https://github.com/ngtdat161005/ApplyFlow/actions/runs/29656398297)
- PASS: 79
- BLOCKED: 19
- NOT APPLICABLE: 3
- FAIL: 0
- NOT RUN: 0
- total unique testcase IDs: 101

Blocked IDs remain:

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

Not-applicable IDs remain `APP-C-08`, `APP-U-05`, and `EVENT-F-05`. This final smoke does not convert any of those results to PASS.

## 7. Remote CI

Latest `main` workflow before the V2-18 documentation commit:

| Field | Result |
|---|---|
| Run | [29671871244](https://github.com/ngtdat161005/ApplyFlow/actions/runs/29671871244) |
| Commit | `3f7393d8a98ee828d7138c00bfbdc38593227693` |
| Backend checks job | PASS |
| Frontend build job | PASS |
| Overall conclusion | SUCCESS |

The workflow reruns the focused backend checks and frontend build. It does not run MongoDB-backed E2E or browser regression.

## 8. Cleanup

- All applications and events created by the final E2E and browser smoke were removed.
- Four successful disposable users from this V2-18 run remain: two from E2E and two from browser smoke. ApplyFlow has no user-delete endpoint. The total database user count was not queried, so pre-existing QA users are not included in that number.
- Backend and frontend processes started by this audit were stopped.
- Browser tabs were closed and the temporary viewport override was reset.
- Six temporary backend/frontend log files were removed.
- Ports `4000`, `5173`, and `27017` had no listeners after cleanup.

## 9. Skipped or Limited Areas

- The full 101-case browser checklist was not rerun because V2-16 and V2-17 changed documentation only. Its historical results remain authoritative.
- Reliable request reordering, delayed duplicate-submit observation, authenticated `401` injection, and full keyboard sequencing were not repeated in the final smoke.
- Browser automation set a native `datetime-local` DOM value, but that value was not persisted through the automated React interaction. No manual keyboard interaction was performed, so native datetime entry was not claimed as passed or failed. Backend date validation and effective timeline ordering passed in hardening/E2E.
- GitHub Actions does not run the live database E2E or browser smoke.

## 10. Documentation Consistency

- README setup, startup, route, check, E2E prerequisite, CI, and known-limitation statements matched the repository and this run.
- README correctly links detailed evidence instead of claiming all 101 manual cases passed.
- `countsByStatus` remains the authoritative dashboard field, `recentApplications` remains documented V2 polish, and `followUpAt` sorting remains a V2-04 extension.
- No README follow-up issue was found. README was not edited in V2-18.

## 11. Known Risks

- Historical timing, authenticated-401, duplicate-busy-state, native-date, and keyboard evidence gaps remain as documented.
- Live E2E depends on an available disposable MongoDB environment and is not enforced by current CI.
- Successful QA users accumulate unless the configured database is cleaned outside the product API.
- The final browser smoke used a focused fixture, not the six-status/full-date matrix from the canonical 101-case checklist.

## 12. Final Verdict

**READY WITH KNOWN RISKS**

No product defect was found. All required focused checks, live backend E2E, frontend build, latest-main CI inspection, and final critical-path smoke passed within their recorded scope. Remaining limitations are explicit evidence and environment risks, not hidden passes.
