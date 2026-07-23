# ApplyFlow V2 Manual Frontend Regression Checklist

This is the canonical detailed manual-regression document for ApplyFlow V2. Use
[docs/regression-checklist.md](../../docs/regression-checklist.md) for task-level risk review and
[docs/test-plan.md](../../docs/test-plan.md) for command and evidence policy. This checklist records
manual observations only; it does not replace the backend checks or backend HTTP E2E script.

For V3 query/cache, password-reset, settings, motion, skeleton, and large-dataset coverage, use the
[V3 manual and browser QA companion](manual-v3-testcases.md) without changing these preserved V2
baseline cases.

## Tester Status Values

Use exactly one status for each testcase:

- `NOT RUN` - default; no execution evidence exists.
- `PASS` - every expected result was observed.
- `FAIL` - at least one expected result was not observed; link the defect.
- `BLOCKED` - a prerequisite or environment issue prevented completion.
- `NOT APPLICABLE` - the case does not apply to the tested build; explain why.

Do not change a result from `NOT RUN` without recording the execution environment and useful notes
or evidence.

## Execution Record

| Field | Value |
|---|---|
| Tester | |
| Date/time and timezone | |
| Environment | |
| Browser and version | |
| Viewport/device | |
| Frontend origin | |
| Backend origin | |
| Backend/database availability | |
| Test account or fixture description | |
| Build/commit/branch tested | |

## Result Summary

| Result | Count or notes |
|---|---|
| Total cases | |
| Passed | |
| Failed | |
| Blocked | |
| Not run | |
| Not applicable | |
| Defect/issue links | |
| Overall notes | |

## Reusable Fixture Strategy

- Use disposable User A and User B accounts with unique emails. Do not use personal or production
  accounts, credentials, or data. ApplyFlow has no user-delete endpoint, so record retained users
  and use a disposable database.
- For User A, create at least six applications, one in each status: `saved`, `applied`,
  `in_process`, `offer`, `rejected`, and `withdrawn`.
- Use distinctive searchable values such as `Atlas Regex [QA]+` for company and `Rare Platform
  Intern` for role. Include leading/trailing spaces during form-entry tests.
- Give applications distinct `createdAt`, `updatedAt`, and `followUpAt` values. Include two equal
  follow-up values for stable-order sanity, one overdue follow-up, and applications with no
  follow-up.
- Include one application with no events and one with multiple events. Use past, current, and
  future event dates, representative event types, and all three modes where requested.
- Keep one unrelated User B application and event for ownership and cascade-isolation checks.
- Delete applications and events created by the run where practical. Record data that could not be
  removed.

## Execution Guidance

- Run core cases against a normal disposable local/test environment.
- The enclosing level-two section supplies the Feature/page or flow value for every testcase row.
- Cases labeled **Failure injection** require controlled browser network interception, a test
  proxy, or a deliberately unavailable local backend. Do not run them against shared or production
  environments.
- Cases labeled **Two users** require disposable User A and User B sessions, preferably in separate
  browser profiles or private windows.
- Use browser console, Network panel, local storage inspection, and screenshots when they clarify a
  failure. Never capture access tokens or credentials in evidence.
- Calendar week/month views, reminders, notifications, interview rounds, and calendar/email
  integrations are not part of V2.

