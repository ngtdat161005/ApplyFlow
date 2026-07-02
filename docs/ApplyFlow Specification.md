# <a name="applyflow-spec.md-v1"></a>ApplyFlow — spec.md (V1)
## <a name="product-overview"></a>1. Product Overview
### <a name="product-name"></a>1.1 Product Name
**ApplyFlow**
### <a name="product-type"></a>1.2 Product Type
A personal web application for **tracking internship/job application progress**, recruitment events, reminders, and “attention needed” cases.
### <a name="product-goal"></a>1.3 Product Goal
ApplyFlow helps a user manage their internship/job application pipeline in one place. It is **not** a job board and **not** a recruiting platform. It does **not** submit applications on behalf of the user.

Its purpose is to help the user answer four questions clearly:

1. **Where have I applied?**
1. **What is the current state of each application?**
1. **What events happened or are scheduled next?**
1. **Which applications need my attention right now?**
### <a name="product-focus"></a>1.4 Product Focus
ApplyFlow V1 focuses on three things:

1. **Application tracking**
   - company, role, status, source, notes, follow-up date
1. **Recruitment timeline tracking**
   - applied, HR call, OA, interview, follow-up, offer, rejection, notes
1. **Reminder / attention support**
   - no response after applying
   - no response after interview
   - overdue follow-up
   - upcoming events
### <a name="target-user"></a>1.5 Target User
Primary target user:

- students applying for internships
- new graduates applying for entry-level roles
- individuals who want a personal tracker for applications and recruitment progress
### <a name="v1-philosophy"></a>1.6 V1 Philosophy
V1 should be **small, useful, and finishable**. It should feel like a serious personal tool, not a toy CRUD app, but it must avoid turning into:

- a full ATS
- a CRM
- an email platform
- a team collaboration product
-----
# <a name="product-scope"></a>2. Product Scope
## <a name="in-scope-for-v1"></a>2.1 In Scope for V1
ApplyFlow V1 must support:
### <a name="a.-authentication"></a>A. Authentication
- register
- login
- get current user
### <a name="b.-application-management"></a>B. Application management
- create application
- list applications
- search applications
- filter applications by status
- view application details
- update application
- delete application
### <a name="c.-recruitment-event-tracking"></a>C. Recruitment event tracking
- add events to an application
- view timeline of events for an application
- update event
- delete event
### <a name="d.-reminder-and-attention-support"></a>D. Reminder and attention support
- set application follow-up date
- detect overdue follow-up
- detect no response after apply
- detect no response after interview
- detect upcoming scheduled events
### <a name="e.-dashboard"></a>E. Dashboard
- total application count
- counts by current status
- upcoming events
- attention-needed applications
-----
## <a name="out-of-scope-for-v1"></a>2.2 Out of Scope for V1
ApplyFlow V1 must **not** include:

- applying to jobs directly from the app
- recruiter/company-side functionality
- email inbox integration
- automatic parsing of email responses
- AI-generated CVs, cover letters, or interview answers
- file upload for CVs / documents
- team collaboration / shared applications
- kanban board / drag-and-drop workflow
- calendar month view
- push notifications / realtime notifications
- full contact management system
- user-configurable reminder thresholds
- browser extension or job scraping automation
-----
# <a name="core-domain-concepts"></a>3. Core Domain Concepts
ApplyFlow is built around **three main concepts**:
## <a name="application"></a>3.1 Application
An **Application** represents one internship/job opportunity for a specific company and role.

Examples:

- Frontend Intern at Company A
- Backend Intern at Company B

An application stores:

- core job/application info
- one current overall status
- optional follow-up reminder date
- a timeline of recruitment events
-----
## <a name="recruitment-event"></a>3.2 Recruitment Event
A **Recruitment Event** represents something that happened or is scheduled to happen in the recruitment process for a specific application.

Examples:

- applied
- HR call
- OA / assignment
- interview
- follow-up
- offer
- rejection
- note

Events are used to record:

- what happened
- when it happened
- what is scheduled next
- who contacted the user
- how the interview/call is conducted
- notes and logistics
-----
## <a name="attention-flag"></a>3.3 Attention Flag
An **Attention Flag** is a system-generated signal that tells the user an application may need attention.

