# ApplyFlow V3 Manual and Browser QA Checklist

This is the V3 companion to the preserved
[V2 manual regression checklist](manual-frontend-testcases.md). It covers the V3 query/cache,
password-reset, account-settings, motion, skeleton, and large-dataset risks. Run the affected V2
cases as regression; this document does not replace or reclassify historical V2 evidence.

## Result and Evidence Rules

Use exactly one result per case: `NOT RUN`, `PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE`.
Record mock, source-inspection, standalone-Mongo, real replica-set, HTTP E2E, browser/manual, and
GitHub CI results separately. A result from one class is not proof for another class.

- Never place passwords, access tokens, reset-token values, private email addresses, connection
  strings, or provider credentials in notes, screenshots, console captures, or committed evidence.
- Use only disposable accounts and synthetic application data. Confirm the database is disposable
  before any HTTP E2E or large-list seed.
- Record the exact reason for every `BLOCKED`, `SKIPPED`, or `NOT APPLICABLE` result.
- Do not call a browser case passed from a successful build or source inspection.

## Execution Record

| Field | Value |
|---|---|
| Tester | |
| Date/time and timezone | |
| Branch and commit | |
| OS and Node.js/npm versions | |
| Browser and version | |
| Desktop viewport | |
| Mobile viewport | |
| Frontend/backend origins | |
| Database topology | `mock` / `standalone` / `replica set` / `not used` |
| Disposable database confirmed by | |
| Synthetic fixture count | |
| Reduced-motion method | |
| Touch/coarse-pointer method | |

## Query, Cache, and Async States

| ID | Preconditions | Steps | Expected result | Result | Evidence/notes |
|---|---|---|---|---|---|
| V3-QRY-01 | Authenticated; application list request can be observed. | Apply padded search plus status/sort/order, repeat the same canonical values, then change one value. | Padded and canonical values share one logical query; an actual filter change uses a distinct query. No duplicate/stale list replaces the current result. | NOT RUN | |
| V3-QRY-02 | Disposable account; Network panel open. | Create an application, then inspect list and dashboard without a full reload. | Application lists and dashboard summary refetch. The new record/count appears once. | NOT RUN | Record request names/counts, not headers. |
| V3-QRY-03 | Existing application detail and list have been loaded. | Update the application from list, then from detail. | Exact detail, all lists, and dashboard become current; an event list is not discarded merely because application metadata changed. | NOT RUN | |
| V3-QRY-04 | Target application detail/events and an unrelated control application are cached. | Delete the target from list; repeat from detail with a fresh target; use Back/forward and revisit saved URLs. | Deleted detail and nested event cache are cleared. Lists/dashboard refresh. No deleted content flashes or reappears. Control data remains. | NOT RUN | |
| V3-QRY-05 | Detail has events and dashboard is loaded. | Create, update, and delete separate disposable events. | Exact event timeline and dashboard refresh after each mutation. Application lists/details are not needlessly cleared. | NOT RUN | |
| V3-QRY-06 | First request can be delayed. | Open dashboard, applications, and detail in fresh query states. | Geometry-matched skeletons appear only for unresolved initial loads; stale content is not presented as current. Screen-reader status text identifies loading. | NOT RUN | |
| V3-QRY-07 | Resolved data exists; subsequent request can be delayed and then failed. | Trigger background refetch on dashboard/list/detail/events, observe pending state, then return a controlled error and retry. | Resolved data remains visible, a polite updating status appears, background failure is explicit, and retry can recover. Initial skeleton does not replace resolved data. | NOT RUN | |
| V3-QRY-08 | Controlled 400, 401, network, and 503 responses are available. | Trigger each class from a query and count attempts. | 400/401 are not retried. Network/5xx retries at most once. A stale old-session 401 does not clear a newer session. | NOT RUN | Never capture Authorization values. |

## Forgot and Reset Password

| ID | Preconditions | Steps | Expected result | Result | Evidence/notes |
|---|---|---|---|---|---|
| V3-FORGOT-01 | Existing disposable address and a syntactically valid missing address. | Submit each separately with comparable conditions. | Both return the same status, body, and visible generic success copy. Account existence is not revealed. | NOT RUN | Use sanitized labels `existing` / `missing`. |
| V3-FORGOT-02 | Disposable existing account; database inspection is authorized. | Request two reset links for the same account. | Exactly one current hashed token remains; the second replaces the first; raw values are not stored. | NOT RUN | Database evidence must omit hashes and raw tokens. |
| V3-FORGOT-03 | Controlled per-email and per-IP limits. | Exceed each limit for existing and missing accounts. | Controlled `RESET_RATE_LIMITED` response is consistent and does not reveal account existence. Trusted proxy policy is preserved. | NOT RUN | |
| V3-FORGOT-04 | Mock/fake provider can fail. | Force provider failure after token creation and inspect sanitized operational logs. | Request remains enumeration-safe; newly created token is removed; logs contain only the safe event name and no address, token, or provider-private detail. | NOT RUN | Classify as mock/source unless a real provider is intentionally used. |
| V3-RESET-01 | Missing, malformed, expired, already-used, and superseded links are available. | Open/submit each link. | One controlled invalid/expired state appears, fields are cleared where specified, focus moves to the alert, and no password changes. | NOT RUN | Never record link query values. |
| V3-RESET-02 | Valid disposable link and an already-authenticated old session. | Reset successfully; try old password, new password, and old protected session. | Reset does not auto-login; old password and old JWT fail; new password works; success returns to login with readable status. | NOT RUN | |
| V3-RESET-03 | Real replica-set disposable DB and two concurrent clients. | Submit the same valid reset concurrently. | Exactly one succeeds, one receives `INVALID_TOKEN`, password changes once, tokenVersion increments once, and transaction rollback/commit are proven on the replica set. | NOT RUN | `PASS` requires topology evidence, not a mock. |
| V3-RESET-04 | Standalone Mongo or forced transaction-unavailable mock. | Attempt valid reset. | Controlled `RESET_UNAVAILABLE`/503 appears; password/token state does not partially change; private transaction details are absent. | NOT RUN | State whether standalone runtime or mock. |