## Authentication

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| AUTH-01 | High | Logged out; registration page available. | New disposable display name, valid unique email, password of at least 8 characters. | Open `/register`, enter valid values, and select `Register`. | One account is created. The login page appears with the email preserved and the readable message `Registration successful. You can log in now.` No raw API data is shown. | NOT RUN | Record created account identifier only, not its password. |
| AUTH-02 | High | Logged out on `/register`. | Empty display name, email, and password. | Submit the form with each required value missing, then with all values missing. | Browser or API validation prevents registration, identifies the missing field, keeps the form usable, and creates no account. | NOT RUN | Note whether browser-native or application validation appears. |
| AUTH-03 | High | Logged out on `/register`. | `not-an-email`; otherwise valid values. | Submit registration. | Registration is rejected with a readable email validation message; entered display name and email remain available for correction. | NOT RUN | |
| AUTH-04 | High | Logged out on `/register`. | A 7-character password; otherwise valid values. | Submit registration. | Registration is prevented or rejected with the current contract message that password must contain at least 8 characters. No additional complexity rule is implied. | NOT RUN | |
| AUTH-05 | High | A disposable account already exists. | Existing account email with any valid 8+ character password. | Attempt registration with the existing email. | A readable duplicate-account error appears. Display name and email are preserved, no duplicate account is created, and login-page errors are not shown on the register form. | NOT RUN | |
| AUTH-06 | High | Disposable account exists; logged out. | Valid account email and password. | Open `/login`, submit valid credentials. | Exactly one login request succeeds, `/dashboard` opens, and authenticated navigation/user identity are visible. | NOT RUN | |
| AUTH-07 | High | Logged out on `/login`. | Empty email/password, malformed email, and valid email with incorrect password. | Submit each invalid combination separately. | Required/format errors or a readable invalid-credentials error appears as appropriate. Inputs remain editable and no protected page is shown. | NOT RUN | Record the response status without recording tokens. |
| AUTH-08 | High | Browser Network panel open; login and register endpoints delayed enough to observe busy state. | Valid login account plus a second unique registration email. | Rapidly double-click `Login`, then repeat with `Register`. | Each form sends one request, shows `Logging in...` or `Registering...`, disables its controls while pending, and recovers after success or failure. | NOT RUN | Capture request count. |
| AUTH-09 | High | **Failure injection**; logged out. | Valid-looking login or registration values. | Force the auth request to return a controlled API error, submit, then edit one field. | A readable local form error appears without raw JSON or `[object Object]`; all entered values remain except any intentionally blank password after navigation; editing clears the relevant field error. | NOT RUN | Describe injection method. |
| AUTH-10 | High | A valid token is stored from a prior login. | Existing disposable account. | Refresh `/dashboard` while throttling `GET /auth/me`. | `Loading session...` appears without a blank screen or protected-content flash; the dashboard is restored for the correct user when bootstrap succeeds. | NOT RUN | |
| AUTH-11 | High | **Failure injection**; a valid stored token exists. | Existing disposable account. | Make `GET /auth/me` fail temporarily with a non-401 error, refresh, restore the backend, then select `Try again`. | `Session unavailable` appears with `Try again` and `Log out`; the token is retained during the temporary failure and retry restores the session without credentials. | NOT RUN | Inspect local storage without copying the token. |

## Protected Routes and Session Lifecycle

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| ROUTE-01 | High | No ApplyFlow token or user state. | `/dashboard`, `/applications`, and a known `/applications/:applicationId` URL. | Open each URL directly in a fresh session. | Each request redirects to `/login`; no dashboard, application, or event data flashes before redirect. | NOT RUN | |
| ROUTE-02 | High | User A is authenticated. | Valid User A application URL. | Open dashboard, applications, and detail routes from navigation and direct URLs. | Each protected route renders User A data and does not redirect to login. | NOT RUN | |
| ROUTE-03 | High | User A is authenticated on an application detail route. | Valid User A application. | Refresh the browser. | Session bootstrap completes, the same detail route reloads, and the correct application appears without stale content. | NOT RUN | |
| ROUTE-04 | High | Invalid or expired token is stored. | Disposable invalid/expired token created for testing. | Open a protected route and wait for bootstrap. | The token is cleared, the user is redirected to `/login`, and `Your session has expired. Please log in again.` is readable. No private data remains visible. | NOT RUN | Do not include the token in evidence. |
| ROUTE-05 | High | **Failure injection**; User A is authenticated. | Any protected API response forced to `401`. | Trigger the protected request during the session. | The exact failed session is cleared, login is shown with the session-expired message, and protected data is removed. | NOT RUN | |
| ROUTE-06 | High | User A is authenticated and protected data is visible. | Existing User A data. | Select `Logout`, then use Back and directly reopen protected URLs. | Local token and authenticated state are cleared; `/login` remains visible and no prior private data is rendered. | NOT RUN | |
| ROUTE-07 | Medium | **Failure injection**; two sequential sessions can be created. | Old token A and newer token B for the disposable user. | Delay a `401` for token A, establish token B, then release the stale response. | The stale `401` does not clear token B or log out the newer session. | NOT RUN | Record request order, never token values. |