Examples:

- no response after applying for 14 days
- no response after interview for 7 days
- follow-up overdue
- interview in 2 days

Attention flags are not manually created by the user in V1.

-----
# <a name="status-model"></a>4. Status Model
Each application has exactly one **current overall status**.

Allowed values for currentStatus:

- saved
- applied
- in\_process
- offer
- rejected
- withdrawn
## <a name="meaning-of-each-status"></a>4.1 Meaning of Each Status
### <a name="saved"></a>saved
The user saved the opportunity but has **not applied yet**.
### <a name="applied"></a>applied
The user has applied, but there is **no meaningful recruitment progress yet**.
### <a name="in_process"></a>in\_process
The application is actively moving through the recruitment process, such as:

- HR call
- OA
- interview
- post-interview waiting
### <a name="offer"></a>offer
The user received an offer.
### <a name="rejected"></a>rejected
The company rejected the user.
### <a name="withdrawn"></a>withdrawn
The user decided to stop pursuing the application.

-----
## <a name="important-rule-about-status-vs-events"></a>4.2 Important Rule About Status vs Events
currentStatus is an **application-level summary field**.\
Detailed progress belongs to the **event timeline**.

Examples:

- “Technical interview scheduled on July 10” → event
- “Current state of this application is still active and in progress” → currentStatus
-----
# <a name="user-stories"></a>5. User Stories
## <a name="authentication"></a>5.1 Authentication
- As a user, I want to create an account so that my application data is stored privately.
- As a user, I want to log in and access my own tracker.
- As a user, I want only my own applications and events to be visible to me.
## <a name="application-tracking"></a>5.2 Application Tracking
- As a user, I want to create an application entry so I can track a company and role.
- As a user, I want to edit an application’s current status so I know its overall state.
- As a user, I want to store notes and follow-up dates for each application.
- As a user, I want to delete applications I no longer need.
## <a name="recruitment-timeline"></a>5.3 Recruitment Timeline
- As a user, I want to add events such as HR call, OA, interview, or follow-up so I can track the recruitment process.
- As a user, I want to store interview date, mode, location/link, and contact info.
- As a user, I want multiple events per application because a company may have multiple rounds.
## <a name="reminder-attention"></a>5.4 Reminder / Attention
- As a user, I want the app to tell me when an application has been silent for too long after I applied.
- As a user, I want the app to tell me when I interviewed but still got no response after a while.
- As a user, I want to see which follow-ups are overdue.
- As a user, I want to see upcoming events in the next few days.
## <a name="dashboard-search"></a>5.5 Dashboard / Search
- As a user, I want a dashboard that summarizes my application pipeline.
- As a user, I want to search by company or role.
- As a user, I want to filter by status to focus on a subset of applications.
-----
# <a name="functional-requirements"></a>6. Functional Requirements
# <a name="authentication-1"></a>6.1 Authentication
## <a name="register"></a>6.1.1 Register
The system must allow a user to register with:

- displayName
- email
- password
## <a name="login"></a>6.1.2 Login
The system must allow a user to log in with:

- email
- password
## <a name="current-user"></a>6.1.3 Current User
The system must allow the frontend to fetch the currently authenticated user.
## <a name="security-rules"></a>6.1.4 Security Rules
The system must:

- hash passwords before storing them
- never return password hashes in API responses
- protect private routes with JWT authentication
- ensure users can only access their own data
-----
# <a name="application-management"></a>6.2 Application Management
The system must allow a user to create an application with at least:

- company
- role
- currentStatus

Optional fields:

- jdUrl
- source
- notes
- followUpAt

The system must allow a user to:

- list all their applications
- search by company or role
- filter by currentStatus
- sort applications
- view application details
- update application fields
- delete application

The system must ensure:

- each application belongs to exactly one user
- users can only read/update/delete their own applications
-----
# <a name="recruitment-event-management"></a>6.3 Recruitment Event Management
The system must allow a user to add recruitment events to an application.

Supported event types in V1:

- applied
- hr\_call
- oa
- interview
- follow\_up
- offer
- rejected
- note

