# ApplyFlow Regression Checklist

Use this checklist during the audit step for every V2 task. Mark items not applicable in the PR with a short reason.

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
- Status counts match application statuses.
- Upcoming events include active scheduled events.
- Attention flags match overdue follow-up and no-response rules.
- Deleted applications and events disappear from dashboard results.

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