## Dashboard

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| DASH-01 | High | Authenticated; dashboard response can be throttled. | Any disposable account. | Open `/dashboard` with the summary request delayed. | `Loading dashboard` and its retrieval message appear; stale summary panels are absent while loading. | NOT RUN | |
| DASH-02 | High | Authenticated account has zero applications. | Empty disposable account. | Open dashboard, then select `Go to applications`. | Whole-dashboard empty state `No applications yet` appears instead of summary panels; the action opens `/applications`. | NOT RUN | |
| DASH-03 | High | User A has applications across statuses. | Six-status fixture, including at least one zero-valued status in a second run/account. | Open dashboard and compare against application data. | `Total Applications` is exact. Saved, Applied, In Process, Offer, Rejected, and Withdrawn counts use `countsByStatus` data and display numeric zero where applicable. | NOT RUN | Record expected and observed counts. |
| DASH-04 | High | User A has at least six applications. | Applications with distinct update times. | Open dashboard and inspect `Recent applications`; open one `Open detail` link. | At most five most-recent applications appear in established order with company, role, status, dates, and working detail navigation. | NOT RUN | |
| DASH-05 | Medium | **Failure injection**; dashboard response has `totalApplications > 0` and `recentApplications: []`. | Controlled dashboard response fixture. | Load dashboard. | `Recent applications` remains visible and shows `No recent applications are available.` without breaking other panels. | NOT RUN | This state normally requires response control. |
| DASH-06 | High | User A has eligible and ineligible scheduled events. | Future event inside three days, past event, event at/after three days, and event under a closed application. | Open dashboard. | Only eligible events appear under `Upcoming events`, ordered by schedule, with application context and working `Open application` links. | NOT RUN | |
| DASH-07 | Medium | User A has applications but no eligible future events. | Nonzero application fixture with no upcoming events. | Open dashboard. | Upcoming subsection shows `No upcoming events.` while the rest of the populated dashboard remains visible. | NOT RUN | |
| DASH-08 | High | User A data generates attention flags and has an upcoming event. | Overdue follow-up and no-response fixtures plus a future event. | Open dashboard and inspect `Needs attention`. | Backend-provided attention messages and dates are displayed unchanged. The upcoming event appears only under `Upcoming events`; no `UPCOMING_EVENT` duplicate appears in attention flags. | NOT RUN | Record messages for comparison, omitting private data. |
| DASH-09 | Medium | User A has applications but no active attention flags. | Fresh or closed-status fixture. | Open dashboard. | Attention subsection shows `No applications need attention right now.` and other panels remain populated. | NOT RUN | |
| DASH-11 | Medium | **Failure injection**; two dashboard responses can be delayed/reordered. | Two distinguishable dashboard response fixtures. | Trigger refresh/navigation conditions that cause overlapping or stale responses, then release the older response last. | Duplicate requests are prevented where expected and an older response does not replace newer dashboard data. | NOT RUN | Use only if tooling can control request order. |