The system must allow a user to:

- create an event for an application
- list events for an application
- update an event
- delete an event

The system must ensure:

- an event belongs to exactly one application
- an event belongs to the same user as the application
-----
# <a name="reminder-attention-support"></a>6.4 Reminder / Attention Support
The system must generate attention-related information based on application and event data.

There are **two categories** of attention logic in V1:
## <a name="a.-silence-flags"></a>A. Silence Flags
Flags about waiting too long for company response:

- NO\_RESPONSE\_AFTER\_APPLY
- NO\_RESPONSE\_AFTER\_INTERVIEW
## <a name="b.-reminder-schedule-flags"></a>B. Reminder / Schedule Flags
Flags about dates the user should care about:

- FOLLOW\_UP\_OVERDUE
- UPCOMING\_EVENT

Detailed rules are defined in Section 13.

-----
# <a name="dashboard"></a>6.5 Dashboard
The dashboard must show:
## <a name="a.-summary-section"></a>A. Summary section
- total applications
- count by currentStatus
## <a name="b.-upcoming-events-section"></a>B. Upcoming events section
- events scheduled within the next 3 days
## <a name="c.-attention-needed-section"></a>C. Attention-needed section
Applications flagged for:

- no response after apply
- no response after interview
- overdue follow-up
-----
# <a name="search-filter-sort"></a>6.6 Search / Filter / Sort
The application list must support:

- text search by company or role
- filter by currentStatus
- sort by created time or updated time

Pagination is optional in V1 but recommended if easy to implement.

-----
# <a name="event-model"></a>7. Event Model
## <a name="supported-event-types"></a>7.1 Supported Event Types
ApplyFlow V1 supports these event types:

- applied
- hr\_call
- oa
- interview
- follow\_up
- offer
- rejected
- note
-----
## <a name="common-event-fields"></a>7.2 Common Event Fields
Every event should support the following common fields:

- \_id
- applicationId
- userId
- type
- title
- occurredAt (optional)
- scheduledAt (optional)
- note (optional)
- createdAt
- updatedAt

Optional communication fields:

- contactName
- contactPhone
- contactEmail

Optional logistics fields:

- mode — one of:
  - online
  - offline
  - phone
- location
- meetingLink
-----
## <a name="event-type-guidelines"></a>7.3 Event Type Guidelines
### <a name="applied-1"></a>applied
Represents the actual application submission.

Typical fields:

- occurredAt
- optional note
-----
### <a name="hr_call"></a>hr\_call
Represents an HR call or screening contact.

Typical fields:

- scheduledAt or occurredAt
- mode (often phone or online)
- contact info
- note
-----
### <a name="oa"></a>oa
Represents an online assessment or assignment.

Typical fields:

- scheduledAt
- note
- optional meeting link / platform note
-----
### <a name="interview"></a>interview
Represents an interview round.

Typical fields:

- scheduledAt
- occurredAt
- mode
- location or meetingLink
- contact info
- note

For V1, interview round labels such as “Round 1”, “Technical”, “Final” can live in:

- title
- or note

A dedicated round field is intentionally deferred.

-----
### <a name="follow_up"></a>follow\_up
Represents an actual follow-up action taken by the user, such as:

- sending a follow-up email
- messaging HR
- asking for update after interview

Typical fields:

- occurredAt
- contact info
- note
-----
### <a name="offer-1"></a>offer
Represents receiving an offer.

Typical fields:

- occurredAt
- note
-----
### <a name="rejected-1"></a>rejected
Represents receiving a rejection.

Typical fields:

- occurredAt
- note
-----
### <a name="note"></a>note
Represents a free-form timeline note.

Typical fields:

- optional occurredAt
- note
-----
# <a name="data-model"></a>8. Data Model
ApplyFlow V1 should use at least these collections:

- users
- applications
- application\_events
-----
# <a name="collection-schemas"></a>9. Collection Schemas
## <a name="users-collection"></a>9.1 users Collection
Suggested document shape:

