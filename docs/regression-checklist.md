# ApplyFlow Regression Checklist

Use this checklist during the audit step for every V2 task. Mark items not applicable in the PR with a short reason.

## Canonical Frontend Manual Regression

Use [frontend/docs/manual-frontend-testcases.md](../frontend/docs/manual-frontend-testcases.md) for
the executable V2 browser checklist, execution record, fixture strategy, result fields, and
evidence notes. This document remains a concise cross-task risk checklist and does not duplicate
those detailed cases.

## V2 Baseline Carry-Forward

- Distinguish guaranteed V1 baseline behavior from current implementation details and explicit V2 improvements.
- Do not treat `recentApplications` as guaranteed V1 baseline behavior; V2-12/V2-13 preserve it as verified V2 dashboard polish with a limit of five.
- Do not treat `followUpAt` sorting as guaranteed V1 baseline behavior; V2-04 owns it as an explicit list contract extension.
- Use `countsByStatus` as the active dashboard status-count field selected and preserved by V2-12/V2-13; do not describe `statusCounts` as active.
- Mark backend E2E, browser/manual regression, and remote CI as unverified unless the current task actually ran or inspected them.
- Keep README corrections reserved for V2-17. Earlier tasks may record README risks but must not edit `README.md`.

## Auth

- Register creates a usable account.
- Login returns a valid session token.
- Invalid credentials fail with a controlled error.
- Current-user lookup returns the authenticated user.
- Logged-out users cannot access protected application data.

## Applications

- Create application with valid required fields.
- Validation rejects invalid statuses and malformed payloads.
- List, search, filter, and sort return expected records.
- Detail view/API returns the selected application.
- Update persists editable fields without losing existing data.
- Delete removes the application from normal user views.

## Events

- Create event for an existing application.
- Validation rejects invalid event types and malformed dates.
- List events returns only events for the selected application.
- Update persists event changes.
- Delete removes the event.
- Deleting an application does not leave visible orphaned events.

## Dashboard

- Summary loads for an authenticated user.
- Total application count matches visible data.
- Status counts match application statuses and use the response field chosen by V2-12.
- Upcoming events include active scheduled events.
- Attention flags match overdue follow-up and no-response rules.
- Deleted applications and events disappear from dashboard results.
- `recentApplications`, if present, is treated as current implementation/V2 polish and has verified ordering and empty-state behavior.

## Access Control

- User A cannot read, update, or delete User B applications.
- User A cannot list, create, update, or delete events under User B applications.
- Malformed IDs return controlled errors.
- Unauthorized requests do not leak stack traces or sensitive details.
- Closed or deleted records do not remain reachable through related endpoints.

## Frontend UX

- Primary routes render without blank screens.
- Loading, empty, error, and success states are understandable.
- Forms preserve user input on validation errors where appropriate.
- Navigation works after create, update, and delete actions.
- Responsive layouts remain usable on mobile and desktop widths.
- Text does not overlap or overflow buttons, cards, tables, or panels.
- Keyboard focus and disabled states are clear for common actions.

## Page-Specific Manual QA for V2-07 Through V2-13

Record a small evidence note for the affected page in each frontend task. The broader checklist expansion remains owned by V2-15.

- V2-07 auth/protected routes: login, register, logout, protected redirect, loading/error state, refresh.
- V2-08 application list: list load, empty and filtered-empty state, search/filter/sort controls, create/edit/delete entry points, error state, responsive sanity.
- V2-09 application detail: valid detail load, invalid/not-found URL, refresh, edit/delete navigation, event section visibility, error state.
- V2-10 event timeline: empty timeline, create/edit/delete event, validation errors, loading/error state, date/contact/logistics display.
- V2-13 dashboard: empty dashboard, populated dashboard, status count field from V2-12, upcoming events, attention flags, optional recent applications, error state, refresh, responsive sanity.