## Application List

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| LIST-01 | High | Authenticated; list response can be throttled. | Any User A account. | Open `/applications` with the request delayed. | `Loading applications` appears and list cards are not shown as current data until the request completes. | NOT RUN | |
| LIST-02 | High | User A has no applications. | Empty disposable account. | Open applications and select `Create application`. | `No applications yet` appears with one create action; selecting it opens `New application` and removes the duplicate empty-state create action. | NOT RUN | |
| LIST-03 | High | User A has multiple applications. | Six-status fixture. | Open applications and inspect each card and action. | Cards show the correct company, role, status, and available metadata. `Job post`, `Open detail`, `Edit`, and `Delete` appear only where appropriate and navigate/open the expected UI. | NOT RUN | |
| LIST-04 | High | Distinct companies exist. | Companies `Atlas Regex [QA]+` and `Northstar Labs`. | Search for `Northstar Labs` and select `Apply`. | Only company matches owned by User A appear. | NOT RUN | |
| LIST-05 | High | Distinct roles exist. | Role `Rare Platform Intern`. | Search for the role and select `Apply`. | Matching role applications appear; unrelated company/role records are hidden. | NOT RUN | |
| LIST-06 | High | Search fixture exists. | Search text with leading/trailing spaces. | Enter `  Rare Platform Intern  ` and select `Apply`. | Surrounding whitespace is removed and the same role match is returned. | NOT RUN | |
| LIST-07 | High | Literal-special fixture exists. | Company containing `[QA]+` or another regex-special sequence. | Search for the exact special-character text. | The literal matching application appears; the page remains responsive and no query/API error occurs. | NOT RUN | |
| LIST-08 | High | User A has applications. | Search text guaranteed not to match. | Apply the search. | `No matching applications` appears with `Reset filters`; this is an empty state, not an API error. | NOT RUN | |
| LIST-09 | High | Multiple statuses exist. | At least two applications per selected status plus a status with no matches under the active search. | Select a Status and `Apply`, then combine it with a nonmatching search. | Every result has the selected status; the combination can show the filtered-empty state without leaking other statuses. | NOT RUN | |
| LIST-10 | High | Applications have distinct update times. | Run fixture with known `updatedAt` order. | Open applications with default controls. | `Sort by` is `Updated date`, `Order` is `Newest first`, and results are `updatedAt` descending. | NOT RUN | Record expected ID/order. |
| LIST-11 | High | Applications have distinct creation times. | Run fixture with known `createdAt` order. | Select `Created date`; apply `Oldest first`, then `Newest first`. | Ascending and descending orders match creation times and remain stable after reapplying. | NOT RUN | |
| LIST-12 | High | Applications have distinct update times. | Run fixture with known `updatedAt` order. | Select `Updated date`; apply `Oldest first`, then `Newest first`. | Ascending and descending orders match update times and remain stable. | NOT RUN | |
| LIST-13 | High | Applications have distinct and tied follow-up dates. | Dates before/after each other plus two equal values. | Select `Follow-up date`; apply `Earliest follow-up first`, then `Latest follow-up first`. | Both directions match `followUpAt`; tied results remain deterministic across repeated loads. | NOT RUN | Record tie order. |
| LIST-14 | High | Nondefault search, status, sort field, and order are applied. | Any populated fixture. | Select `Reset`. | Search becomes empty, Status becomes `All statuses`, Sort by becomes `Updated date`, Order becomes `Newest first`, and the default list reloads. | NOT RUN | |
| LIST-15 | Medium | Nondefault controls are applied. | Any populated fixture. | Refresh the browser. | Current implementation resets local filter state to empty search, all statuses, `updatedAt`, and `desc`; URL and data agree with those defaults. | NOT RUN | This records current behavior, not a persistence requirement. |
| LIST-16 | High | Create form is closed. | Any account. | Rapidly select `Create Application`, then inspect the header and empty-state area. | Only one create form is present. The header toggles to `Close form`, and no second create action can open a duplicate form. | NOT RUN | |

