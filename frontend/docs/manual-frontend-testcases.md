# ApplyFlow V1 Manual Frontend Testcases

Use these browser testcases as a practical V1 smoke and regression pass. Use disposable data only.

## Preconditions

- Backend is running and reachable by the frontend.
- Frontend is running.
- MongoDB environment variables are configured for the backend.
- Use a disposable test account because V1 has no user-delete endpoint.
- Start from a clean browser session or clear ApplyFlow local storage before auth tests.

## Auth Testcases

| Case | Steps | Expected result |
|---|---|---|
| Register valid user | Open register page, enter display name, valid email, and password with at least 8 characters, then submit. | Account is created, user is signed in or routed to the authenticated app flow, and no raw API details are shown. |
| Login valid user | Open login page, enter the disposable account email and password, then submit. | User reaches the protected ApplyFlow app. |
| Bad login error | Enter a valid email with an incorrect password and submit. | A readable error appears near the form. No raw JSON or `[object Object]` appears. |
| Logout protection | Log out, then try to open `/dashboard`, `/applications`, and an application detail URL directly. | User is redirected to login or blocked from protected content. |

## Dashboard Testcases

| Case | Steps | Expected result |
|---|---|---|
| Empty dashboard state | Sign in with a new disposable account and open dashboard before creating applications. | Dashboard shows zero applications and useful empty states without broken panels. |
| Status counts | Create applications with at least two different statuses, then return to dashboard. | Counts match the created applications by status. |
| Upcoming events | Create an application and add an event scheduled soon, then return to dashboard. | Upcoming event appears with the correct application context and date. |
| Attention flags | Create data that supports an overdue follow-up or no-response condition, then open dashboard. | Attention area displays readable warning content where supported by the data. |
| Deleted data removed | Delete an application that has a scheduled event, then return to dashboard. | Deleted application and child event no longer appear in counts, upcoming events, recent items, or attention flags. |

## Applications Page Testcases

| Case | Steps | Expected result |
|---|---|---|
| Empty state | Open `/applications` with a new disposable account. | Empty state is readable and does not look broken. |
| Create application | Create an application with company, role, status, optional source, notes, job URL, and follow-up date. | Application appears in the list with the saved values. |
| Edit application | Edit company, role, status, notes, and follow-up date. | Updated values persist after save and page refresh. |
| Delete application | Delete an application and confirm the destructive action. | Application disappears from the list and does not return after refresh. |
| Search applications | Create two applications with distinct company or role names, then search for one. | Matching application appears and unrelated application is hidden. |
| Filter by status | Create applications with different statuses and choose a status filter. | Only applications with the selected status appear. |
| No-results state | Search or filter so no applications match. | No-results state is readable and gives the tester a clear way back. |

## Application Detail Testcases

| Case | Steps | Expected result |
|---|---|---|
| Open detail page | Open an application from the applications list. | Detail page shows the correct company, role, status, notes, and timeline area. |
| Edit from detail | Edit the application from the detail page and save. | Detail view updates without showing stale data. |
| Delete from detail | Delete the application from the detail page and confirm. | User is redirected to `/applications`, and the deleted application is gone. |

## Event Timeline Testcases

| Case | Steps | Expected result |
|---|---|---|
| Empty timeline | Open detail page for an application with no events. | Timeline empty state is readable. |
| Create event | Add an event with type, title, date, mode, contact fields, meeting link, and note. | Event appears in the timeline with readable details. |
| Edit event | Edit the event title, date, mode, and note. | Updated timeline item persists after refresh. |
| Delete event | Delete the event and confirm. | Event disappears and does not return after refresh. |
| Timeline ordering | Create multiple events with different dates. | Timeline remains readable and ordered consistently. |

## Validation and Error UX Testcases

| Case | Steps | Expected result |
|---|---|---|
| Invalid register email | Register with an invalid email format. | Email field shows a readable validation error. |
| Short password | Register with a password shorter than 8 characters. | Password field shows a readable validation error. |
| Empty company | Submit an application with an empty company. | Company field shows a readable validation error. |
| Invalid date | If the browser/UI allows an invalid application or event date, submit it. | Date field shows a readable validation error and the form stays editable. |
| Invalid event fields | Submit an event with missing title or invalid contact email if allowed. | Field-level or form-level error is readable. |
| API error readability | Stop the backend or force an API error, then submit a form. | Error is understandable and does not expose raw JSON or `[object Object]`. |

## Delete Cascade Testcase

| Case | Steps | Expected result |
|---|---|---|
| Application delete removes child event data | Create an application, add a scheduled event, verify dashboard shows the event, delete the application, then revisit applications and dashboard. | Application is gone, detail URL is inaccessible, and dashboard no longer shows the child event. |

## Visual and UX Consistency Checklist

- Primary buttons are visually consistent across auth, dashboard, applications, detail, and event forms.
- Destructive actions use red or danger styling and require confirmation where applicable.
- Warning or attention states use amber/orange styling.
- Neutral layout stays clean and readable.
- No random colors appear outside the established UI palette.
- Loading, empty, and error states are not broken or overlapping.
- Submit buttons are disabled while submitting and recover after success or failure.

## Known Limitations

- V1 has no user-delete endpoint, so disposable test users may remain in MongoDB.
- These are desktop smoke testcases unless the tester manually repeats them on mobile sizes.
- V1 does not include a full automated frontend E2E framework.
