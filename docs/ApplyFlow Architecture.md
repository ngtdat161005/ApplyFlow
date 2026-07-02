# <a name="applyflow-architecture.md-v1"></a>ApplyFlow — architecture.md (V1)
## <a name="purpose-of-this-document"></a>1. Purpose of This Document
This document defines the **implementation architecture** for ApplyFlow V1.

Its job is to turn spec.md into a codebase structure that AI coding agents (Claude, Codex) can implement consistently **without inventing architecture on their own**.

This document optimizes for:

- **clarity over cleverness**
- **clean code over compact code**
- **reviewability over abstraction hype**
- **small-project pragmatism over enterprise ceremony**

The goal is that a reviewer should be able to open the project and quickly answer:

- where each feature lives
- where business logic lives
- where MongoDB access happens
- where attention-flag logic happens
- what each module is responsible for
- how to add a new feature without breaking structure
-----
# <a name="architecture-principles"></a>2. Architecture Principles
## <a name="primary-principles"></a>2.1 Primary Principles
ApplyFlow V1 follows these principles:
### <a name="keep-the-code-easy-to-read"></a>1. Keep the code easy to read
Prefer:

- explicit names
- small functions
- predictable file locations
- straightforward control flow

Avoid:

- “smart” abstractions that hide behavior
- giant utility files
- controllers doing everything
- deeply nested callbacks or giant service methods
-----
### <a name="xac1bcbe81ff54cf540712fe832fce690d8cffe1"></a>2. Separate HTTP concerns from business logic
Controllers should handle:

- request parsing
- calling service functions
- shaping HTTP response

Controllers should **not** contain:

- complex attention-flag logic
- long MongoDB query construction
- cross-entity business rules
- timeline derivation logic

That belongs in services and repositories.

-----
### <a name="x5f3df7479ae4ce4fad7811df2139134df089f50"></a>3. Separate business logic from persistence logic
Business logic answers:

- what should happen
- what rules apply
- what counts as “no response after apply”

Persistence logic answers:

- which collection to query
- how to build MongoDB filters
- how to insert/update documents

These should not be mixed in the same function unless the function is extremely trivial.

-----
### <a name="x068c47391e5e7c8ad8fa93e17484252352af81a"></a>4. Prefer explicit modules over generic base classes
For V1, do **not** build:

- abstract repository base classes
- generic CRUD superclasses
- generic “manager” layers
- dynamic magic registries

They add indirection without helping a small project.

Use explicit files like:

- application.service.js
- application.repository.js
- event.service.js
- dashboard.service.js
-----
### <a name="make-business-rules-easy-to-test"></a>5. Make business rules easy to test
The attention-flag logic is one of the most important parts of the product.

Therefore:

- attention rules must live in a dedicated module
- rule functions should be as pure as practical
- date-threshold logic should be centralized
- services should be testable without spinning up the whole app
-----
### <a name="avoid-hidden-side-effects"></a>6. Avoid hidden side effects
A function named createEvent() should not silently:

- update unrelated collections
- auto-change status in surprising ways
- create extra reminders unless explicitly defined

V1 should keep side effects narrow and visible.

-----
## <a name="clean-code-rules-for-ai-contributors"></a>2.2 Clean Code Rules for AI Contributors
Every AI agent contributing code to this project must follow these rules.
### <a name="naming"></a>Naming
Use names that describe the business meaning clearly.

Prefer:

- createApplication
- getApplicationByIdForUser
- listApplicationEvents
- computeAttentionFlags
- findUpcomingEventsForUser

Avoid vague names like:

- handleData
- doThing
- processApp
- manageEvent
- helper
-----
### <a name="function-size"></a>Function size
A function should usually do **one thing**.\
If a function is handling:

- validation normalization
- MongoDB query construction
- business rule evaluation
- response mapping

all at once, it is probably too large.

-----
### <a name="controller-size"></a>Controller size
Controllers should stay thin.\
If a controller exceeds roughly **30–50 lines of real logic**, it likely needs work moved into services.

-----
### <a name="file-responsibility"></a>File responsibility
Each file should have a clear responsibility.

Good:

- one controller file per domain
- one service file per domain
- one repository file per domain
- one validator file per domain

Bad:

- one giant utils.js
- one common.service.js with half the app inside
- one controller that handles auth, applications, and events
-----
### <a name="comments"></a>Comments
Prefer **clear code first**.\
Use comments for:

- non-obvious business rules
- attention-flag edge cases
- reasoning behind a constraint

Do not add comments that merely restate the code.

Bad:

js id="e1" const now = new Date() // get current date

Useful:

js id="e2" // Silence flags should only apply to active applications. // Rejected / withdrawn cases must not show "no response" reminders.