## Application Create

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| APP-C-01 | High | Authenticated on applications page; create form closed. | None. | Select `Create Application`, then `Cancel`; repeat and select `Close form`. | `New application` opens once. Both Cancel and Close form dismiss it without creating data. | NOT RUN | |
| APP-C-02 | High | Create form open. | Company, role, one valid status, Job URL, Source, Notes, and Follow-up date. | Complete every supported field and select `Create application`. | Exactly one application is created, the form closes, filters reset to defaults, and the new card appears with saved values. | NOT RUN | Record created application ID if available. |
| APP-C-03 | High | Create form open. | Blank/whitespace-only company; valid role. | Submit. | `Company is required.` and `Please fix the highlighted fields.` appear; no request creates an application and role remains entered. | NOT RUN | |
| APP-C-04 | High | Create form open. | Valid company; blank/whitespace-only role. | Submit. | `Role is required.` appears, no application is created, and company remains entered. | NOT RUN | |
| APP-C-05 | High | Create form open for repeated disposable records. | Saved, Applied, In Process, Offer, Rejected, Withdrawn. | Create one application with each Status option. | Each supported status can be selected and persists with the matching label; no unsupported status is exposed. | NOT RUN | Cleanup all records after dependent cases. |
| APP-C-06 | Medium | Create form open. | Optional fields empty, then values surrounded by spaces. | Create once with optional fields omitted; create another with padded company, role, URL, source, and notes. | Empty optional values are accepted. Required and optional strings are stored/displayed without surrounding whitespace. | NOT RUN | |
| APP-C-07 | High | Create form open. | Valid future Follow-up date. | Create and inspect list/detail. | The date is accepted, converted consistently, and displayed under `Follow up` in the user's locale. | NOT RUN | Record timezone used. |
| APP-C-08 | Medium | **Failure injection or browser tooling** because `datetime-local` may block malformed text. | Malformed follow-up value. | Force an invalid date submission. | Submission is rejected with `Follow-up date must be valid.` or the backend field error; other inputs remain available. | NOT RUN | Mark NOT APPLICABLE if the browser cannot produce the invalid value and no safe injection tool exists. |
| APP-C-09 | High | Request can be delayed; Network panel open. | Valid application values. | Rapidly activate `Create application` while the request is pending. | The button shows `Creating...`, controls are disabled, and no more than one application is created. | NOT RUN | Capture request and created-record count. |

## Application Update

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| APP-U-01 | High | Existing application is visible in list or detail. | Application with every supported field populated. | Select `Edit`. | Company, Role, Status, Job URL, Source, Follow-up date, and Notes are prefilled. `_id`, `userId`, timestamps, and other unsupported fields are not editable. | NOT RUN | |
| APP-U-02 | High | Edit form open. | Changed company, role, status, and optional values. | Save, inspect current view, then refresh. | `Save application` updates only the intended application; changed values persist after refresh and appear in list/detail/dashboard where applicable. | NOT RUN | |
| APP-U-03 | High | Edit form open. | Whitespace-only company or role after other fields are changed. | Submit each invalid variant. | Field-specific validation appears, all other edits remain, and the stored application remains unchanged until a valid save. | NOT RUN | |
| APP-U-04 | High | Existing application has no follow-up, then has one. | Valid follow-up date. | Add a Follow-up date and save; reopen edit, clear the field, and save again. | The date first persists and displays. Clearing sends the supported UI/null contract and removes Follow up after refresh. | NOT RUN | |
| APP-U-05 | Medium | **Failure injection or browser tooling**; edit form open. | Malformed follow-up date. | Force invalid date submission. | A readable date validation error appears and existing edits are preserved; stored data is not changed. | NOT RUN | |
| APP-U-06 | High | Update request can be delayed. | Valid changed values. | Rapidly activate `Save application`. | Busy/disabled state is understandable and only one effective update is persisted. | NOT RUN | Check request count; report a defect if duplicates occur. |

## Application Delete

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| APP-D-01 | High | Existing application visible in list. | Disposable application. | Select `Delete`, then `Cancel`. | Confirmation asks `Delete this application and its timeline events?`; cancel closes it and the application remains after refresh. | NOT RUN | |
| APP-D-02 | High | Delete confirmation open in list. | Disposable application without dependent evidence. | Select `Delete application`. | Button changes to `Deleting...`, the item disappears after success, and it does not return after refresh. | NOT RUN | |
| APP-D-03 | High | Delete response can be delayed. | Disposable application. | Rapidly activate `Delete application` during the pending request. | Only one delete request is accepted and controls remain disabled until completion. | NOT RUN | Capture request count. |
| APP-D-04 | High | Application detail is open. | Disposable application URL saved before deletion. | Confirm delete from detail, then revisit the saved URL and use Back. | Navigation safely replaces the detail route with `/applications`; saved detail URL shows `Application unavailable`, and stale overview/events are not displayed. | NOT RUN | |

