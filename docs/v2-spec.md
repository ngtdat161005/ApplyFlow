# ApplyFlow — V2 Specification

## 1. Product Overview

### 1.1 Product Name

**ApplyFlow**

### 1.2 Product Type

A personal web application for tracking internship/job application progress, recruitment timeline events, follow-up dates, and attention-needed cases.

ApplyFlow is not:

- a job board
- a recruiting platform
- an ATS for companies
- an email automation tool
- an AI job application system

### 1.3 V2 Product Goal

ApplyFlow V2 improves the existing V1 project into a more reliable, testable, maintainable, and explainable student portfolio project.

V2 should make the app stronger in four areas:

1. **Correctness**
   - existing V1 behavior should remain stable
   - user data must remain private and scoped
   - validation and error handling should be predictable

2. **QA Evidence**
   - important flows should have manual test cases
   - backend behavior should have smoke/E2E checks where practical
   - regression checklist should be usable after each task

3. **Frontend Reliability**
   - important pages should handle loading, empty, error, and validation states
   - list/detail/dashboard flows should be easier to test and explain
   - UI should remain consistent without unnecessary redesign

4. **Interview Explainability**
   - the project should be easy to explain in a software/testing internship interview
   - the repository should show controlled task-based development
   - README and docs should describe what was tested and why

### 1.4 V2 Philosophy

V2 should be **quality-focused, not feature-bloated**.

V2 is successful if ApplyFlow feels like a verified personal productivity tool, not just a CRUD demo.

V2 must avoid turning into:

- a full recruitment CRM
- a company-side ATS
- a heavy analytics dashboard
- an AI application automation platform
- a dependency-heavy frontend experiment
- a complete rewrite

### 1.5 Target User

Primary target users remain:

- students applying for internships
- new graduates applying for entry-level roles
- individuals who want a private application tracker
- users who need visibility into status, events, follow-ups, and pending actions

---

## 2. V1 Baseline

### 2.1 Current V1 Baseline

ApplyFlow V1 is expected to provide the following product capabilities according to the V1 specification and current implementation history.

Before any V2 feature work, the actual repository must be audited to confirm which capabilities are fully implemented, partially implemented, or only documented.

V2 tasks must not assume a capability exists unless it is verified in the current repository.

Expected V1 capability areas:

#### Authentication

- register
- login
- frontend logout by clearing local auth state/token
- get current user
- protected routes
- JWT authentication
- password hashing
- no password hash exposure

#### Application Management

- create application
- list applications
- search applications
- filter applications by status
- view application details
- update application
- delete application

#### Recruitment Event Tracking

- create event for an application
- list application events
- update event
- delete event
- timeline-like recruitment history

#### Reminder / Attention Support

- follow-up date support
- no response after applying
- no response after interview
- overdue follow-up
- upcoming scheduled events

#### Dashboard

- total application count
- count by status
- upcoming events
- attention-needed applications

#### V2 Polish Candidates Requiring Verification

The following items may exist in the repository or may be V2 improvements, but they must not be treated as guaranteed V1 baseline behavior until audited:

- dashboard recent applications
- `followUpAt` sorting
- expanded frontend loading/empty/error states
- stronger backend smoke/E2E checks
- README testing section

#### QA / Tooling

- backend check scripts
- frontend build check
- manual frontend test documentation
- regression checklist
- GitHub Actions CI for no-secret backend checks and frontend build
- PR template
- Codex workflow docs
- repo-local Codex agent skills

### 2.2 V1 Preservation Rule

V2 must preserve V1 behavior unless a V2 task explicitly changes it.

Codex must not silently change:

- API response shapes
- route paths
- authentication flow
- authorization behavior
- database collection names
- status values
- event type values
- attention flag semantics
- frontend routing
- existing environment variable names

Any breaking change must be:

1. explicitly approved in the task
2. documented in the task summary
3. covered by updated tests/checklists

---

## 3. Product Scope

## 3.1 In Scope for V2

ApplyFlow V2 may improve the following areas.

### A. Application List Search / Filter / Sort Polish

V2 should make application list behavior clear, consistent, and testable.

Supported behavior:

- search by company
- search by role
- filter by `currentStatus`
- sort by supported fields
- handle empty results
- handle invalid query values safely
- preserve user scoping

### B. Application Detail UX Polish

V2 should make the detail page reliable and testable.

Supported behavior:

- loading state
- not-found state
- error state
- refresh behavior
- clear edit/delete behavior
- safe navigation after delete
- visible event timeline section
- clear empty timeline state

### C. Event Timeline / Interview Tracking Polish

V2 should improve recruitment event tracking without adding calendar/email integration.

Supported behavior:

- predictable timeline ordering
- clear event type usage
- better interview event handling
- validation for date/contact/logistics fields
- safe access control
- clear frontend state for event lists/forms

### D. Dashboard Reliability Polish

V2 should make dashboard metrics easier to trust.

Supported behavior:

- status count correctness
- recent application correctness
- upcoming event correctness
- attention flag correctness
- empty dashboard state
- frontend should not duplicate backend attention logic

### E. Frontend State Consistency

Major pages should consistently handle:

- loading
- empty data
- API error
- validation error
- unauthorized/redirect state where relevant
- refresh behavior
- basic responsive sanity

### F. QA and Regression Evidence

V2 must improve QA evidence.

Expected improvements:

- stronger backend smoke/E2E checks where practical
- clearer manual frontend regression checklist
- updated test plan
- README testing section in a dedicated approved documentation task near the end of V2
- final V2 regression pass

### G. Repo Workflow and Codex Control

