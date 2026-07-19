# ApplyFlow

ApplyFlow is a private internship and job application tracker. It helps one authenticated user record applications, recruitment events, follow-up dates, upcoming events, and attention-needed cases.

V2 is a controlled quality pass over the original project. It focuses on backend contract safety, ownership isolation, predictable validation, reliable frontend states, and honest QA evidence rather than adding large new features.

## Technology

| Area | Technology |
|---|---|
| Backend | Node.js, Express, MongoDB native driver |
| Frontend | React, Vite, React Router, plain CSS |
| Authentication | JWT, bcrypt |
| Database | MongoDB |

The repository contains separate `backend/` and `frontend/` applications plus specifications, QA plans, and release evidence under `docs/`.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- Git
- a local or remote MongoDB instance

MongoDB is not bundled with ApplyFlow. Use a database intended for local development or disposable testing, never production or personal data.

## Install

```bash
git clone <repo-url>
cd ApplyFlow

cd backend
npm ci

cd ../frontend
npm ci
```

## Environment

Use the root [`.env.example`](.env.example) as a reference. Do not commit real secrets.

The backend requires:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=applyflow_dev
JWT_SECRET=replace-with-a-local-development-secret
```

When started from `backend/`, the backend reads the root `.env` and then `backend/.env` without overriding values already loaded.

The frontend can optionally use `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Without `VITE_API_BASE_URL`, the Vite development server proxies `/api` and `/auth` requests to `http://127.0.0.1:4000`.

## Run Locally

Start MongoDB through your existing local or remote setup, then start the backend:

```bash
cd backend
npm run dev
```

The API listens only after connecting to MongoDB. Verify it at:

```bash
curl http://localhost:4000/health
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Verification

### Backend checks

```bash
cd backend
npm run check:attention
npm run check:backend-hardening
node --check scripts/check-backend-e2e.js
```

- `check:attention` verifies focused attention and timeline domain rules.
- `check:backend-hardening` verifies focused validation, error, ownership-filter, and contract assertions.
- `node --check` verifies only that the E2E script parses; it does not execute HTTP scenarios.

### Live backend E2E

E2E requires a running ApplyFlow backend connected to a disposable MongoDB database:

```bash
cd backend
npm run check:e2e
```

The default backend origin is `http://127.0.0.1:4000`. To use another origin:

```powershell
$env:APPLYFLOW_BACKEND_ORIGIN = "http://localhost:4000"
npm run check:e2e
```

The script creates run-specific users, applications, and events. It removes current-run applications and their events where the API permits, but successful users remain because ApplyFlow has no user-delete endpoint.

### Frontend build

```bash
cd frontend
npm run build
```

A successful build proves the frontend compiles into a production bundle. It does not prove live API integration, browser behavior, responsive layout, or every manual testcase.

### Manual regression and evidence

- [Canonical frontend manual regression checklist](frontend/docs/manual-frontend-testcases.md)
- [V2 test plan](docs/test-plan.md)
- [Recorded V2 test evidence](docs/v2-test-evidence.md)
- [Regression risk checklist](docs/regression-checklist.md)

The recorded full V2 checkpoint accounted for 101 unique manual testcase IDs: 79 PASS, 19 BLOCKED, and 3 NOT APPLICABLE. It did not report all 101 cases as passed. See the evidence document for the tested commit, blocked IDs, environment, cleanup, and limitations.

## Continuous Integration

GitHub Actions runs on pull requests and pushes to `main`.

- Backend CI installs dependencies and runs `check:attention` plus `check:backend-hardening`.
- Frontend CI installs dependencies and runs the production build.
- Live MongoDB-backed E2E and browser/manual regression are not run in the current no-secret CI workflow.

## Main API Routes

| Area | Routes |
|---|---|
| Health | `GET /health` |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Applications | `GET/POST /applications`, `GET/PATCH/DELETE /applications/:applicationId` |
| Events | `GET/POST /applications/:applicationId/events`, `PATCH/DELETE /applications/:applicationId/events/:eventId` |
| Dashboard | `GET /dashboard/summary` |

Application, event, and dashboard routes require a JWT bearer token and return only data scoped to the authenticated user.

## Known Limitations

- No user-delete endpoint; disposable test users can remain in the selected database.
- No automated frontend browser test framework is included.
- Live E2E requires a running backend and disposable MongoDB database.
- Some timing, stale-response, native datetime, and keyboard cases remained blocked or not applicable in the recorded browser checkpoint.
- V2 does not include calendar week/month views, notifications, analytics/charts, email integration, or automatic application submission.

For product and architecture details, see [ApplyFlow Specification](docs/ApplyFlow%20Specification.md), [ApplyFlow Architecture](docs/ApplyFlow%20Architecture.md), and [V2 Specification](docs/v2-spec.md).