## Application Detail

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| DETAIL-01 | High | Valid User A application exists; response can be delayed. | Fully populated application. | Open `Open detail` while throttling the response. | `Loading application` appears first; then the correct overview, status, dates, notes, actions, and Events panel appear. | NOT RUN | |
| DETAIL-02 | High | Valid detail page loaded. | Existing application URL. | Refresh directly. | The same application reloads, its events reload separately, and no stale application from another route appears. | NOT RUN | |
| DETAIL-03 | High | Authenticated. | `/applications/not-an-object-id`. | Open malformed URL. | Controlled `Application unavailable` state shows a readable validation message; overview and event section remain hidden. | NOT RUN | |
| DETAIL-04 | High | Authenticated. | Valid-format nonexistent application ID. | Open URL. | Controlled `Application unavailable` state appears without implying whether another user owns the ID; no event controls are shown. | NOT RUN | |
| DETAIL-05 | Medium | Valid detail loaded. | Any User A application. | Select `Back to applications`. | `/applications` opens without a blank screen and current list data can be reloaded. | NOT RUN | |
| DETAIL-06 | Medium | **Failure injection**; two application responses can be reordered. | Two User A application URLs with distinct titles. | Navigate from A to B while A is delayed, then release A last. | B remains visible; stale A data does not replace B, and the page heading/events correspond to B. | NOT RUN | |
| DETAIL-07 | High | Application response is pending, unavailable, or failed. | Any detail URL from DETAIL-01, DETAIL-03, or ERROR-03. | Observe page before a valid application is loaded. | Event panel, Add event, and event data stay hidden until a valid current application exists. | NOT RUN | |

## Event Timeline

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| EVENT-01 | High | Valid application loaded; event response can be throttled. | Application with events. | Open detail with event request delayed. | Overview can render while `Loading events` appears in the event panel; old events are not shown as current data. | NOT RUN | |
| EVENT-02 | High | Valid application has no events. | No-event application fixture. | Open detail. | Events panel shows `No timeline events` and `Add event` remains reachable. | NOT RUN | |
| EVENT-03 | High | Application has multiple events. | Events with occurred, scheduled, and created-fallback dates, including a tie. | Open detail, record order, and refresh. | Every event appears in ascending effective-date order using occurredAt, then scheduledAt, then createdAt; tie order remains stable after refresh. | NOT RUN | Record expected and observed title order. |
| EVENT-04 | High | Populated timeline. | Event containing dates, mode, location, link, contact fields, and note. | Inspect the event item and open its external/email links where safe. | Type/title and `Occurred`, `Scheduled`, or `Added` label are accurate. Scheduled time is separately visible when occurredAt also exists; contact/logistics/note values wrap and links use expected targets. | NOT RUN | |
| EVENT-05 | High | Existing event visible. | Disposable event. | Select `Delete`, then `Cancel`. | `Delete this event?` appears; Cancel leaves the event unchanged after refresh. | NOT RUN | |
| EVENT-06 | High | Delete confirmation open. | Disposable event. | Select `Delete event`, then refresh. | Busy state shows `Deleting...`; the event disappears and no stale deleted item returns. | NOT RUN | |
| EVENT-07 | High | Create/update/delete requests can be delayed. | Disposable event payloads. | Rapidly submit Add event, Save event, and Delete event in separate runs. | Each action sends one effective request, disables relevant controls, and does not create duplicate or stale timeline items. | NOT RUN | Record request counts. |