## Settings and Account Deletion

| ID | Preconditions | Steps | Expected result | Result | Evidence/notes |
|---|---|---|---|---|---|
| V3-DELETE-01 | Authenticated account with owned records. | Open dialog, submit blank then wrong password, cancel by button and Escape. | Focus enters password field; field error is announced; wrong password causes no mutation; cancel restores focus to the opener. | NOT RUN | |
| V3-DELETE-02 | Real replica-set disposable account with applications, events, and reset-token fixture. | Confirm deletion with correct password. | User, owned applications/events/reset tokens are deleted atomically; local auth clears; old JWT and login fail; protected Back navigation reveals no private data. | NOT RUN | `PASS` requires real replica-set evidence. |
| V3-DELETE-03 | Forced mid-cascade failure on a real replica set. | Trigger failure after at least one transactional delete step. | Entire cascade rolls back; user and every owned record remain. No partial deletion is visible. | NOT RUN | Mock rollback is a separate result. |
| V3-DELETE-04 | Standalone Mongo or forced unsupported-transaction mock. | Confirm deletion. | Controlled `DELETE_UNAVAILABLE`/503 appears and all data remains. The dialog stays usable. | NOT RUN | |
| V3-DELETE-05 | Disposable User A and User B. | Delete A; inspect B before/after. Also attempt to include a body user ID when allowed by controlled API tooling. | Only authenticated A is targeted; body user ID is rejected; B user/applications/events stay intact. | NOT RUN | |

## Large Dataset (20–50 Synthetic Applications)

Use 30 records by default, distributed across all six statuses, with varied created/updated dates,
past/future/null follow-up dates, literal search characters, and long but non-private strings. The
committed HTTP helper uses 30. Do not use real job-search data.

| ID | Preconditions | Steps | Expected result | Result | Evidence/notes |
|---|---|---|---|---|---|
| V3-LARGE-01 | Explicitly disposable environment. | Run the approved seed/helper and confirm exactly 30 records. | Six statuses contain five records each; dates include past, future, and null cases; no private data is used. | NOT RUN | Record cleanup strategy before seeding. |
| V3-LARGE-02 | 30-record fixture loaded. | Exercise default sort, every supported sort/order, status filters, literal/padded search, combined filtered-empty, and reset. | Results are correct and stable; controls remain responsive; no duplicate cards or stale filter results appear. | NOT RUN | Record expected/observed counts, not record contents. |
| V3-LARGE-03 | Dashboard and detail/timeline available. | Compare list totals/status distribution, open several details, mutate one record/event, then return. | Dashboard total/status counts remain exact; targeted cache refresh occurs; unrelated cached data is stable. | NOT RUN | |
| V3-LARGE-04 | Desktop and 375px mobile viewports. | Scroll full list, open filters/forms/confirmations, and inspect long text. | No horizontal document overflow, overlap, clipped controls, or unreachable actions. Focus order remains practical. | NOT RUN | |
| V3-LARGE-05 | Fixture run complete. | Delete via account cascade when supported; otherwise delete all applications and record retained disposable user. | Cleanup is verified. Any retained disposable data is counted and explicitly documented. | NOT RUN | |

## Accessibility, Responsive, and Motion

| ID | Preconditions | Steps | Expected result | Result | Evidence/notes |
|---|---|---|---|---|---|
| V3-A11Y-01 | Desktop keyboard. | Traverse login, forgot, reset, settings dialog, and primary app routes using Tab/Shift+Tab/Enter/Space/Escape. | Focus is visible, order is logical, labels/errors/statuses are associated, and dialog focus enters/restores correctly. | NOT RUN | This is focused QA, not a WCAG conformance claim. |
| V3-A11Y-02 | 375x667 (or taller) mobile viewport. | Exercise forgot/reset/settings validation, success, unavailable, and busy states. | Copy wraps; fields/buttons/dialog fit; no horizontal overflow; touch targets and destructive-action distinction remain usable. | NOT RUN | |
| V3-MOTION-01 | OS/browser `prefers-reduced-motion: reduce`. | Load auth pages and initial app skeletons; navigate between pages. | Decorative entry/gradient/shimmer motion is disabled; information and focus remain available; no flashing/jump is introduced. | NOT RUN | Record how preference was enabled. |
| V3-MOTION-02 | Touch device or coarse-pointer emulation. | Move/touch across auth presentation, rotate/resize, and interact with form. | Parallax remains neutral and never follows touch; form stays stable and interactive. | NOT RUN | |
| V3-MOTION-03 | Fine-pointer desktop with normal motion. | Move pointer across auth presentation and leave the page region. | Parallax is subtle, presentation-only, frame-limited, returns to neutral, and never moves the form or changes layout. | NOT RUN | |

## Completion Review

- Run `npm run check:v3-query-qa` and frontend build separately from browser cases.
- Run backend hardening separately from HTTP E2E and real replica-set transaction evidence.
- Use `docs/v3-qa-evidence-template.md` for the execution record.
- Count every testcase exactly once and list every blocked/not-run ID.
- Verify disposable-data cleanup and scan committed evidence for secrets before publication.