json id="9vf8e2" {   "\_id": "ObjectId",   "displayName": "string",   "email": "string",   "passwordHash": "string",   "createdAt": "Date",   "updatedAt": "Date" }
### <a name="rules"></a>Rules
- email must be unique
- passwordHash must never be exposed to the client
-----
## <a name="applications-collection"></a>9.2 applications Collection
Suggested document shape:

\```json id=“n1p4kt” { “\_id”: “ObjectId”, “userId”: “ObjectId”,

“company”: “string”, “role”: “string”, “jdUrl”: “string | null”, “source”: “string | null”, “notes”: “string | null”,

“currentStatus”: “saved | applied | in\_process | offer | rejected | withdrawn”,

“followUpAt”: “Date | null”,

“createdAt”: “Date”, “updatedAt”: “Date” }

\
\### Required fields\
\- `userId`\
\- `company`\
\- `role`\
\- `currentStatus`\
\- `createdAt`\
\- `updatedAt`\
\
\### Optional fields\
\- `jdUrl`\
\- `source`\
\- `notes`\
\- `followUpAt`\
\
\---\
\
\## 9.3 `application\_events` Collection\
\
Suggested document shape:\
\
\```json id="s8ydz7"\
{\
`  `"\_id": "ObjectId",\
`  `"applicationId": "ObjectId",\
`  `"userId": "ObjectId",\
\
`  `"type": "applied | hr\_call | oa | interview | follow\_up | offer | rejected | note",\
`  `"title": "string",\
\
`  `"occurredAt": "Date | null",\
`  `"scheduledAt": "Date | null",\
\
`  `"mode": "online | offline | phone | null",\
`  `"location": "string | null",\
`  `"meetingLink": "string | null",\
\
`  `"contactName": "string | null",\
`  `"contactPhone": "string | null",\
`  `"contactEmail": "string | null",\
\
`  `"note": "string | null",\
\
`  `"createdAt": "Date",\
`  `"updatedAt": "Date"\
}
### <a name="required-fields"></a>Required fields
- applicationId
- userId
- type
- title
- createdAt
- updatedAt
### <a name="optional-fields"></a>Optional fields
- all time fields
- all contact fields
- all logistics fields
- note
-----
# <a name="validation-rules"></a>10. Validation Rules
# <a name="user-validation"></a>10.1 User Validation
## <a name="register-1"></a>Register
Required:

- displayName: non-empty string
- email: valid email format
- password: minimum 8 characters recommended
## <a name="login-1"></a>Login
Required:

- email
- password
-----
# <a name="application-validation"></a>10.2 Application Validation
## <a name="create-application"></a>Create application
Required:

- company: non-empty string
- role: non-empty string
- currentStatus: one of:
  - saved
  - applied
  - in\_process
  - offer
  - rejected
  - withdrawn

Optional:

- jdUrl: valid URL if provided
- source: string
- notes: string
- followUpAt: valid date if provided
## <a name="update-application"></a>Update application
All fields optional, but if provided:

- currentStatus must be valid
- followUpAt must be a valid date or explicit null
-----
# <a name="event-validation"></a>10.3 Event Validation
## <a name="create-event"></a>Create event
Required:

- type: valid event type
- title: non-empty string

Optional:

- occurredAt: valid date
- scheduledAt: valid date
- mode: online | offline | phone
- location: string
- meetingLink: string
- contactName: string
- contactPhone: string
- contactEmail: valid email if present
- note: string
## <a name="update-event"></a>Update event
All fields optional, but if provided they must be valid.

-----
# <a name="business-rules"></a>11. Business Rules
## <a name="ownership"></a>11.1 Ownership
Every application belongs to exactly one user.\
Every event belongs to exactly one user and one application.

All application/event queries must be scoped by authenticated userId.

-----
## <a name="event-ownership-consistency"></a>11.2 Event Ownership Consistency
When creating an event for an application:

- the application must exist
- the application must belong to the authenticated user
- the event must store the same userId as the application owner
-----
## <a name="current-status-is-user-controlled-in-v1"></a>11.3 Current Status Is User-Controlled in V1
In V1, currentStatus is primarily controlled by the user rather than fully auto-derived from events.

The UI may encourage status updates such as:

- after adding an interview event, the user may set currentStatus = in\_process
- after adding an offer event, the user may set currentStatus = offer
- after adding a rejected event, the user may set currentStatus = rejected

But the backend does **not** need to auto-sync status from event types in V1.

-----
## <a name="follow-up-behavior"></a>11.4 Follow-Up Behavior
followUpAt and follow\_up event are **different concepts**.
### <a name="followupat"></a>followUpAt
An application-level reminder date representing:

- when the user plans to follow up
- or when the user wants to revisit the application
### <a name="follow_up-event"></a>follow\_up event
A timeline record representing an actual follow-up action that already happened.

These two must not be merged.

-----
## <a name="deleting-an-application"></a>11.5 Deleting an Application
When an application is deleted:

- all events belonging to that application must also be deleted

V1 can use hard delete for simplicity.

-----
## <a name="timeline-ordering"></a>11.6 Timeline Ordering
Application detail timeline should be displayed in chronological order.

Suggested ordering priority: 1. occurredAt if present 2. else scheduledAt if present 3. else createdAt

Frontend may choose ascending or descending presentation, but the rule must be consistent.

-----
# <a name="dashboard-requirements"></a>12. Dashboard Requirements
The dashboard must show three main sections.
## <a name="status-summary"></a>12.1 Status Summary
Display:

- total applications
- counts by:
  - saved
  - applied
  - in\_process
  - offer
  - rejected
  - withdrawn
-----
## <a name="upcoming-events"></a>12.2 Upcoming Events
Display events scheduled within the next **3 days**.

Each item should show at least:

- event type
- title
- company
- role
- scheduled date/time
-----
## <a name="attention-needed"></a>12.3 Attention Needed
Display applications with active attention flags:

- NO\_RESPONSE\_AFTER\_APPLY
- NO\_RESPONSE\_AFTER\_INTERVIEW
- FOLLOW\_UP\_OVERDUE

Each item should show:

- company
- role
- flag type or human-friendly message
- relevant date / why it is flagged
-----
# <a name="attention-flag-logic"></a>13. Attention Flag Logic
Attention flags are **computed**, not manually created by the user.

Each flag object returned to the frontend should include at least:

- flagType
- applicationId
- company
- role
- message
- referenceDate
-----
## <a name="attention-flag-categories"></a>13.1 Attention Flag Categories
ApplyFlow V1 uses **two categories** of attention logic.
### <a name="a.-silence-flags-1"></a>A. Silence Flags
These represent waiting too long for company response:

- NO\_RESPONSE\_AFTER\_APPLY
- NO\_RESPONSE\_AFTER\_INTERVIEW
### <a name="b.-reminder-schedule-flags-1"></a>B. Reminder / Schedule Flags
These represent dates the user should care about:

- FOLLOW\_UP\_OVERDUE
- UPCOMING\_EVENT
-----
## <a name="eligibility-rule-for-silence-flags"></a>13.2 Eligibility Rule for Silence Flags
**Silence flags must only be evaluated for applications whose currentStatus is one of:**

- applied
- in\_process

Applications with status:

- saved
- offer
- rejected
- withdrawn

must **not** receive:

- NO\_RESPONSE\_AFTER\_APPLY
- NO\_RESPONSE\_AFTER\_INTERVIEW
### <a name="why"></a>Why
If an application is already:

- withdrawn,
- rejected,
- or otherwise no longer actively awaiting response,

showing “no response after apply/interview” would be misleading and bad UX.

-----
## <a name="flag-no_response_after_apply"></a>13.3 Flag: NO\_RESPONSE\_AFTER\_APPLY
### <a name="purpose"></a>Purpose
Detect applications where the user applied but there has been no recorded progress for too long.
### <a name="conditions"></a>Conditions
Flag an application if **all** of the following are true:

1. currentStatus is either:
   - applied
   - in\_process
1. the application has at least one applied event
1. take the **most recent** applied event
1. after that most recent applied event, there is **no later event** of type:
   - hr\_call
   - oa
   - interview
   - offer
   - rejected
   - follow\_up
1. at least **14 days** have passed since that applied event’s effective date
### <a name="effective-date-for-calculation"></a>Effective date for calculation
Use: 1. occurredAt if present 2. else scheduledAt if present 3. else do not generate this flag for that event because the reference date is unreliable
### <a name="example-message"></a>Example message
- “Applied 16 days ago but no response has been recorded yet.”
-----
## <a name="flag-no_response_after_interview"></a>13.4 Flag: NO\_RESPONSE\_AFTER\_INTERVIEW
### <a name="purpose-1"></a>Purpose
Detect applications where the user interviewed but has not recorded any later response or progress for too long.
### <a name="conditions-1"></a>Conditions
Flag an application if **all** of the following are true:

1. currentStatus is either:
   - applied
   - in\_process
1. the application has at least one interview event
1. take the **most recent** interview event
1. after that most recent interview event, there is **no later event** of type:
   - offer
   - rejected
   - follow\_up
   - interview
1. at least **7 days** have passed since that interview event’s effective date
### <a name="effective-date-for-calculation-1"></a>Effective date for calculation
Use: 1. occurredAt if present 2. else scheduledAt if present 3. else do not generate this flag for that event
### <a name="example-message-1"></a>Example message
- “Interview completed 8 days ago but no response has been recorded yet.”
-----
## <a name="flag-follow_up_overdue"></a>13.5 Flag: FOLLOW\_UP\_OVERDUE
### <a name="purpose-2"></a>Purpose
Detect applications whose follow-up date has passed.
### <a name="conditions-2"></a>Conditions
Flag an application if: 1. followUpAt exists 2. followUpAt is earlier than the current date/time 3. currentStatus is **not** one of:

- rejected
- withdrawn
### <a name="notes"></a>Notes
- This flag can still apply to:
  - saved
  - applied
  - in\_process
  - optionally offer if the product later decides offer follow-up matters
- For V1, a simple and safe rule is:
  - allow for saved, applied, in\_process
  - do not show for rejected or withdrawn
### <a name="recommended-v1-implementation"></a>Recommended V1 implementation
Show FOLLOW\_UP\_OVERDUE only when currentStatus is one of:

- saved
- applied
- in\_process

This keeps the UX simple and avoids awkward follow-up reminders for closed cases.
### <a name="example-message-2"></a>Example message
- “Follow-up date has passed.”
-----
## <a name="flag-section-upcoming_event"></a>13.6 Flag / Section: UPCOMING\_EVENT
### <a name="purpose-3"></a>Purpose
Surface scheduled events happening soon.
### <a name="conditions-3"></a>Conditions
An event is considered upcoming if: 1. scheduledAt exists 2. scheduledAt is within the next **3 days** 3. the parent application is not in a terminal/closed state where the event is no longer relevant
### <a name="recommended-v1-rule"></a>Recommended V1 rule
Only include upcoming events if application currentStatus is one of:

- saved
- applied
- in\_process

Do not include if:

- rejected
- withdrawn

Handling of offer can be deferred, but for V1 it is simpler to exclude it from upcoming events unless there is a strong product reason otherwise.
### <a name="ux-note"></a>UX note
UPCOMING\_EVENT may be returned in the dashboard’s “Upcoming Events” section instead of mixing it into the same list as silence flags.

-----
# <a name="api-requirements"></a>14. API Requirements
All API paths below assume a base prefix such as:

/api/v1

-----
# <a name="auth-apis"></a>14.1 Auth APIs
## <a name="post-authregister"></a>POST /auth/register
Create a new user account.
### <a name="request-body"></a>Request body
json id="fxm2w1" {   "displayName": "dazoriii",   "email": "user@example.com",   "password": "12345678" }
### <a name="response"></a>Response
Return:

- success message
- created user info without password hash

Auto-login after register is optional for V1. Simpler option:

- register only creates account
- user logs in separately
-----
## <a name="post-authlogin"></a>POST /auth/login
Authenticate a user.
### <a name="request-body-1"></a>Request body
json id="h1rq8n" {   "email": "user@example.com",   "password": "12345678" }
### <a name="response-example"></a>Response example
json id="o5jv3c" {   "message": "Login successful",   "accessToken": "jwt-token",   "user": {     "\_id": "user-id",     "displayName": "dazoriii",     "email": "user@example.com"   } }

-----
## <a name="get-authme"></a>GET /auth/me
Return current authenticated user.

Requires:

- valid JWT
-----
# <a name="application-apis"></a>14.2 Application APIs
## <a name="post-applications"></a>POST /applications
Create a new application.
### <a name="request-body-example"></a>Request body example
json id="k2m8sa" {   "company": "OpenAI",   "role": "Frontend Intern",   "jdUrl": "https://example.com/job",   "source": "LinkedIn",   "notes": "Looks interesting",   "currentStatus": "saved",   "followUpAt": "2026-07-15T00:00:00.000Z" }
### <a name="behavior"></a>Behavior
- application belongs to authenticated user
- server sets createdAt and updatedAt
-----
## <a name="get-applications"></a>GET /applications
Get the authenticated user’s applications.
### <a name="supported-query-params"></a>Supported query params
- search
- status
- sortBy
- sortOrder
### <a name="example"></a>Example
GET /applications?search=frontend&status=in\_process&sortBy=updatedAt&sortOrder=desc
### <a name="response-1"></a>Response
Should return a list of applications.\
Pagination metadata is optional in V1.

-----
## <a name="get-applicationsapplicationid"></a>GET /applications/:applicationId
Get one application detail.
### <a name="response-2"></a>Response
At minimum, return the application document.

Recommended V1 design:

- GET /applications/:applicationId → application detail only
- GET /applications/:applicationId/events → timeline events separately

This keeps backend responsibilities clearer.

-----
## <a name="patch-applicationsapplicationid"></a>PATCH /applications/:applicationId
Update an application.

Allowed fields:

- company
- role
- jdUrl
- source
- notes
- currentStatus
- followUpAt
-----
## <a name="delete-applicationsapplicationid"></a>DELETE /applications/:applicationId
Delete an application and its events.

-----
# <a name="event-apis"></a>14.3 Event APIs
## <a name="post-applicationsapplicationidevents"></a>POST /applications/:applicationId/events
Create a new event for an application.
### <a name="request-body-example-1"></a>Request body example
json id="g7zt4p" {   "type": "interview",   "title": "Technical Interview",   "scheduledAt": "2026-07-10T14:00:00.000Z",   "mode": "online",   "meetingLink": "https://meet.google.com/...",   "contactName": "HR Nguyen",   "contactEmail": "hr@example.com",   "note": "Prepare React and JavaScript questions" }

-----
## <a name="get-applicationsapplicationidevents"></a>GET /applications/:applicationId/events
Get timeline events for an application.
### <a name="response-3"></a>Response
Return events sorted chronologically according to the timeline ordering rule.

-----
## <a name="xd6dbbf1aa9a13d75539874c702390083c99b11a"></a>PATCH /applications/:applicationId/events/:eventId
Update an event.

-----
## <a name="xfe1314180da3eeab410592a7997f833757b0fef"></a>DELETE /applications/:applicationId/events/:eventId
Delete an event.

-----
# <a name="dashboard-api"></a>14.4 Dashboard API
## <a name="get-dashboardsummary"></a>GET /dashboard/summary
Return dashboard information for the authenticated user.
### <a name="suggested-response-shape"></a>Suggested response shape
json id="c9u4mr" {   "totalApplications": 11,   "statusCounts": {     "saved": 3,     "applied": 5,     "in\_process": 2,     "offer": 0,     "rejected": 1,     "withdrawn": 0   },   "upcomingEvents": [     {       "eventId": "evt\_1",       "applicationId": "app\_1",       "company": "OpenAI",       "role": "Frontend Intern",       "type": "interview",       "title": "Technical Interview",       "scheduledAt": "2026-07-10T14:00:00.000Z"     }   ],   "attentionFlags": [     {       "flagType": "NO\_RESPONSE\_AFTER\_APPLY",       "applicationId": "app\_2",       "company": "Company A",       "role": "Backend Intern",       "message": "Applied 15 days ago but no response has been recorded yet.",       "referenceDate": "2026-06-17T00:00:00.000Z"     }   ] }

-----
# <a name="frontend-page-requirements"></a>15. Frontend Page Requirements
ApplyFlow V1 should include at least these pages.
## <a name="login-page"></a>15.1 Login Page
Must include:

- email field
- password field
- login action
- link to register page
-----
## <a name="register-page"></a>15.2 Register Page
Must include:

- display name
- email
- password
- register action
-----
## <a name="dashboard-page"></a>15.3 Dashboard Page
Must show:

- status summary cards
- upcoming events
- attention-needed applications
-----
## <a name="applications-page"></a>15.4 Applications Page
Must show:

- application list
- search input
- status filter
- button to create application
- edit/delete actions

The list can be table-based or card-based.\
V1 does not need a kanban board.

-----
## <a name="application-detail-page"></a>15.5 Application Detail Page
Must show:
### <a name="a.-application-overview"></a>A. Application Overview
- company
- role
- current status
- source
- jdUrl
- followUpAt
- notes
### <a name="b.-recruitment-timeline"></a>B. Recruitment Timeline
- list of events in chronological order
- add event action
- edit event action
- delete event action
### <a name="c.-optional-attention-display"></a>C. Optional Attention Display
If the application currently has relevant flags, they may be shown on the detail page too.

-----
# <a name="error-handling-requirements"></a>16. Error Handling Requirements
The backend should return consistent JSON error responses.

Recommended response shape:

json id="t7r3ma" {   "message": "Validation failed",   "errors": {     "company": "Company is required"   } }

Or for general errors:

json id="m6s9kd" {   "message": "Application not found" }

Minimum error cases to handle:

- invalid input
- unauthorized request
- forbidden access to another user’s data
- resource not found
- invalid ObjectId / malformed id
- internal server error
-----
# <a name="suggested-default-thresholds"></a>17. Suggested Default Thresholds
These values are fixed for V1:

- **No response after apply** → 14 days
- **No response after interview** → 7 days
- **Upcoming event window** → next 3 days

These should be defined in a central constants/config layer so they can be changed later without rewriting business logic.

-----
# <a name="suggested-milestones"></a>18. Suggested Milestones
## <a name="milestone-1-foundation"></a>Milestone 1 — Foundation
- project setup
- environment config
- MongoDB connection
- auth routes and middleware
- frontend routing and auth flow
## <a name="milestone-2-applications-crud"></a>Milestone 2 — Applications CRUD
- create/list/detail/update/delete applications
- search/filter/sort
## <a name="milestone-3-event-timeline"></a>Milestone 3 — Event Timeline
- create/list/update/delete events
- application detail timeline UI
## <a name="milestone-4-dashboard-attention-logic"></a>Milestone 4 — Dashboard & Attention Logic
- status summary
- upcoming events
- no-response flags
- overdue follow-up flags
## <a name="milestone-5-cleanup"></a>Milestone 5 — Cleanup
- validation
- error handling
- loading states
- README
- sample seed data if needed
-----
# <a name="open-decisions-intentionally-deferred"></a>19. Open Decisions Intentionally Deferred
These decisions are intentionally **not finalized** in V1:

- whether currentStatus should auto-sync from event types
- whether a follow\_up event should automatically clear an overdue follow-up reminder
- whether interviews need a dedicated round field
- whether applications should have a primary contact field in addition to event-level contacts
- whether reminder thresholds should become user-configurable
- whether offer-specific follow-up logic should exist
- whether email integration should be added later

These should not block V1 implementation.

-----
# <a name="final-summary"></a>20. Final Summary
ApplyFlow V1 is a **personal internship recruitment tracker** with three core capabilities:
## <a name="application-tracking-1"></a>1. Application tracking
Store:

- company
- role
- status
- source
- notes
- follow-up date
## <a name="recruitment-timeline-tracking"></a>2. Recruitment timeline tracking
Track:

- applied
- HR call
- OA
- interview
- follow-up
- offer
- rejection
- note
## <a name="reminder-attention-support-1"></a>3. Reminder / attention support
Surface:

- applications silent too long after apply
- applications silent too long after interview
- overdue follow-up
- upcoming scheduled events

The product is successful if the user can open it and quickly understand:

- which companies they applied to
- what stage each application is in
- what interviews or follow-ups are coming up
- which applications need attention right now