## Event Form and Validation

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| EVENT-F-01 | High | Add event form open. | Types: Applied, HR Call, Online Assessment, Interview, Follow Up, Offer, Rejected, Note. | Create disposable events until every Type option has been selected and saved. | All eight approved values are selectable, persist with the matching label, and no unsupported event type appears. | NOT RUN | Several values may be combined with EVENT-F-03 fixtures. |
| EVENT-F-02 | High | Add/edit event form open. | Modes: Online, Offline, Phone, and No mode. | Save one event per mode or update one event through every option. | All three approved modes persist and display correctly; No mode clears/omits the mode. | NOT RUN | |
| EVENT-F-03 | High | Add event form open. | Type, Title, occurredAt, scheduledAt, Mode, Location, Meeting link, Contact name, Contact phone, Contact email, Note. | Complete every supported field and select `Create event`; inspect the item, edit selected values, and save. | One event is created and later updated. Every supported field is represented accurately in form or display; no calendar/reminder/round field appears. | NOT RUN | Record dates/timezone and external link target. |
| EVENT-F-04 | High | Add/edit form open. | Empty and whitespace-only title, then padded valid title/note/contact values. | Submit invalid title, then correct and save. | `Title is required.` appears for empty/whitespace input. Corrected title and optional strings persist without surrounding whitespace; other values remain during correction. | NOT RUN | |
| EVENT-F-05 | Medium | **Failure injection or browser tooling** because `datetime-local` may prevent malformed input. | Invalid occurredAt and invalid scheduledAt. | Force each malformed date in separate submissions. | The relevant `Occurred date must be valid.` or `Scheduled date must be valid.` message appears; no invalid event is saved and other inputs remain. | NOT RUN | Mark NOT APPLICABLE if no safe injection method exists. |
| EVENT-F-06 | High | Add/edit form open. | Invalid contact email with otherwise valid values. | Submit. | Browser or backend validation rejects the email with a readable field/form error; entered event values remain editable. | NOT RUN | |
| EVENT-F-07 | High | Add/edit form open. | Invalid Meeting link such as `not-a-url`. | Submit. | Browser or backend validation rejects the link with a readable error; no raw API response is displayed and values remain. | NOT RUN | |
| EVENT-F-08 | High | Existing event has every optional value. | Empty occurredAt, scheduledAt, mode, location, meetingLink, contactName, contactPhone, contactEmail, and note. | Edit, clear every optional field through the UI, and save. | Update uses the supported null-clearing contract. Optional metadata disappears after save and remains absent after refresh; Type and Title remain. | NOT RUN | |

## Visible Cascade Flow

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| CASCADE-01 | High | User A has an unrelated application/event that must remain. | New disposable parent application with two child events plus unrelated control data. | Create parent and child events; verify them in detail/dashboard; delete the parent; check list, saved detail URL, dashboard, and unrelated control data. | Deleted application disappears, its detail route is unavailable, and its child events are no longer visible/reachable through the UI or dashboard. Unrelated application/events remain. This is visible frontend evidence only; database-level cascade proof belongs to backend checks/E2E. | NOT RUN | Record deleted/control IDs without credentials. |

## Cross-User Frontend Scenarios

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| XUSER-01 | High | **Two users** in separate browser profiles. | User A application with events; unrelated User B application/event; saved A detail URL. | While logged in as B, open A's detail URL and inspect B dashboard/applications. | A detail shows the same controlled unavailable state as a nonexistent resource. B list, counts, recent applications, upcoming events, and attention data contain only B data; ownership is not revealed. | NOT RUN | |
| XUSER-02 | High | **Two users**; B is on A's unavailable detail URL. | Same fixture as XUSER-01. | Attempt all visible edit/delete/add-event actions. | No application or event mutation controls are exposed because A data never loads. Returning as A confirms application/events are unchanged. | NOT RUN | This verifies the frontend-access path, not raw endpoint authorization. |
| XUSER-03 | High | **Two users and controlled request tooling**. | A application/event IDs; B authenticated session. | Using browser DevTools replay or an approved local API tool, attempt B read/update/delete on A application and list/create/update/delete under A events; do not alter stored credentials. | Every private operation returns the established not-found behavior without ownership details. A data remains unchanged and B data remains intact. | NOT RUN | Environment-dependent; V2-14 owns automated HTTP coverage. Do not duplicate if tooling is unavailable. |

## Controlled API Error and Recovery States

