# ApplyFlow V3 QA Evidence Template

Copy this template for a specific commit/run. Do not put execution results into the canonical
testcase documents and do not copy secrets, private user data, access tokens, reset links, token
hashes, or provider payloads into committed evidence.

## Run Metadata

| Field | Value |
|---|---|
| Date/time and timezone | |
| Tester | |
| Branch | |
| Commit | |
| OS | |
| Node.js/npm | |
| Frontend/backend origins | |
| Browser/version and viewports | |
| Database topology | `not used` / `mock` / `standalone` / `replica set` |
| Disposable database confirmation | |
| Synthetic fixture description/count | |

## Automated Commands

| Evidence class | Command | PASS / FAIL / SKIPPED | Exit code | What it proves | What it does not prove / exact skip reason |
|---|---|---|---:|---|---|
| Local automated | `cd backend; npm run check:attention` | | | | |
| Mock/source | `cd backend; npm run check:backend-hardening` | | | | |
| Syntax only | `cd backend; node --check scripts/check-backend-e2e.js` | | | | |
| HTTP + replica set | `cd backend; npm run check:e2e` | | | | |
| HTTP large dataset | `cd backend; npm run check:v3-large-dataset` | | | | |
| Logic/synthetic cache/source | `cd frontend; npm run check:v3-query-qa` | | | | |
| Build | `cd frontend; npm run build` | | | | |
| Diff hygiene | `git diff --check` | | | | |

For the large-dataset command, set `V3_QA_DISPOSABLE_CONFIRM=YES` only after the selected database
has been explicitly confirmed disposable. A zero exit code containing `SKIPPED` is still
`SKIPPED`, not `PASS`.

## Security Contract Matrix

| Contract | Mock/source | Standalone Mongo | Real replica set | HTTP E2E | Browser/manual | Result/notes |
|---|---|---|---|---|---|---|
| Forgot-password generic response and replacement | | | | | | |
| Email/IP rate limits and trusted proxy | | | | | | |
| Provider failure cleanup and secret-safe logs | | | | | | |
| Reset expiry/one-time use/password update | | | | | | |
| Concurrent reset and old-JWT invalidation | | | | | | |
| Reset unsupported transaction / rollback | | | | | | |
| Delete wrong password and cross-user safety | | | | | | |
| Delete cascade commit and mid-cascade rollback | | | | | | |
| Delete unsupported transaction | | | | | | |

Do not place `PASS` in the real-replica-set column unless the current run recorded topology evidence
(`hello.setName` and logical sessions) and executed the transaction scenarios. Mocked transaction
tests and a successful standalone source check are not substitutes.

## Query and Browser Matrix

| Area | Automated logic/cache | Source inspection | HTTP E2E | Browser/manual | Result/notes |
|---|---|---|---|---|---|
| Canonical query keys and retry policy | | | | | |
| Create/update/delete invalidation | | | | | |
| Deleted detail and nested event cache clearing | | | | | |
| Initial skeleton geometry/accessibility | | | | | |
| Background refetch and background error | | | | | |
| Forgot/reset/settings keyboard and responsive states | | | | | |
| Reduced motion and touch/coarse-pointer parallax | | | | | |
| 20–50 synthetic application list | | | | | |

## Manual Result Summary

| Result | Count |
|---|---:|
| PASS | |
| FAIL | |
| BLOCKED | |
| NOT RUN | |
| NOT APPLICABLE | |
| Total unique V3 testcase IDs | |

Failed IDs and defect links:

-

Blocked, skipped, not-run, and not-applicable IDs with exact reasons:

-

## GitHub CI

| Field | Value |
|---|---|
| Workflow URL | |
| Commit checked | |
| Backend configured checks | |
| Frontend configured checks | |
| Overall conclusion | |
| Explicitly not covered by CI | Live database E2E, browser/manual QA, real-provider delivery unless the workflow is intentionally changed |

## Cleanup and Secret Review

| Field | Value |
|---|---|
| Applications/events removed | |
| Disposable users removed/retained count | |
| Reset-token fixtures removed | |
| Processes/ports/logs cleaned | |
| Evidence secret scan command/result | |
| Any retained disposable data and reason | |

## Verdict

| Field | Value |
|---|---|
| PASS / FAIL / SKIPPED summary | |
| Unverified items | |
| Risks and limitations | |
| Merge recommendation | |
| Human approval required | |