-----
### <a name="error-handling"></a>Error handling
Throw domain-relevant errors with meaningful messages.\
Do not return vague failures like:

- "Something went wrong"
- "Invalid request" for every case
-----
### <a name="no-clever-mongo-pipelines-unless-needed"></a>No “clever” Mongo pipelines unless needed
For V1, prefer understandable query flow over ultra-compressed aggregation wizardry.

If a normal find() + in-memory rule evaluation is easier to review and the dataset is small enough, that is acceptable.

-----
# <a name="high-level-system-architecture"></a>3. High-Level System Architecture
ApplyFlow V1 uses a **modular monolith** architecture.

It is one application split into:

- **Frontend**: React + Vite
- **Backend API**: Node + Express
- **Database**: MongoDB
## <a name="logical-view"></a>3.1 Logical View
text id="3y6j2t" Frontend (React/Vite)         |         v HTTP API (Express)         |         v Route -> Middleware -> Controller -> Service -> Repository -> MongoDB                               |                               +-> Domain logic / attention rules / validators

-----
## <a name="why-this-architecture"></a>3.2 Why This Architecture
This architecture is chosen because it is:

- small enough for one-person development
- easy for AI coding agents to follow
- easy to review
- flexible enough for future expansion

It avoids:

- premature microservices
- heavy DDD ceremony
- hidden ORM behavior
- tangled controller-driven code
-----
# <a name="technology-decisions"></a>4. Technology Decisions
## <a name="backend"></a>4.1 Backend
- **Node.js**
- **Express**
- **MongoDB native driver** (mongodb)
- JWT-based authentication
- bcrypt for password hashing
- optional validation library such as Zod/Joi, or custom validators if kept consistent
## <a name="frontend"></a>4.2 Frontend
- **React**
- **Vite**
- React Router
- a lightweight HTTP client (fetch wrapper or axios)
- UI library optional, but architecture should not depend on one
## <a name="database"></a>4.3 Database
- **MongoDB**
- Collections:
  - users
  - applications
  - application\_events
-----
# <a name="repository-pattern-choice"></a>5. Repository Pattern Choice
## <a name="decision"></a>5.1 Decision
ApplyFlow V1 will use a **light repository layer**.

This means:

- repositories contain MongoDB collection access logic
- services contain business rules and orchestration
- controllers stay thin
## <a name="why-not-skip-repositories-entirely"></a>5.2 Why not skip repositories entirely?
Skipping repositories would push MongoDB calls into services. That works for very tiny apps, but this project already has:

- auth
- applications
- events
- dashboard summaries
- attention-flag logic

A repository layer gives cleaner separation without too much complexity.
## <a name="why-not-a-heavy-repository-abstraction"></a>5.3 Why not a heavy repository abstraction?
Because V1 does not need:

- generic base repositories
- inheritance hierarchies
- abstract factory patterns

Each domain gets an explicit repository file.

-----
# <a name="backend-folder-structure"></a>6. Backend Folder Structure
## <a name="target-backend-structure"></a>6.1 Target Backend Structure
text id="8u4dpa" backend/ └─ src/    ├─ app.js    ├─ server.js    │    ├─ config/    │  ├─ env.js    │  ├─ mongodb.js    │  └─ constants.js    │    ├─ routes/    │  ├─ index.js    │  ├─ auth.route.js    │  ├─ application.route.js    │  ├─ event.route.js    │  └─ dashboard.route.js    │    ├─ middlewares/    │  ├─ auth.middleware.js    │  ├─ error.middleware.js    │  └─ validate.middleware.js    │    ├─ modules/    │  ├─ auth/    │  │  ├─ auth.controller.js    │  │  ├─ auth.service.js    │  │  ├─ auth.repository.js    │  │  ├─ auth.validator.js    │  │  └─ auth.mapper.js    │  │    │  ├─ application/    │  │  ├─ application.controller.js    │  │  ├─ application.service.js    │  │  ├─ application.repository.js    │  │  ├─ application.validator.js    │  │  └─ application.mapper.js    │  │    │  ├─ event/    │  │  ├─ event.controller.js    │  │  ├─ event.service.js    │  │  ├─ event.repository.js    │  │  ├─ event.validator.js    │  │  └─ event.mapper.js    │  │    │  └─ dashboard/    │     ├─ dashboard.controller.js    │     ├─ dashboard.service.js    │     └─ dashboard.mapper.js    │    ├─ domain/    │  ├─ attention/    │  │  ├─ attention.service.js    │  │  ├─ attention.rules.js    │  │  ├─ attention.types.js    │  │  └─ attention.utils.js    │  │    │  ├─ timeline/    │  │  └─ timeline.utils.js    │  │    │  └─ shared/    │     └─ domain-errors.js    │    ├─ db/    │  ├─ collections.js    │  └─ indexes.js    │    ├─ utils/    │  ├─ async-handler.js    │  ├─ date.utils.js    │  ├─ object-id.utils.js    │  └─ pagination.utils.js    │    └─ shared/       ├─ api-response.js       └─ logger.js