These cases require failure injection. A normal healthy environment is not expected to produce them
on demand.

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| ERROR-01 | High | Dashboard response can be failed, then restored. | Any authenticated account. | Fail dashboard fetch, inspect, restore, and select Retry. | Readable Dashboard unavailable state replaces stale data and retry restores current summary. | NOT RUN | Describe injection method and response status. |
| ERROR-02 | High | Application-list response can be failed, then restored. | Populated User A account. | Fail list fetch, inspect, restore, and select `Try again`. | `Could not load applications` shows a readable error, old list is absent, and retry restores current applications. | NOT RUN | |
| ERROR-03 | High | Detail and event-list responses can be failed independently. | Valid application URL. | Fail detail fetch; recover. Then fail event list while detail succeeds; recover with event Retry. | Detail failure hides overview/events and supports Retry. Event failure leaves valid application overview visible, shows `Could not load events`, and Retry restores timeline. | NOT RUN | |
| ERROR-04 | High | Application create/update responses can fail. | Valid create and edit values. | Force each save failure, inspect fields, restore service, and retry. | Readable error appears, input is preserved, no stale/duplicate record appears, and retry succeeds. | NOT RUN | APP-C/APP-U rows cover field-specific details; this row records cross-form consistency. |
| ERROR-05 | High | Event create/update responses can fail. | Valid event values. | Force each save failure, inspect fields, restore service, and retry. | Readable error appears, event input is preserved, timeline does not show an unsaved event, and retry succeeds once. | NOT RUN | |
| ERROR-06 | High | Application and event delete responses can fail. | Disposable application and event. | Force each delete failure after confirmation, then restore and retry. | Item remains visible after failure, readable error appears, and successful retry removes only the intended item. | NOT RUN | |
| ERROR-07 | Medium | Two distinguishable list/detail/event responses can be reordered. | Distinct records and controlled response delays. | Navigate or change filters rapidly, releasing old responses after new ones. | Old responses do not replace current route/filter data; no stale deleted data reappears. | NOT RUN | Mark BLOCKED when tooling cannot control timing. |

## Responsive and Usability Sanity

This is a focused usability pass, not a full WCAG accessibility audit.

| ID | Priority | Preconditions | Test data | Steps | Expected result | Result | Notes/evidence |
|---|---|---|---|---|---|---|---|
| RESP-01 | Medium | Browser at approximately 1280px width. | Populated fixtures plus loading, empty, error, and confirmation states where available. | Traverse auth, dashboard, applications, detail, and event workflows. | No horizontal page overflow, overlap, clipped text, or unreachable actions; panels/cards/tables and confirmations remain readable. | NOT RUN | Record browser and exact viewport. |
| RESP-02 | High | Mobile viewport approximately 375px wide. | Auth and populated/empty dashboard states. | Register/login, inspect session loading/error, then inspect dashboard summary and panels. | Forms fit viewport, validation wraps, dashboard cards/panels remain readable, navigation/logout are reachable, and no horizontal page overflow occurs. | NOT RUN | Recommended height around 667px or taller. |
| RESP-03 | High | Mobile viewport approximately 375px wide. | Populated application list and create/edit form. | Use search/status/sort/order controls, reset, open form, trigger validation, and inspect card actions/confirmation. | Filters and buttons wrap without overlap; forms remain usable; long company/role/notes wrap; actions and validation remain visible. | NOT RUN | |
| RESP-04 | High | Mobile viewport approximately 375px wide. | Detail with long company/role/title/message, populated event metadata, and edit/delete states. | Inspect overview, events, forms, loading/error/empty states, and confirmations. | Long text wraps without covering controls; date/contact/logistics details remain readable; Add/Edit/Delete/Cancel actions remain reachable. | NOT RUN | |
| RESP-05 | Medium | Desktop and mobile; keyboard available. | Common controls on every primary page. | Navigate with Tab/Shift+Tab, activate primary actions with keyboard, and observe disabled/loading controls. | Focus is visible, order is practical, links/buttons/forms are keyboard reachable, and disabled/busy states are understandable without relying only on color. | NOT RUN | Report specific focus gaps; this is not a full accessibility audit. |

## Completion Review

Before treating an execution record as complete:

- Every testcase has one allowed result value.
- Every `FAIL` links to a defect or includes reproducible notes.
- Every `BLOCKED` names the missing prerequisite.
- Environment-dependent cases are not marked PASS without the injection/tooling evidence.
- Account, application, and event cleanup is recorded.
- No evidence contains passwords, JWTs, database credentials, or other secrets.
- Automated build/backend/E2E results are recorded separately from this manual checklist.