V2 should follow a controlled AI-assisted development loop:

```txt
spec
→ task
→ branch
→ implement
→ run checks
→ audit diff
→ fix
→ manual test
→ commit
→ merge
```

---

## 3.2 Out of Scope for V2

V2 must not include these unless explicitly approved later:

- AI resume matching
- AI cover letter generation
- AI interview answer generation
- automatic job application submission
- job board functionality
- job scraping / browser extension
- email inbox integration
- automatic email parsing
- calendar integration
- realtime notifications
- push notifications
- team collaboration
- company/recruiter accounts
- admin dashboard
- kanban board / drag-and-drop workflow
- file upload for CV/documents
- full contact management system
- user-configurable reminder thresholds
- payment/subscription
- complex deployment pipeline
- major backend rewrite
- major frontend rewrite
- migration away from MongoDB
- unapproved UI framework migration

---

## 4. Architecture Preservation

V2 must preserve the V1 modular monolith architecture.

Backend must continue to follow this layered flow:

```txt
Route
→ Middleware
→ Controller
→ Service
→ Repository
→ MongoDB
```

Rules:

- Controllers handle HTTP concerns only.
- Services handle business logic and orchestration.
- Repositories handle MongoDB access.
- Attention and timeline business rules stay in domain modules.
- MongoDB logic must not move into controllers.
- Business rules must not be hidden in repositories.
- Codex must not add generic CRUD base classes or heavy abstractions.
- Codex must not introduce Mongoose, Prisma, microservices, Redux/global state overhaul, background jobs, or major architectural changes unless explicitly approved.

Frontend must preserve the existing route/page/feature separation where practical:

- route-level pages stay under page-level folders
- reusable application UI stays under application-related feature/component folders
- reusable event UI stays under event-related feature/component folders
- API calls stay in the frontend API layer rather than being scattered across random components

---

## 5. Core Domain Concepts

V2 preserves the V1 domain model.

## 5.1 Application

An **Application** represents one internship/job opportunity for a company and role.

Examples:

- Frontend Intern at Company A
- Backend Intern at Company B
- Software Engineering Intern at Company C

An application stores:

- company
- role
- source
- job description URL
- notes
- current status
- follow-up date
- created/updated timestamps
- recruitment event timeline

### V2 Rule

Application remains the main parent entity.

V2 must not split Application into multiple new domain models unless explicitly approved.

---

## 5.2 Recruitment Event

A **Recruitment Event** represents something that happened or is scheduled to happen in the recruitment process.

Examples:

- applied
- HR call
- online assessment
- interview
- follow-up
- offer
- rejection
- note

### V2 Rule

Events remain attached to one application and one user.

Events must not become global calendar events in V2.

---

## 5.3 Attention Flag

An **Attention Flag** is a computed signal telling the user that an application may need attention.

Examples:

- no response after applying
- no response after interview
- follow-up overdue

### V2 Rule

Attention flags remain system-generated.

Users do not manually create attention flags in V2.

Upcoming events should be shown in the dashboard upcoming events section rather than duplicated as attention flags by default.

---

## 6. Status Model

Each application has exactly one `currentStatus`.

Allowed values:

- `saved`
- `applied`
- `in_process`
- `offer`
- `rejected`
- `withdrawn`

## 6.1 Meaning of Each Status

### saved

The user saved the opportunity but has not applied yet.

### applied

The user has applied, but no meaningful recruitment progress has been recorded yet.

### in_process

The application is actively moving through recruitment.

Examples:

- HR call
- OA
- interview
- waiting after interview

### offer

The user received an offer.

### rejected

The company rejected the user.

### withdrawn

The user stopped pursuing the application.

## 6.2 Status vs Event Rule

`currentStatus` is an application-level summary.

Detailed progress belongs to the event timeline.

Examples:

- “Technical interview scheduled on July 10” → event
- “Application is actively progressing” → `currentStatus = in_process`

## 6.3 V2 Status Rule

V2 must not automatically derive `currentStatus` from event types unless explicitly approved.

The user remains responsible for setting the current overall status.

The UI may encourage consistency, but the backend should not silently auto-change status in V2.

---

## 7. Event Model

## 7.1 Supported Event Types

V2 preserves the existing event types:

- `applied`
- `hr_call`
- `oa`
- `interview`
- `follow_up`
- `offer`
- `rejected`
- `note`

## 7.2 Common Event Fields

Each event should support:

- `_id`
- `applicationId`
- `userId`
- `type`
- `title`
- `occurredAt`
- `scheduledAt`
- `mode`
- `location`
- `meetingLink`
- `contactName`
- `contactPhone`
- `contactEmail`
- `note`
- `createdAt`
- `updatedAt`

## 7.3 Event Type Guidelines

### applied

Represents actual application submission.

Typical fields:

- `occurredAt`
- optional `note`

### hr_call

Represents HR call or screening contact.

Typical fields:

- `scheduledAt` or `occurredAt`
- `mode`
- contact info
- `note`

### oa

Represents online assessment or assignment.

Typical fields:

- `scheduledAt`
- platform/link in `meetingLink` or `note`
- `note`

### interview

Represents an interview round.

Typical fields:

- `scheduledAt`
- `occurredAt`
- `mode`
- `location` or `meetingLink`
- contact info
- `note`

V2 does not require a dedicated interview round field.

Round labels may stay in:

- `title`
- `note`

Examples:

- “Technical Interview”
- “Round 1 Interview”
- “Final Interview”

### follow_up

Represents an actual follow-up action taken by the user.

Typical fields:

- `occurredAt`
- contact info
- `note`

### offer

Represents receiving an offer.

Typical fields:

- `occurredAt`
- `note`

### rejected

Represents receiving a rejection.

Typical fields:

- `occurredAt`
- `note`

### note

Represents a free-form timeline note.

Typical fields:

- optional `occurredAt`
- `note`

---

## 8. Data Model

V2 preserves the V1 collections:

- `users`
- `applications`
- `application_events`

V2 must not rename collections unless explicitly approved.

---

## 9. Collection Schemas

## 9.1 users Collection

Suggested shape:

```json
{
  "_id": "ObjectId",
  "displayName": "string",
  "email": "string",
  "passwordHash": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Rules:

- `email` must be unique
- `passwordHash` must never be exposed to the client
- API responses must return safe user objects only

---

## 9.2 applications Collection

Suggested shape:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",

  "company": "string",
  "role": "string",
  "jdUrl": "string | null",
  "source": "string | null",
  "notes": "string | null",

  "currentStatus": "saved | applied | in_process | offer | rejected | withdrawn",

  "followUpAt": "Date | null",

  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Required fields:

- `userId`
- `company`
- `role`
- `currentStatus`
- `createdAt`
- `updatedAt`

Optional fields:

- `jdUrl`
- `source`
- `notes`
- `followUpAt`

Rules:

- each application belongs to exactly one user
- all queries must be scoped by authenticated `userId`
- deleting an application must delete its events

---

## 9.3 application_events Collection

Suggested shape:

```json
{
  "_id": "ObjectId",
  "applicationId": "ObjectId",
  "userId": "ObjectId",

  "type": "applied | hr_call | oa | interview | follow_up | offer | rejected | note",
  "title": "string",

  "occurredAt": "Date | null",
  "scheduledAt": "Date | null",

  "mode": "online | offline | phone | null",
  "location": "string | null",
  "meetingLink": "string | null",

  "contactName": "string | null",
  "contactPhone": "string | null",
  "contactEmail": "string | null",

  "note": "string | null",

  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Required fields:

- `applicationId`
- `userId`
- `type`
- `title`
- `createdAt`
- `updatedAt`

Optional fields:

- `occurredAt`
- `scheduledAt`
- `mode`
- `location`
- `meetingLink`
- `contactName`
- `contactPhone`
- `contactEmail`
- `note`

Rules:

- event `userId` must match the parent application owner
- users cannot access events belonging to other users
- event operations should verify parent application ownership

---

## 10. Functional Requirements

### 10.1 Authentication

V2 preserves V1 authentication.

The system must support:

- register
- login
- get current user
- frontend logout by clearing local auth state/token

V2 does not require a backend logout endpoint unless the current implementation already has one or a task explicitly adds token invalidation.

Security rules:

- hash passwords before storing
- never return password hashes
- protect private routes with JWT
- reject unauthorized requests
- scope user data by authenticated `userId`

V2 must not add OAuth unless explicitly approved.

---

### 10.2 Application Management

The system must allow authenticated users to:

- create application
- list their own applications
- search applications
- filter applications
- sort applications
- view application detail
- update application
- delete application

The system must ensure:

- user A cannot read user B’s applications
- user A cannot update user B’s applications
- user A cannot delete user B’s applications
- malformed ObjectIds are handled safely
- forbidden fields cannot be updated
- deleting an application deletes its events

---

### 10.3 Application Search / Filter / Sort

## 10.3.1 Supported Query Parameters

Application list must support these query parameters if the current backend contract already exposes list querying, or if the assigned V2 task is specifically about application list polish:

- `search`
- `status`
- `sortBy`
- `sortOrder`

Example:

```txt
GET /applications?search=frontend&status=in_process&sortBy=updatedAt&sortOrder=desc
```

## 10.3.2 Search Behavior

`search` should match:

- company
- role

Rules:

- search should be case-insensitive if practical
- empty search should behave like no search
- search must only return applications owned by the authenticated user
- search must not expose other users’ data

## 10.3.3 Status Filter Behavior

`status` should match `currentStatus`.

Allowed values:

- `saved`
- `applied`
- `in_process`
- `offer`
- `rejected`
- `withdrawn`

Invalid status behavior is mandatory:

```txt
Return 400 for invalid status.
```

## 10.3.4 Sort Behavior

V1 required sorting by created time or updated time.

V2 supported `sortBy` values for an assigned application-list polish task:

- `createdAt`
- `updatedAt`
- `followUpAt`

`followUpAt` sorting is a V2 extension, not a guaranteed V1 baseline behavior. It must only be implemented by a task that explicitly includes application list query polish.

Additional fields such as `company`, `role`, or `currentStatus` are deferred unless explicitly approved in a task.

Supported `sortOrder` values:

- `asc`
- `desc`

Default sort:

```txt
sortBy=updatedAt
sortOrder=desc
```

Invalid sort behavior is mandatory:

```txt
Return 400 for invalid sortBy or sortOrder.
```

## 10.3.5 Empty Result Behavior

If search/filter returns no applications:

- backend returns an empty list
- frontend shows a clear empty state
- frontend must not show this as an error

Example empty message:

```txt
No applications match your current filters.
```

---

### 10.4 Application Detail

The system must allow authenticated users to view one application.

Frontend detail page must handle:

- valid application
- nonexistent application
- invalid application ID
- unauthorized request
- loading state
- API error state
- refresh behavior

Detail page should show:

- company
- role
- current status
- source
- jdUrl
- followUpAt
- notes
- created/updated time if available
- event timeline section
- edit action
- delete action

After delete:

- user should be navigated safely
- stale deleted data should not remain visible
- application list should no longer show deleted item

---

### 10.5 Recruitment Event Management

The system must allow authenticated users to:

- create event for their own application
- list events for their own application
- update event
- delete event

Rules:

- parent application must exist
- parent application must belong to authenticated user
- event must belong to the same user
- event operations must be scoped by both application and user where practical
- invalid ObjectId must be handled safely

---

### 10.6 Timeline Ordering

Backend event listing should return events sorted by effective event date.

Effective date priority:

1. `occurredAt`
2. `scheduledAt`
3. `createdAt`

Default backend order:

```txt
ascending chronological order
```

Frontend may choose to visually display newest-first only if the task explicitly says so, but it must not change the effective-date rule.

The chosen display order must be consistent across refreshes.

---

### 10.7 Dashboard

Dashboard must show:

## A. Summary Section

- total applications
- counts by:
  - `saved`
  - `applied`
  - `in_process`
  - `offer`
  - `rejected`
  - `withdrawn`

## B. Recent Applications Section

`recentApplications` is a V2 dashboard polish item, not part of the guaranteed V1 dashboard baseline.

It must only be implemented or changed by a task that explicitly includes dashboard reliability or dashboard response-shape work.

If implemented, it must follow these rules:

- recently created or updated applications
- must be scoped to current user

## C. Upcoming Events Section

- events scheduled within the next 3 days
- must include company and role context
- must be scoped to current user

## D. Attention Needed Section

Applications flagged for:

- `NO_RESPONSE_AFTER_APPLY`
- `NO_RESPONSE_AFTER_INTERVIEW`
- `FOLLOW_UP_OVERDUE`

Frontend rule:

- dashboard frontend should display backend-derived data
- frontend should not reimplement attention flag business logic unless explicitly approved

### Dashboard Date, Limit, and Ordering Rules

Dashboard calculations use server time and UTC date comparisons.

`upcomingEvents` includes events where:

1. `scheduledAt` exists
2. `scheduledAt >= now`
3. `scheduledAt < now + 3 days`
4. parent application `currentStatus` is one of:
   - `saved`
   - `applied`
   - `in_process`

Closed statuses are:

- `offer`
- `rejected`
- `withdrawn`

Default ordering:

- `recentApplications`: `updatedAt desc`, then `createdAt desc`, then `_id asc`
- `upcomingEvents`: `scheduledAt asc`, then `createdAt asc`, then `_id asc`
- `attentionFlags`: `referenceDate asc`, then `applicationId asc`, then `flagType asc`

Default limits must be defined by the task before implementation. If no limit is specified, return all matching records.

Dashboard empty state definitions:

- zero applications: show a whole-dashboard empty state
- applications exist but one dashboard subsection is empty: show an empty state only for that subsection
- empty arrays from the backend are valid data, not API errors

---

## 11. Attention Flag Logic

V2 preserves the V1 attention flag concepts.

Attention flags are computed, not manually created.

Each flag object should include at least:

- `flagType`
- `applicationId`
- `company`
- `role`
- `message`
- `referenceDate`

## 11.1 Supported Reminder Outputs

ApplyFlow has two reminder-related outputs:

1. `attentionFlags`
   - `NO_RESPONSE_AFTER_APPLY`
   - `NO_RESPONSE_AFTER_INTERVIEW`
   - `FOLLOW_UP_OVERDUE`

2. `upcomingEvents`
   - events with `scheduledAt` within the next 3 days

`UPCOMING_EVENT` may exist as an internal concept, but V2 should not return it inside `attentionFlags` by default.

Upcoming events should be returned in the dashboard `upcomingEvents` section to avoid duplicate display.

---

## 11.2 Eligibility Rule for Silence Flags

Silence flags must only be evaluated for applications whose `currentStatus` is:

- `applied`
- `in_process`

Applications with these statuses must not receive silence flags:

- `saved`
- `offer`
- `rejected`
- `withdrawn`

---

## 11.3 NO_RESPONSE_AFTER_APPLY

Flag an application if all conditions are true:

1. `currentStatus` is `applied` or `in_process`
2. the application has at least one `applied` event
3. use the most recent `applied` event
4. after that event, there is no later event of type:
   - `hr_call`
   - `oa`
   - `interview`
   - `offer`
   - `rejected`
   - `follow_up`
5. at least 14 days have passed since the effective date

Effective date:

1. `occurredAt` if present
2. else `scheduledAt` if present
3. else do not generate this flag for that event

Example message:

```txt
Applied 16 days ago but no response has been recorded yet.
```

---

## 11.4 NO_RESPONSE_AFTER_INTERVIEW

Flag an application if all conditions are true:

1. `currentStatus` is `applied` or `in_process`
2. the application has at least one `interview` event
3. use the most recent `interview` event
4. after that event, there is no later event of type:
   - `offer`
   - `rejected`
   - `follow_up`
   - `interview`
5. at least 7 days have passed since the effective date

Effective date:

1. `occurredAt` if present
2. else `scheduledAt` if present
3. else do not generate this flag

Example message:

```txt
Interview completed 8 days ago but no response has been recorded yet.
```

---

## 11.5 FOLLOW_UP_OVERDUE

Flag an application if:

1. `followUpAt` exists
2. `followUpAt` is earlier than current date/time
3. `currentStatus` is one of:
   - `saved`
   - `applied`
   - `in_process`

Do not show for:

- `offer`
- `rejected`
- `withdrawn`

V2 should not change this rule unless explicitly approved.

---

## 11.6 Upcoming Events

Upcoming events are not returned inside `attentionFlags` by default.

They are returned in the dashboard `upcomingEvents` section.

An event is upcoming if all conditions are true:

1. `scheduledAt` exists
2. `scheduledAt >= now`
3. `scheduledAt < now + 3 days`
4. parent application `currentStatus` is one of:
   - `saved`
   - `applied`
   - `in_process`

Closed statuses are:

- `offer`
- `rejected`
- `withdrawn`

Closed applications must not produce upcoming dashboard events in V2 unless a task explicitly changes this rule.

---

## 11.7 Attention Event Ordering Rule

For attention flag calculations, “later event” means an event whose effective event date is later than the reference event’s effective event date.

Effective event date priority for ordering:

1. `occurredAt`
2. `scheduledAt`
3. `createdAt`

If two events have the same effective event date, use `createdAt` as the tie-breaker.

If still tied, use `_id` for stable ordering.

For threshold calculation in `NO_RESPONSE_AFTER_APPLY` and `NO_RESPONSE_AFTER_INTERVIEW`, the reference event must still have either `occurredAt` or `scheduledAt`. If both are missing, do not generate the flag for that reference event because the business reference date is unreliable.

---

## 12. Validation Rules

### 12.1 User Validation

## Register

Required:

- `displayName`: non-empty string
- `email`: valid email format
- `password`: minimum 8 characters recommended

## Login

Required:

- `email`
- `password`

---

### 12.2 Application Validation

## Create Application

Required:

- `company`: non-empty string
- `role`: non-empty string
- `currentStatus`: valid status

V2 does not define a default `currentStatus`. If the current implementation already defaults it, that behavior must be verified before relying on it. Otherwise, create requests should provide `currentStatus`.

Optional:

- `jdUrl`: valid URL if provided
- `source`: string or null
- `notes`: string or null
- `followUpAt`: valid ISO 8601 date string or null

## Update Application

All fields optional, but if provided:

- `company`: non-empty string
- `role`: non-empty string
- `jdUrl`: valid URL or null
- `source`: string or null
- `notes`: string or null
- `currentStatus`: valid status
- `followUpAt`: valid ISO 8601 date string or null

Forbidden updates:

- `_id`
- `userId`
- `createdAt`
- `updatedAt`

---

### 12.3 Event Validation

## Create Event

Required:

- `type`: valid event type
- `title`: non-empty string

Optional:

- `occurredAt`: valid date
- `scheduledAt`: valid date
- `mode`: `online | offline | phone`
- `location`: string
- `meetingLink`: valid URL if present
- `contactName`: string
- `contactPhone`: plain string in V2
- `contactEmail`: valid email if present
- `note`: string

## Update Event

All fields optional, but provided fields must be valid.

Forbidden updates:

- `_id`
- `applicationId`
- `userId`
- `createdAt`
- `updatedAt`

---

### 12.4 Query Validation

For application list:

- invalid `status` must return `400`
- invalid `sortBy` must return `400`
- invalid `sortOrder` must return `400`
- empty `search` must not error
- search values must be trimmed before use
- whitespace-only search must behave like no search
- multi-word search may be treated as one case-insensitive substring unless a task explicitly defines tokenized search
- unknown query params may be ignored unless a task defines stricter behavior

Controlled validation error shape:

```json
{
  "message": "Validation failed",
  "errors": {
    "sortBy": "Unsupported sort field"
  }
}
```

### 12.5 Shared Validation Policy

For V2-touched create/update endpoints:

- trim string fields before validating
- reject required string fields that are empty after trimming
- allow nullable optional fields to be cleared with `null`
- reject invalid enum values with `400`
- reject malformed dates with `400`
- reject forbidden update fields with `400`
- reject unknown request body fields with `400` unless verified V1 behavior already ignores them

Application update validation applies to:

- `company`
- `role`
- `jdUrl`
- `source`
- `notes`
- `currentStatus`
- `followUpAt`

Event update validation applies to:

- `type`
- `title`
- `occurredAt`
- `scheduledAt`
- `mode`
- `location`
- `meetingLink`
- `contactName`
- `contactPhone`
- `contactEmail`
- `note`

Date fields should be accepted as valid ISO 8601 date strings or explicit `null` where nullable.

`meetingLink` should be a valid URL if provided.

`contactPhone` may remain a plain string in V2.

---

## 13. Business Rules

## 13.1 Ownership

Every application belongs to exactly one user.

Every event belongs to exactly one user and one application.

All application/event queries must be scoped by authenticated `userId`.

## 13.2 Event Ownership Consistency

When creating an event:

- application must exist
- application must belong to authenticated user
- event must store same `userId` as application owner

## 13.3 Deleting an Application

When an application is deleted:

- all events belonging to that application must also be deleted

V2 continues using hard delete unless explicitly changed.

## 13.4 followUpAt vs follow_up Event

`followUpAt` and `follow_up` event are different.

### followUpAt

Application-level reminder date.

### follow_up event

Timeline record of an actual follow-up action.

They must not be merged.

## 13.5 Current Status Is User-Controlled

V2 should not auto-sync `currentStatus` from events by default.

## 13.6 Frontend Must Not Bypass Backend Rules

Frontend may improve UX, but backend remains source of truth for:

- ownership
- validation
- attention logic
- dashboard summary
- user scoping

---

## 14. API Requirements

All API paths assume base prefix such as:

```txt
/api/v1
```

V2 should preserve existing paths unless explicitly approved.

## 14.0 API Response Contract Policy

V2 must preserve existing V1 response shapes unless a task explicitly changes them.

For any endpoint touched by a V2 task:

- the task must state whether the response shape is preserved or changed
- changed response shapes must be documented in the task summary
- frontend code must not assume undocumented fields
- backend code must not silently remove fields already used by the frontend
- response changes must be covered by tests or manual verification notes

Application detail and application events remain separate by default:

- `GET /applications/:applicationId` returns application detail
- `GET /applications/:applicationId/events` returns application events

If a task embeds events into application detail, that is a contract change and must be explicitly approved.

---

### 14.1 Auth APIs

## POST /auth/register

Create account.

Request:

```json
{
  "displayName": "dazoriii",
  "email": "user@example.com",
  "password": "12345678"
}
```

Response should include:

- success message
- safe user object without password hash

Auto-login after register remains optional.

---

## POST /auth/login

Authenticate user.

Request:

```json
{
  "email": "user@example.com",
  "password": "12345678"
}
```

Response example:

```json
{
  "message": "Login successful",
  "accessToken": "jwt-token",
  "user": {
    "_id": "user-id",
    "displayName": "dazoriii",
    "email": "user@example.com"
  }
}
```

---

## GET /auth/me

Return current authenticated user.

Requires valid JWT.

---

### 14.2 Application APIs

## POST /applications

Create application.

Request example:

```json
{
  "company": "OpenAI",
  "role": "Frontend Intern",
  "jdUrl": "https://example.com/job",
  "source": "LinkedIn",
  "notes": "Looks interesting",
  "currentStatus": "saved",
  "followUpAt": "2026-07-15T00:00:00.000Z"
}
```

Behavior:

- creates application for authenticated user
- server sets `createdAt`
- server sets `updatedAt`

---

## GET /applications

Get authenticated user’s applications.

Supported query params:

- `search`
- `status`
- `sortBy`
- `sortOrder`

Example:

```txt
GET /applications?search=frontend&status=in_process&sortBy=updatedAt&sortOrder=desc
```

Response:

- preserve the existing V1 list response shape unless the task explicitly changes it
- response must contain only applications owned by the authenticated user
- empty result must return a successful response with an empty list
- pagination metadata is optional and not required for V2 unless explicitly approved

---

## GET /applications/:applicationId

Get one application detail.

Behavior:

- requires authentication
- user can only access own application
- invalid ID returns controlled error
- nonexistent application returns not found

Default design:

- application detail endpoint returns the application document only
- events are fetched separately through the event endpoint
- cross-user access should behave like not found and return `404`

---

## PATCH /applications/:applicationId

Update application.

Allowed fields:

- `company`
- `role`
- `jdUrl`
- `source`
- `notes`
- `currentStatus`
- `followUpAt`

Forbidden fields:

- `_id`
- `userId`
- `createdAt`
- `updatedAt`

---

## DELETE /applications/:applicationId

Delete application and its events.

Behavior:

- requires authentication
- only owner can delete
- child events must be deleted
- deleting nonexistent/cross-user application must not expose private data

---

### 14.3 Event APIs

## POST /applications/:applicationId/events

Create event for application.

Request example:

```json
{
  "type": "interview",
  "title": "Technical Interview",
  "scheduledAt": "2026-07-10T14:00:00.000Z",
  "mode": "online",
  "meetingLink": "https://meet.google.com/example",
  "contactName": "HR Nguyen",
  "contactEmail": "hr@example.com",
  "note": "Prepare React and JavaScript questions"
}
```

Behavior:

- parent application must exist
- parent application must belong to user
- event stores authenticated userId

---

## GET /applications/:applicationId/events

Get events for one application.

Behavior:

- requires authentication
- parent application must belong to user
- returns events in consistent timeline order

---

## PATCH /applications/:applicationId/events/:eventId

Update event.

Behavior:

- requires authentication
- parent application and event must belong to user
- only allowed fields can be updated

---

## DELETE /applications/:applicationId/events/:eventId

Delete event.

Behavior:

- requires authentication
- parent application and event must belong to user

---

### 14.4 Dashboard API

## GET /dashboard/summary

Return dashboard information for authenticated user.

The V1 dashboard contract includes:

- `totalApplications`
- `statusCounts`
- `upcomingEvents`
- `attentionFlags`

`recentApplications` is a V2 polish field. It should only be added or changed by an explicitly assigned dashboard task.

V2 response contract for a dashboard task that includes `recentApplications`, unless an existing V1 shape is explicitly preserved by the task:

```json
{
  "totalApplications": 11,
  "statusCounts": {
    "saved": 3,
    "applied": 5,
    "in_process": 2,
    "offer": 0,
    "rejected": 1,
    "withdrawn": 0
  },
  "recentApplications": [
    {
      "_id": "app_1",
      "company": "OpenAI",
      "role": "Frontend Intern",
      "currentStatus": "in_process",
      "updatedAt": "2026-07-08T10:00:00.000Z"
    }
  ],
  "upcomingEvents": [
    {
      "eventId": "evt_1",
      "applicationId": "app_1",
      "company": "OpenAI",
      "role": "Frontend Intern",
      "type": "interview",
      "title": "Technical Interview",
      "scheduledAt": "2026-07-10T14:00:00.000Z"
    }
  ],
  "attentionFlags": [
    {
      "flagType": "NO_RESPONSE_AFTER_APPLY",
      "applicationId": "app_2",
      "company": "Company A",
      "role": "Backend Intern",
      "message": "Applied 15 days ago but no response has been recorded yet.",
      "referenceDate": "2026-06-17T00:00:00.000Z"
    }
  ]
}
```

---

## 15. Cross-user and Error Response Policy

Unless a task explicitly preserves an existing incompatible V1 behavior, V2 backend work must use these error rules:

- missing token: `401`
- invalid token: `401`
- malformed ObjectId: `400`
- valid ObjectId but resource does not exist: `404`
- valid ObjectId but resource belongs to another user: `404`
- validation failure: `400`
- duplicate unique field such as email: `409` if the current error system supports conflict errors; otherwise `400` with a clear message

Using `404` for cross-user private resources avoids confirming whether another user's resource exists.

Validation errors must return:

```json
{
  "message": "Validation failed",
  "errors": {
    "fieldName": "Human-readable error"
  }
}
```

General errors must return:

```json
{
  "message": "Human-readable error"
}
```

Minimum error cases:

- invalid input
- unauthorized request
- cross-user access
- resource not found
- invalid ObjectId / malformed ID
- internal server error

Frontend must show understandable messages for:

- validation errors
- login/register errors
- application create/update errors
- event create/update errors
- dashboard load errors
- application detail not found

Frontend must not expose raw stack traces.

Frontend forms should preserve user-entered form values after backend validation errors unless clearing the form is explicitly part of the task behavior.

---

## 16. Frontend Page Requirements

## 16.1 Login Page

Must include:

- email field
- password field
- login action
- link to register page
- loading/submit state
- invalid credential error display

## 16.2 Register Page

Must include:

- display name
- email
- password
- register action
- loading/submit state
- validation error display

## 16.3 Dashboard Page

Must show:

- status summary
- recent applications if available
- upcoming events
- attention-needed applications
- empty state if no data
- error state if dashboard API fails
- loading state while fetching

## 16.4 Applications Page

Must show:

- application list
- search input
- status filter
- sort control if supported
- create application action
- edit/delete actions
- empty state
- filtered empty state
- loading state
- error state

The list can remain table-based or card-based.

V2 does not require a kanban board.

## 16.5 Application Detail Page

Must show:

### A. Application Overview

- company
- role
- current status
- source
- jdUrl
- followUpAt
- notes

### B. Recruitment Timeline

- list of events
- add event action
- edit event action
- delete event action
- empty event state

### C. Detail Page States

Must handle:

- loading
- not found
- invalid ID
- API error
- refresh behavior
- safe navigation after delete

### D. Optional Attention Display

If the application has relevant flags, they may be shown on the detail page.

Not required unless a V2 task explicitly adds it.

---

## 17. Frontend Stack and UI Policy

## 17.1 Current Frontend Foundation

ApplyFlow currently uses:

- React
- Vite
- React Router
- plain CSS

V2 should preserve this foundation.

V2 should not rewrite the frontend.

---

## 17.2 Default UI Rule

Use the existing React + plain CSS approach for:

- page layout
- forms
- buttons
- cards
- lists
- empty states
- loading states
- error states
- simple search/filter/sort controls
- basic responsive polish

---

## 17.3 Library Exception Rule

A frontend library may be introduced only if all conditions are met:

1. The task has a repeated or complex UI need that plain CSS/simple React would handle poorly.
2. The library solves a concrete problem, not just visual preference.
3. The library does not force a broad rewrite.
4. The library is compatible with the existing React/Vite setup.
5. The task explicitly names and approves the library before implementation.
6. The PR/task summary explains why the library was added.
7. The dependency change is limited and documented.
8. CI and local build still pass.

A library exception must be approved before implementation, not justified after implementation.

Codex must not add UI libraries silently.

---

## 17.4 Potentially Acceptable Library Use

Acceptable only if explicitly approved:

- small date utility for repeated date formatting/validation
- toast library for global user feedback
- lightweight chart library if dashboard visualization becomes a real requirement
- form helper library if forms become repetitive and error-prone
- component library only if V2 explicitly adopts a design-system direction

---

## 17.5 Unacceptable Library Use

Not acceptable without explicit approval:

- adding MUI just to make buttons/cards look nicer
- adding MUI icons without approval
- replacing existing CSS with a full UI framework
- adding Tailwind and rewriting the frontend
- adding a table library for a simple list
- adding a chart library before chart requirements exist
- adding dependencies to avoid understanding existing code
- mixing multiple UI systems casually

---

## 17.6 MUI Policy

MUI is not part of the current ApplyFlow frontend stack.

MUI may only be introduced if a future task explicitly approves:

- a design-system migration, or
- a clearly bounded MUI-based feature

Until then, Codex must not add:

- `@mui/material`
- `@mui/icons-material`
- Emotion dependencies
- MUI-related imports
- MUI-specific theme setup

---

## 18. Dependency Policy

V2 should avoid unnecessary dependencies.

A new dependency is allowed only when:

1. It solves a concrete repeated problem.
2. The same result would be error-prone or inefficient to implement manually.
3. It does not introduce broad architectural change.
4. It is approved in the task scope.
5. It is documented in the task summary.
6. It does not weaken maintainability.
7. It does not conflict with existing project direction.

Codex must report every dependency change explicitly.

Dependency changes must include:

- package name
- reason for adding
- files affected
- risk
- verification command result

---

## 19. QA / Testing Requirements

## 19.1 Testing Philosophy

V2 testing should prioritize high-risk behavior:

- auth
- ownership
- validation
- application CRUD
- event CRUD
- cascade delete
- dashboard correctness
- frontend state handling
- regression after changes

V2 does not require perfect coverage.

V2 does require clear evidence that important flows were checked.

---

## 19.2 Backend Test Categories

Backend checks should cover where practical:

- health endpoint
- register/login/me
- missing token
- invalid token
- application create/list/detail/update/delete
- application validation errors
- invalid ObjectId
- cross-user application access
- event create/list/update/delete
- cross-user event access
- dashboard summary shape
- delete cascade behavior

---

## 19.3 Frontend Manual Test Categories

Manual frontend tests should cover:

- register
- login
- logout
- protected route redirect
- dashboard load
- dashboard empty state
- application list load
- application list empty state
- search/filter/sort
- create application
- edit application
- delete application
- application detail load
- application detail refresh
- invalid detail URL
- create event
- event list display
- delete event
- form validation
- API error state if testable
- responsive sanity check

---

## 19.4 Regression Checklist Rule

After each meaningful V2 task, run the relevant parts of:

```txt
docs/regression-checklist.md
```

The task summary must say which manual tests were run.

If manual tests were not run, the task must say so clearly.

---

## 19.5 Default Verification Commands

Backend:

```bash
cd backend
npm run check:attention
npm run check:backend-hardening
```

Frontend:

```bash
cd frontend
npm run build
```

Optional local E2E if environment is available:

```bash
cd backend
npm run check:e2e
```

Git review:

```bash
git status
git diff --stat
git diff
```

The shell syntax in this document is illustrative. Codex may run equivalent PowerShell commands on Windows, but the final report must include the exact commands and results.

---

## 20. Git / Codex Workflow Requirements

## 20.1 Branch Rule

Each V2 task should use a dedicated branch.

Example:

```txt
codex/v2-01-audit-v1-baseline
codex/v2-02-application-filter-contract
codex/v2-03-application-list-ux
```

## 20.2 Commit Rule

Prefer one focused commit per task.

Commit messages should be short and specific.

Examples:

```txt
audit v1 baseline before v2
polish application list filters
improve application detail states
expand backend e2e checks
```

## 20.3 Codex Rule

Codex must:

- read `AGENTS.md`
- use relevant ApplyFlow skill when instructed
- inspect current git status
- work only on assigned scope
- avoid unrelated refactors
- run relevant checks
- report exact command results
- never fake test results
- stop before merge unless explicitly asked

## 20.4 Required Task Summary

Every Codex task must report:

```txt
Task:
Branch:
Changed files:
Implemented behavior:
Tests/checks run:
Manual test needed:
Risks:
Suggested commit message:
Verdict: READY / NEEDS FIX
```

## 20.5 Review Rule

A task should not be merged if:

- CI fails
- source changes exceed task scope
- tests are claimed without evidence
- auth/user scoping is weakened
- validation is bypassed
- frontend build fails
- README/docs claim unimplemented behavior

## 20.6 README Update Rule

README changes are allowed only in a dedicated approved documentation task.

Codex must not edit `README.md` during feature, backend, frontend, test, or setup tasks unless that task explicitly includes README updates.

---

## 20.6 README Change Rule

README changes are allowed only in a dedicated approved documentation task.

V2 implementation tasks must not update `README.md` unless the task explicitly includes README work.

This prevents feature, backend, frontend, and test tasks from mixing behavior changes with documentation claims.

---

## 21. Open Decisions Deferred

These decisions are intentionally deferred in V2 unless a task explicitly approves them:

- whether `currentStatus` should auto-sync from event types
- whether `follow_up` event should clear `followUpAt`
- whether interviews need a dedicated round field
- whether applications need a primary contact field
- whether reminder thresholds should be user-configurable
- whether offer-related follow-up logic should exist
- whether dashboard should include charts
- whether frontend should adopt a component library
- whether V2 should add pagination
- whether browser automation should be introduced
- whether backend E2E should run in CI with a test database
- whether deployment should be added

Deferred means:

```txt
Do not implement unless explicitly approved.
```

---

## 22. V2 Definition of Done

A V2 task is done only when:

- requirement is implemented
- task scope is respected
- no unrelated files are changed
- backend checks pass if backend is affected
- frontend build passes if frontend is affected
- manual tests are run if UI behavior is affected
- access control is verified if user data is affected
- validation/error behavior is verified if input is affected
- docs/testcases are updated if behavior changes
- final summary includes changed files, tests run, risks, and suggested commit message

If a task is implemented but not verified, it must be marked:

```txt
Implemented, not verified
```

not done.

---

## 23. V2 Success Criteria

ApplyFlow V2 is successful if:

1. V1 behavior is preserved.
2. The actual V1 repository baseline was audited before feature work.
3. Application list/detail flows are more reliable.
4. Event timeline behavior is clearer.
5. Dashboard metrics remain backend-derived and user-scoped.
6. Frontend pages handle loading/empty/error states better.
7. Backend validation/access-control behavior remains strong.
8. CI passes consistently.
9. Regression checklist is usable.
10. README explains how to run and test the project after the dedicated README update task is approved and completed.
11. The project can be explained clearly in a software/testing internship interview.
12. Git history shows controlled task-based development.

---

## 24. Final Summary

ApplyFlow V2 is a quality-focused improvement of ApplyFlow V1.

It does not try to become a bigger product by adding many new features.

Instead, it improves:

- correctness
- frontend reliability
- backend safety
- QA evidence
- documentation
- development workflow

The product is successful if a user can open ApplyFlow and clearly understand:

- where they applied
- what stage each application is in
- what events happened or are scheduled next
- which applications need attention
- whether the app behavior has been tested and verified

For portfolio/interview purposes, V2 should demonstrate not only that the app works, but that it was developed with controlled scope, regression awareness, and practical QA discipline.