-----
# <a name="backend-layer-responsibilities"></a>7. Backend Layer Responsibilities
# <a name="route-layer"></a>7.1 Route Layer
**Responsibility:** define HTTP endpoints and attach middleware + controllers.

Routes should:

- map URL to controller
- attach auth middleware where needed
- attach validation middleware if used

Routes should **not**:

- contain business logic
- talk to MongoDB
- transform data heavily

Example:

- application.route.js defines CRUD routes for applications
- event.route.js defines nested routes under applications for events
-----
# <a name="middleware-layer"></a>7.2 Middleware Layer
**Responsibility:** cross-cutting concerns.

Includes:

- JWT auth verification
- request validation
- global error handling

Middleware should **not**:

- compute attention flags
- create/update applications
- contain domain-specific orchestration
-----
# <a name="controller-layer"></a>7.3 Controller Layer
**Responsibility:** translate HTTP request/response into service calls.

Controllers should:

- read params/query/body/user
- call a service
- send JSON response
- pass errors to next middleware

Controllers should **not**:

- write MongoDB queries
- compute dashboard summaries
- evaluate silence flags directly
-----
# <a name="service-layer"></a>7.4 Service Layer
**Responsibility:** business logic and orchestration.

Services should:

- enforce domain rules
- call one or more repositories
- coordinate cross-entity workflows
- call attention/timeline domain helpers where needed

Examples:

- application.service.js
  - create application
  - update application
  - list applications with filters
- event.service.js
  - ensure application ownership before adding event
  - list application timeline
- dashboard.service.js
  - fetch applications/events
  - compute summary cards
  - compute attention flags
  - compute upcoming events
-----
# <a name="repository-layer"></a>7.5 Repository Layer
**Responsibility:** all MongoDB read/write access for a domain.

Repositories should:

- get collection references
- build MongoDB queries
- perform inserts/updates/deletes/finds
- return raw or lightly normalized DB data

Repositories should **not**:

- decide if an application deserves NO\_RESPONSE\_AFTER\_APPLY
- compute dashboard sections
- contain request/response concerns
-----
# <a name="domain-layer"></a>7.6 Domain Layer
**Responsibility:** shared business logic that is not tied to HTTP or a single repository.

This is where important reusable rules live.
### <a name="domainattention"></a>domain/attention
Contains all attention-flag logic:

- flag type definitions
- rule evaluation functions
- helper functions for date/event calculations
### <a name="domaintimeline"></a>domain/timeline
Contains timeline-specific helpers:

- effective event date calculation
- sorting helpers
### <a name="domainshared"></a>domain/shared
Contains domain-level error classes if needed.

-----
# <a name="backend-module-by-module-design"></a>8. Backend Module-by-Module Design
# <a name="auth-module"></a>8.1 Auth Module
## <a name="files"></a>Files
- auth.controller.js
- auth.service.js
- auth.repository.js
- auth.validator.js
- auth.mapper.js
## <a name="responsibilities"></a>Responsibilities
### <a name="controller"></a>Controller
Handles:

- POST /auth/register
- POST /auth/login
- GET /auth/me
### <a name="service"></a>Service
Handles:

- register user
- validate login credentials
- generate JWT payload/token
- sanitize returned user object
### <a name="repository"></a>Repository
Handles:

- find user by email
- create user
- find user by id
### <a name="validator"></a>Validator
Validates:

- register payload
- login payload
### <a name="mapper"></a>Mapper
Transforms user DB document to safe response shape.

-----
# <a name="application-module"></a>8.2 Application Module
## <a name="files-1"></a>Files
- application.controller.js
- application.service.js
- application.repository.js
- application.validator.js
- application.mapper.js
## <a name="responsibilities-1"></a>Responsibilities
### <a name="controller-1"></a>Controller
Handles:

- POST /applications
- GET /applications
- GET /applications/:applicationId
- PATCH /applications/:applicationId
- DELETE /applications/:applicationId
### <a name="service-1"></a>Service
Handles:

- create application for current user
- list user applications with search/filter/sort
- fetch single application ensuring ownership
- update application ensuring ownership
- delete application and cascade delete events
### <a name="repository-1"></a>Repository
Handles:

- insert application
- find applications by user with filters
- count by status if needed
- find application by id + user
- update application
- delete application
### <a name="validator-1"></a>Validator
Validates:

- create application payload
- update application payload
- query params for list filters if desired
### <a name="mapper-1"></a>Mapper
Shapes application response objects.

-----
# <a name="event-module"></a>8.3 Event Module
## <a name="files-2"></a>Files
- event.controller.js
- event.service.js
- event.repository.js
- event.validator.js
- event.mapper.js
## <a name="responsibilities-2"></a>Responsibilities
### <a name="controller-2"></a>Controller
Handles:

- POST /applications/:applicationId/events
- GET /applications/:applicationId/events
- PATCH /applications/:applicationId/events/:eventId
- DELETE /applications/:applicationId/events/:eventId
### <a name="service-2"></a>Service
Handles:

- verify parent application ownership
- create event
- list timeline events for an application
- update event
- delete event
### <a name="repository-2"></a>Repository
Handles:

- insert event
- find events by application and user
- find event by id
- update event
- delete event
- delete many by application id (for cascade delete)
### <a name="validator-2"></a>Validator
Validates event create/update payloads.
### <a name="mapper-2"></a>Mapper
Shapes event response objects.

-----
# <a name="dashboard-module"></a>8.4 Dashboard Module
## <a name="files-3"></a>Files
- dashboard.controller.js
- dashboard.service.js
- dashboard.mapper.js
## <a name="responsibilities-3"></a>Responsibilities
### <a name="controller-3"></a>Controller
Handles:

- GET /dashboard/summary
### <a name="service-3"></a>Service
Builds dashboard data:

- status summary counts
- upcoming events
- attention flags

The dashboard module does **not** need its own repository if it can compose:

- application repository
- event repository
- attention domain services

This is intentional.\
Dashboard is an orchestration layer, not a primary persistence domain.

-----
# <a name="domain-layer-design"></a>9. Domain Layer Design
# <a name="attention-domain"></a>9.1 Attention Domain
This is one of the most important parts of the codebase.\
It should be isolated and readable.
## <a name="files-4"></a>Files
- attention.service.js
- attention.rules.js
- attention.types.js
- attention.utils.js
-----
## <a name="responsibility-split"></a>9.2 Responsibility Split
### <a name="attention.types.js"></a>attention.types.js
Contains constants / enums for attention flag types.

Example:

js id="a1" export const ATTENTION\_FLAG\_TYPES = {   NO\_RESPONSE\_AFTER\_APPLY: 'NO\_RESPONSE\_AFTER\_APPLY',   NO\_RESPONSE\_AFTER\_INTERVIEW: 'NO\_RESPONSE\_AFTER\_INTERVIEW',   FOLLOW\_UP\_OVERDUE: 'FOLLOW\_UP\_OVERDUE' }

-----
### <a name="attention.utils.js"></a>attention.utils.js
Contains small helpers such as:

- get effective event date
- check whether date is older than N days
- sort events by effective date
- determine whether an application status is active for silence flags

Example function names:

- getEventEffectiveDate(event)
- isActiveSilenceStatus(status)
- daysSince(date, now)
-----
### <a name="attention.rules.js"></a>attention.rules.js
Contains **pure-ish rule functions**.

Each rule should be isolated and readable.

Example exported functions:

- evaluateNoResponseAfterApply(application, events, now)
- evaluateNoResponseAfterInterview(application, events, now)
- evaluateFollowUpOverdue(application, now)

Each function should return either:

- null if no flag applies
- or a flag object

This is important because it makes unit testing straightforward.

-----
### <a name="attention.service.js"></a>attention.service.js
Orchestrates rule evaluation over many applications.

Example responsibilities:

- group events by application
- run all relevant rule functions
- flatten non-null flags into one array

Possible exported functions:

- computeAttentionFlags(applications, events, now = new Date())
- computeUpcomingEvents(applications, events, now = new Date())
-----
# <a name="timeline-domain"></a>9.3 Timeline Domain
## <a name="file"></a>File
- timeline.utils.js
## <a name="responsibilities-4"></a>Responsibilities
Shared timeline helpers:

- compute effective event date
- timeline sorting logic
- maybe event-to-display-date formatting helpers if needed on backend

Possible functions:

- getEventEffectiveDate(event)
- compareTimelineEvents(a, b)

If getEventEffectiveDate is used by both timeline and attention logic, either:

- keep it in timeline.utils.js and import from there
- or move it into a shared domain date utility

The key rule is: **do not duplicate this logic in multiple places**.

-----
# <a name="database-access-design"></a>10. Database Access Design
# <a name="mongodb-connection"></a>10.1 MongoDB Connection
Use a centralized connection setup.
## <a name="configmongodb.js"></a>config/mongodb.js
Responsibilities:

- create MongoClient
- connect once at startup
- export DB instance accessors

Do not open a new connection inside repositories.

-----
# <a name="collection-access"></a>10.2 Collection Access
## <a name="dbcollections.js"></a>db/collections.js
Expose helper functions such as:

- getUsersCollection()
- getApplicationsCollection()
- getApplicationEventsCollection()

This prevents collection-name strings from being scattered across the codebase.

-----
# <a name="suggested-indexes"></a>10.3 Suggested Indexes
## <a name="users"></a>users
- unique index on email
## <a name="applications"></a>applications
Recommended indexes:

- { userId: 1, updatedAt: -1 }
- { userId: 1, currentStatus: 1 }
- text-like search support can be approximated with:
  - { userId: 1, company: 1 }
  - { userId: 1, role: 1 }

If later needed, a more advanced text-search approach can be added.
## <a name="application_events"></a>application\_events
Recommended indexes:

- { applicationId: 1, userId: 1 }
- { userId: 1, scheduledAt: 1 }
- { applicationId: 1, type: 1 }
-----
# <a name="api-flow-by-feature"></a>11. API Flow by Feature
# <a name="create-application-flow"></a>11.1 Create Application Flow
## <a name="route"></a>Route
POST /applications
## <a name="flow"></a>Flow
1. route applies auth middleware
1. route applies request validation
1. controller reads body + authenticated user
1. service validates domain assumptions if needed
1. repository inserts application document
1. service returns created application
1. controller sends response
## <a name="notes"></a>Notes
The controller should not build the application document directly beyond passing validated input.

-----
# <a name="list-applications-flow"></a>11.2 List Applications Flow
## <a name="route-1"></a>Route
GET /applications
## <a name="flow-1"></a>Flow
1. auth middleware verifies user
1. controller reads query params:
   - search
   - status
   - sortBy
   - sortOrder
1. service normalizes list options
1. repository performs Mongo query
1. service returns list
1. controller sends response
-----
# <a name="create-event-flow"></a>11.3 Create Event Flow
## <a name="route-2"></a>Route
POST /applications/:applicationId/events
## <a name="flow-2"></a>Flow
1. auth middleware verifies user
1. validation middleware validates event payload
1. controller reads applicationId, body, user
1. event service checks parent application exists for this user
1. event repository inserts event
1. service returns created event
1. controller sends response
## <a name="important-rule"></a>Important rule
Event creation must not assume the application exists just because an ID was provided.\
Ownership check is mandatory.

-----
# <a name="delete-application-flow"></a>11.4 Delete Application Flow
## <a name="route-3"></a>Route
DELETE /applications/:applicationId
## <a name="flow-3"></a>Flow
1. auth middleware verifies user
1. controller passes user + applicationId to service
1. application service ensures application exists and belongs to user
1. application repository deletes application
1. event repository deletes all child events for that application
1. controller returns success response
-----
# <a name="dashboard-summary-flow"></a>11.5 Dashboard Summary Flow
## <a name="route-4"></a>Route
GET /dashboard/summary
## <a name="flow-4"></a>Flow
1. auth middleware verifies user
1. dashboard controller calls dashboard service
1. dashboard service:
   - fetches applications for user
   - fetches relevant events for user
   - computes status summary
   - computes upcoming events
   - computes attention flags
1. dashboard mapper shapes final response
1. controller sends response
-----
# <a name="dashboard-computation-strategy"></a>12. Dashboard Computation Strategy
## <a name="design-choice"></a>12.1 Design Choice
For V1, dashboard summary should be computed in the backend service layer using:

- application repository
- event repository
- attention domain service
## <a name="why-this-choice"></a>12.2 Why this choice
This keeps the frontend simple and avoids duplicating business rules in the client.
## <a name="performance-tradeoff"></a>12.3 Performance tradeoff
For a personal tracker app, user data volume is small enough that a straightforward approach is acceptable:

- fetch user applications
- fetch user events
- compute flags in memory

This is preferable to over-optimizing too early with large aggregation pipelines.

If performance later becomes a problem, the computation strategy can be refined.

-----
# <a name="detailed-responsibility-of-key-services"></a>13. Detailed Responsibility of Key Services
# <a name="application.service.js"></a>13.1 application.service.js
Suggested exported functions:

- createApplication(userId, payload)
- listApplications(userId, queryOptions)
- getApplicationById(userId, applicationId)
- updateApplication(userId, applicationId, payload)
- deleteApplication(userId, applicationId)
### <a name="responsibilities-5"></a>Responsibilities
- validate ownership assumptions where necessary
- normalize optional fields if needed
- delegate DB operations to repository
- coordinate cascade delete on application deletion
-----
# <a name="event.service.js"></a>13.2 event.service.js
Suggested exported functions:

- createEvent(userId, applicationId, payload)
- listApplicationEvents(userId, applicationId)
- updateEvent(userId, applicationId, eventId, payload)
- deleteEvent(userId, applicationId, eventId)
### <a name="responsibilities-6"></a>Responsibilities
- verify parent application ownership
- verify event belongs to application/user
- coordinate event ordering if needed
- delegate DB operations to repository
-----
# <a name="dashboard.service.js"></a>13.3 dashboard.service.js
Suggested exported functions:

- getDashboardSummary(userId)
### <a name="responsibilities-7"></a>Responsibilities
- fetch user applications
- fetch user events
- compute:
  - statusCounts
  - upcomingEvents
  - attentionFlags
### <a name="x8fe976987561d768bae963bb4707e5472dc2754"></a>Internal helper functions inside this service may include:
- buildStatusCounts(applications)
- mapApplicationsById(applications)

Keep these helpers private to the module unless reused elsewhere.

-----
# <a name="attention.service.js-1"></a>13.4 attention.service.js
Suggested exported functions:

- computeAttentionFlags(applications, events, now = new Date())
- computeUpcomingEvents(applications, events, now = new Date())
### <a name="responsibilities-8"></a>Responsibilities
- group events by application
- run rule functions
- return normalized output shape for dashboard use
-----
# <a name="attention-logic-architecture"></a>14. Attention Logic Architecture
# <a name="why-isolate-it"></a>14.1 Why isolate it
Attention logic is easy to get wrong because it mixes:

- application status
- event history
- date thresholds
- “latest relevant event” reasoning

If it is scattered across controller/service/repository files, review becomes painful.

Therefore all attention rules must live under:

- src/domain/attention/
-----
# <a name="rule-design"></a>14.2 Rule design
Each rule should look conceptually like this:

js id="b3" function evaluateNoResponseAfterApply(application, events, now) {   // 1. Check status eligibility   // 2. Find latest applied event   // 3. Check for later progress events   // 4. Check threshold   // 5. Return flag or null }

Each rule should:

- accept plain JS objects
- avoid DB access
- avoid Express request/response objects
- return predictable output

This makes them easy to test and easy to reason about.

-----
# <a name="attention-flag-output-shape"></a>14.3 Attention flag output shape
Recommended internal flag shape:

json id="w4" {   "flagType": "NO\_RESPONSE\_AFTER\_APPLY",   "applicationId": "app-id",   "company": "OpenAI",   "role": "Frontend Intern",   "message": "Applied 16 days ago but no response has been recorded yet.",   "referenceDate": "2026-06-17T00:00:00.000Z" }

The rule functions may return this final shape directly, or return an intermediate shape that is later mapped.\
For V1, returning the final shape directly is acceptable and simpler.

-----
# <a name="validation-strategy"></a>15. Validation Strategy
## <a name="validation-layer"></a>15.1 Validation Layer
Validation should happen **before service logic** whenever possible.

Use:

- auth.validator.js
- application.validator.js
- event.validator.js
## <a name="what-validators-should-do"></a>15.2 What validators should do
Validators should ensure:

- required fields exist
- enums are valid
- dates are parseable
- strings are of expected type/shape
## <a name="what-validators-should-not-do"></a>15.3 What validators should not do
Validators should not:

- query MongoDB for ownership checks
- compute dashboard flags
- enforce cross-collection business logic

That belongs to services.

-----
# <a name="error-handling-strategy"></a>16. Error Handling Strategy
# <a name="error-types"></a>16.1 Error Types
Prefer a small set of explicit error classes, such as:

- BadRequestError
- UnauthorizedError
- ForbiddenError
- NotFoundError
- ConflictError

These can live in:

- src/domain/shared/domain-errors.js
## <a name="error-flow"></a>16.2 Error Flow
- service or middleware throws an error
- error.middleware.js converts it to consistent JSON response
## <a name="important-rule-1"></a>16.3 Important rule
Do not mix:

- returning { error: ... }
- throwing errors
- sending response directly from deep service functions

Use one consistent strategy:

- service throws
- controller/middleware handles response
-----
# <a name="response-mapping-strategy"></a>17. Response Mapping Strategy
## <a name="why-use-mappers"></a>17.1 Why use mappers
Mongo documents often contain fields we may not want to expose directly or may need normalization for the client.

Each module can have a mapper file.

Examples:

- user mapper removes password hash
- application mapper ensures stable response shape
- event mapper shapes event payloads
## <a name="keep-mappers-simple"></a>17.2 Keep mappers simple
Mappers should not contain business rules.\
They should mainly shape output.

-----
# <a name="frontend-architecture"></a>18. Frontend Architecture
# <a name="frontend-goals"></a>18.1 Frontend Goals
The frontend should reflect the backend domain structure so the codebase is easy to navigate.

It should not become a random pile of pages and hooks.

-----
# <a name="target-frontend-structure"></a>18.2 Target Frontend Structure
text id="y9u5ga" frontend/ └─ src/    ├─ main.jsx    ├─ App.jsx    │    ├─ app/    │  ├─ router.jsx    │  ├─ providers.jsx    │  └─ query-client.js    │    ├─ api/    │  ├─ http-client.js    │  ├─ auth.api.js    │  ├─ application.api.js    │  ├─ event.api.js    │  └─ dashboard.api.js    │    ├─ pages/    │  ├─ LoginPage/    │  │  └─ LoginPage.jsx    │  ├─ RegisterPage/    │  │  └─ RegisterPage.jsx    │  ├─ DashboardPage/    │  │  └─ DashboardPage.jsx    │  ├─ ApplicationsPage/    │  │  └─ ApplicationsPage.jsx    │  └─ ApplicationDetailPage/    │     └─ ApplicationDetailPage.jsx    │    ├─ features/    │  ├─ auth/    │  │  ├─ components/    │  │  ├─ hooks/    │  │  ├─ auth.store.js    │  │  └─ auth.utils.js    │  │    │  ├─ applications/    │  │  ├─ components/    │  │  │  ├─ ApplicationList.jsx    │  │  │  ├─ ApplicationCard.jsx    │  │  │  ├─ ApplicationForm.jsx    │  │  │  ├─ ApplicationFilters.jsx    │  │  │  └─ StatusBadge.jsx    │  │  ├─ hooks/    │  │  └─ application.utils.js    │  │    │  ├─ events/    │  │  ├─ components/    │  │  │  ├─ EventTimeline.jsx    │  │  │  ├─ EventItem.jsx    │  │  │  └─ EventForm.jsx    │  │  ├─ hooks/    │  │  └─ event.utils.js    │  │    │  └─ dashboard/    │     ├─ components/    │     │  ├─ StatusSummaryCards.jsx    │     │  ├─ UpcomingEventsList.jsx    │     │  └─ AttentionFlagsList.jsx    │     └─ hooks/    │    ├─ components/    │  ├─ layout/    │  ├─ common/    │  └─ feedback/    │    ├─ hooks/    │  └─ useDocumentTitle.js    │    ├─ utils/    │  ├─ date.utils.js    │  └─ storage.utils.js    │    └─ constants/       └─ status.js

-----
# <a name="frontend-design-principles"></a>19. Frontend Design Principles
## <a name="page-vs-feature-split"></a>19.1 Page vs Feature Split
Use:

- pages/ for route-level screens
- features/ for reusable domain UI and logic

A page composes feature components.\
A feature owns its own components and hooks.

-----
## <a name="api-layer"></a>19.2 API Layer
Keep API calls in src/api/.

Do not scatter fetch() or axios() calls inside random components.

Example:

- application.api.js contains:
  - getApplications
  - getApplicationById
  - createApplication
  - updateApplication
  - deleteApplication
-----
## <a name="avoid-fat-pages"></a>19.3 Avoid fat pages
A page should orchestrate layout and data flow, not contain every piece of UI and logic inline.

-----
# <a name="state-management-strategy"></a>20. State Management Strategy
## <a name="v1-decision"></a>20.1 V1 Decision
Use simple state management.

Recommended split:

- **auth state**: a lightweight store/context
- **server data**: fetched via a data-fetching layer or custom hooks
- **form state**: local component state or form library
## <a name="avoid-premature-global-stores"></a>20.2 Avoid premature global stores
Do not create a huge global store for:

- applications
- events
- dashboard
- forms
- filters
- modal state

Keep state close to where it is used unless there is a strong reason not to.

-----
# <a name="xa59151e8694b6c56d460a0c69c32447011df315"></a>21. Coding Conventions for MongoDB Native Driver
## <a name="keep-objectid-conversion-explicit"></a>21.1 Keep ObjectId conversion explicit
When an API param is an ID:

- validate it
- convert it explicitly to ObjectId

Do not rely on implicit behavior.
## <a name="keep-repository-filters-readable"></a>21.2 Keep repository filters readable
Prefer:

js id="m1" const filter = {   \_id: new ObjectId(applicationId),   userId: new ObjectId(userId) }

over compressed one-liners that are harder to review.
## <a name="normalize-date-handling"></a>21.3 Normalize date handling
Whenever a field is treated as a date:

- validate it on input
- store it consistently as a Date
- avoid mixed string/date behavior inside services
-----
# <a name="suggested-implementation-order"></a>22. Suggested Implementation Order
## <a name="phase-1-project-foundation"></a>Phase 1 — Project Foundation
Implement:

- backend app bootstrap
- MongoDB connection
- error middleware
- auth middleware
- basic response helpers
- frontend app shell and router
## <a name="phase-2-auth"></a>Phase 2 — Auth
Implement:

- register
- login
- me
- auth store/context
- protected routes
## <a name="phase-3-applications"></a>Phase 3 — Applications
Implement:

- application repository/service/controller
- create/list/detail/update/delete
- applications page + form
## <a name="phase-4-events"></a>Phase 4 — Events
Implement:

- event repository/service/controller
- timeline UI
- event create/edit/delete flow
## <a name="phase-5-dashboard"></a>Phase 5 — Dashboard
Implement:

- dashboard service
- attention domain
- upcoming events
- status counts
- dashboard page
## <a name="phase-6-cleanup"></a>Phase 6 — Cleanup
Implement:

- validation hardening
- edge-case handling
- consistent empty states
- README
- optional seed data
-----
# <a name="ai-collaboration-rules-for-this-project"></a>23. AI Collaboration Rules for This Project
This section is specifically for AI-assisted development.
## <a name="role-split"></a>23.1 Role split
If one AI writes code, the other should review/test, not rewrite architecture on its own.

Example:

- Claude writes backend application module
- Codex reviews:
  - folder placement
  - naming consistency
  - edge cases
  - validation coverage
  - status/flag logic

or vice versa.

-----
## <a name="x1d152a81503794fa8e5d09382e12f0172dfa5a4"></a>23.2 AI contributors must not change architecture silently
If an AI wants to introduce:

- a new top-level folder
- a new architectural layer
- a new dependency that changes structure
- auto-sync status logic
- background jobs / schedulers
- ORM / Mongoose
- state-management overhaul

it must be treated as an explicit design change, not a casual implementation detail.

-----
## <a name="review-checklist-for-ai-generated-code"></a>23.3 Review checklist for AI-generated code
When one AI reviews another AI’s code, it should check:
### <a name="structure"></a>Structure
- Is the file placed in the correct module?
- Is controller logic too fat?
- Is MongoDB logic leaking into controller?
### <a name="naming-1"></a>Naming
- Are functions and variables explicit?
- Are vague names avoided?
### <a name="responsibility"></a>Responsibility
- Does each file have a clear job?
- Is business logic sitting in the correct layer?
### <a name="validation"></a>Validation
- Are enums/dates/required fields validated?
### <a name="ownership-security"></a>Ownership & security
- Are user-scoped queries enforced?
- Are application/event ownership checks present?
### <a name="attention-logic"></a>Attention logic
- Are silence flags only applied to eligible statuses?
- Are thresholds and effective dates handled correctly?
### <a name="deletion-behavior"></a>Deletion behavior
- Does deleting an application also delete child events?
### <a name="output-shape"></a>Output shape
- Are responses consistent and safe?
-----
# <a name="non-goals-of-the-architecture"></a>24. Non-Goals of the Architecture
This architecture intentionally does **not** optimize for:

- multi-tenant enterprise scale
- plugin systems
- CQRS/event sourcing
- offline-first sync
- background job orchestration
- full calendar integration
- complex caching layers

Those would distort V1.

-----
# <a name="final-architectural-summary"></a>25. Final Architectural Summary
ApplyFlow V1 should be implemented as a **modular monolith** with a **layered backend** and **feature-structured frontend**.
## <a name="backend-stack"></a>Backend stack
- Node + Express
- MongoDB native driver
- modules for auth / application / event / dashboard
- domain layer for attention rules and timeline helpers
## <a name="backend-rule-of-thumb"></a>Backend rule of thumb
- **Route**: endpoint wiring
- **Middleware**: auth / validation / errors
- **Controller**: request in, response out
- **Service**: business logic
- **Repository**: MongoDB access
- **Domain**: reusable rules like attention logic
## <a name="frontend-rule-of-thumb"></a>Frontend rule of thumb
- **pages** for route screens
- **features** for domain UI + hooks
- **api** for HTTP calls
- keep state simple and local where possible
## <a name="most-important-clean-code-constraints"></a>Most important clean-code constraints
- do not hide business logic in controllers
- do not hide MongoDB logic in random utilities
- do not scatter attention rules across files
- do not add abstractions that make a small app harder to read
- optimize for a reviewer being able to understand the code quickly
