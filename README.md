# ApplyFlow

ApplyFlow is a private internship and job application tracker for one authenticated user. It tracks applications, statuses, recruitment events, follow-up dates, upcoming events, attention-needed cases, and dashboard summaries. V3 adds TanStack Query server-state handling, password reset, permanent account deletion, and a focused visual/loading pass without rewriting the V1/V2 product.

ApplyFlow is not a job board, company applicant-tracking system, or automatic job-application tool.

## Architecture and stack

ApplyFlow remains a modular monolith:

```text
React frontend -> HTTP API -> Route -> Middleware -> Controller -> Service -> Repository -> MongoDB
```

| Area | Current repository technology |
|---|---|
| Backend | Node.js, Express `^4.21.2`, MongoDB native driver `^6.12.0` |
| Frontend | React `^19.2.7`, Vite `^8.1.3`, React Router `^7.18.1`, plain CSS |
| Server state | TanStack Query `^5.101.2` for applications, events, and dashboard data |
| Authentication | JWT `^9.0.3`, bcrypt `^6.0.0` |
| Reset email | Adapter with local `console` and external `resend` providers |

The Auth provider continues to own the session and current user. TanStack Query owns only the V3 server-state domains above; the application does not use optimistic updates.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (required by the locked Vite version)
- npm
- Git
- MongoDB

Basic CRUD works with a normal MongoDB deployment. Password reset and account deletion require a replica set or another transaction-capable MongoDB deployment. A standalone server may reject those operations; ApplyFlow returns controlled `503` errors instead of falling back to partial writes.

Use only a development database for local work. HTTP E2E and large-dataset checks create and delete records and must use an explicitly disposable database.

## Install

```bash
git clone <repo-url>
cd ApplyFlow/backend
npm ci

cd ../frontend
npm ci
```

Both applications use npm lockfiles, and CI installs with `npm ci`.

## Environment

Copy the root [`.env.example`](.env.example) to `.env` at the repository root and replace placeholders locally. The backend, when started from `backend/`, loads the root `.env` first and then `backend/.env` without overriding values already loaded. Do not commit either real environment file.

### Backend variables

| Variable | Required/default | Purpose and format | Secret |
|---|---|---|---|
| `PORT` | Required | Positive integer; local example is `4000` | No |
| `MONGODB_URI` | Required | MongoDB connection URI | **Yes** |
| `MONGODB_DB_NAME` | Required | Database name | No |
| `JWT_SECRET` | Required | Signs and verifies access tokens | **Yes** |
| `NODE_ENV` | Optional; defaults to `development` | Runtime mode; production enables stricter origin/email validation | No |
| `FRONTEND_ORIGIN` | Required | Absolute HTTP/HTTPS origin with no credentials, path, query, or fragment; production requires HTTPS | No |
| `EMAIL_PROVIDER` | Defaults to `console` outside production; required in production | `console` or `resend`; `console` is forbidden in production | No |
| `RESEND_API_KEY` | Required only for `EMAIL_PROVIDER=resend` | External provider credential | **Yes** |
| `RESEND_FROM_EMAIL` | Required only for `EMAIL_PROVIDER=resend` | Valid configured sender email | Configuration-sensitive |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Optional; default `30` | Positive integer reset-token lifetime | No |
| `RESET_REQUEST_RATE_LIMIT_PER_EMAIL` | Optional; default `5` | Positive integer requests per normalized email window | No |
| `RESET_REQUEST_RATE_LIMIT_EMAIL_WINDOW_MINUTES` | Optional; default `15` | Positive integer normalized-email window | No |
| `RESET_REQUEST_RATE_LIMIT_PER_IP` | Optional; default `20` | Positive integer requests per client-IP window | No |
| `RESET_REQUEST_RATE_LIMIT_IP_WINDOW_MINUTES` | Optional; default `60` | Positive integer client-IP window | No |

There is no trusted-proxy environment variable. Express currently uses `trust proxy = false`, so deployments behind a proxy must review the effective client-IP behavior before relying on IP rate limits.

For local Vite development, use `FRONTEND_ORIGIN=http://localhost:5173`. In a deployment, it must be the public HTTPS frontend origin used to construct password-reset links.

### Frontend variable

`VITE_API_BASE_URL` belongs in `frontend/.env`. For the complete local flow, create that file with:

```env
VITE_API_BASE_URL=/api
```

Every frontend API request then uses the Vite same-origin proxy, which removes the prefix before forwarding to `http://127.0.0.1:4000`. If the variable is absent, only application/dashboard requests receive the `/api` prefix in the HTTP client and the separate `/auth` proxy covers authentication; `/users/me` is not covered. An absolute cross-origin backend URL requires CORS support, which the current Express app does not configure.

## Run locally

Start the backend after MongoDB is available:

```bash
cd backend
npm run dev
```

The server listens only after connecting to MongoDB. With `PORT=4000`, check it with:

```bash
curl http://localhost:4000/health
```

In a second terminal:

```bash
cd frontend
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Local console password reset

For local development, set `EMAIL_PROVIDER=console`, run both applications, and use **Forgot password** from the login screen. For an existing account, the backend's email adapter writes a delivery object containing the local reset link to the backend console. Treat that link as a password-equivalent secret: use it only in your local browser, do not paste it into issues or logs, and never commit it. Open the link, choose a new password, then log in again.

The public forgot-password response is deliberately the same whether an account exists or not. Console delivery exercises the adapter boundary; it does not prove external email delivery.

## Resend configuration

Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` to use the implemented Resend adapter. The key must be real and private, the sender must be valid for the provider account, and `FRONTEND_ORIGIN` must point to the frontend that should receive the reset route. A localhost origin produces a link useful only on the machine serving that frontend.

The adapter/configuration path exists, but the recorded V3-16 evidence did **not** verify real Resend delivery. Resend is not required for ordinary local development.

## Routes

| Access | Routes |
|---|---|
| Public | `GET /health`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `/forgot-password`, `/reset-password?token=...` |
| Public-only frontend | `/login`, `/register` |
| Protected auth/API | `GET /auth/me`, application/event/dashboard APIs, `DELETE /users/me` |
| Protected frontend | `/dashboard`, `/applications`, `/applications/:applicationId`, `/settings` |

Application, event, dashboard, and account routes require a JWT bearer token and are scoped to the authenticated user. Password reset invalidates old JWTs by incrementing the user's stored `tokenVersion`. Account deletion requires the current password and atomically deletes the user's events, applications, reset tokens, and user record when transactions are available.

## Verification

### Safe local automated checks

```bash
cd backend
npm run check:attention
npm run check:backend-hardening

cd ../frontend
npm run check:v3-query-qa
npm run build
```

- `check:attention` checks focused attention/timeline domain rules.
- `check:backend-hardening` checks focused validation, error, auth/reset/delete, transaction-mock, ownership, and contract assertions. Mock/source checks do not prove real MongoDB transaction behavior.
- `check:v3-query-qa` checks Query key/filter/retry behavior and focused source contracts, including a synthetic 30-record in-memory dataset. It is not live HTTP or browser proof.
- `build` proves the frontend compiles into a production bundle; it does not prove runtime browser behavior.

Useful non-writing syntax checks:

```bash
cd backend
node --check scripts/check-backend-e2e.js
node --check scripts/check-v3-large-dataset.js
```

### Data-writing checks

`npm run check:e2e` sends live HTTP requests and directly uses the configured MongoDB database for setup/assertions/cleanup. It has no disposable-confirmation guard, so run it only after manually confirming the loaded backend configuration points to a disposable database:

```powershell
cd backend
$env:APPLYFLOW_BACKEND_ORIGIN = "http://127.0.0.1:4000"
npm run check:e2e
```

`npm run check:v3-large-dataset` creates 30 applications through HTTP. It safely reports `SKIPPED` unless `V3_QA_DISPOSABLE_CONFIRM=YES`; set that variable only for an explicitly disposable backend database. Its source default, `http://127.0.0.1:4000/api`, does not match the current backend's root-mounted routes, so set `APPLYFLOW_BACKEND_ORIGIN=http://127.0.0.1:4000` when calling the backend directly.

```powershell
cd backend
$env:V3_QA_DISPOSABLE_CONFIRM = "YES"
$env:APPLYFLOW_BACKEND_ORIGIN = "http://127.0.0.1:4000"
npm run check:v3-large-dataset
```

Never run either command against personal, shared, staging, or production data.

### Manual QA and evidence

- [V3 manual testcases](frontend/docs/manual-v3-testcases.md)
- [V3 QA evidence template](docs/v3-qa-evidence-template.md)
- [V3-16 execution evidence](docs/v3-16-qa-evidence.md)

V3-16 recorded the following status; it remains **Implemented, not fully verified**.

Passed: safe local automated checks, frontend build, Query/source-contract QA, focused public-route browser smoke, and GitHub CI for its configured jobs.

Not fully verified: live backend HTTP E2E on a confirmed disposable database; live 30-record HTTP execution; real MongoDB replica-set transactions; reset/delete concurrency and rollback on a real disposable replica set; full authenticated browser regression; the authenticated Settings dialog; runtime skeleton/background-refetch timing; runtime reduced-motion, coarse-pointer and touch-parallax behavior; and real Resend delivery.

V3-18 owns the final audit and release verdict. This README does not claim V3 is release-ready.

## Continuous integration

GitHub Actions runs on pull requests and pushes to `main`:

- backend job: Node 22, `npm ci`, `check:attention`, `check:backend-hardening`;
- frontend job: Node 20, `npm ci`, production build.

CI does not currently run live MongoDB E2E, the V3 Query QA script, large-dataset HTTP checks, real-provider delivery, or browser/manual regression.

## Known limitations

- Deployment and public hosting are outside completed V3 scope.
- Real Resend delivery requires external configuration and remains unverified in V3-16.
- Real replica-set transaction verification remains outstanding.
- The deletion cascade is atomic, but V3 has no account `deleting` state; a separately authenticated concurrent mutation could theoretically interleave and create an orphan.
- V3 does not add refresh tokens, OAuth, global rate limiting, a distributed rate-limit store, or an account-recovery state machine.
- The in-memory forgot-password rate limiter is process-local, and `trust proxy` is disabled.
- Without `VITE_API_BASE_URL=/api`, the current local frontend routing does not cover `DELETE /users/me`; an absolute cross-origin API URL also needs CORS support not configured here.
- The large-dataset helper's default `/api` origin does not match the root-mounted backend routes; direct-backend runs must override `APPLYFLOW_BACKEND_ORIGIN`.
- No automated frontend browser framework is included.

## Documentation

- [V3 specification](docs/v3-spec.md)
- [V3 task plan](docs/v3-tasks.md)
- [Current architecture and V1 history](docs/ApplyFlow%20Architecture.md)
- [Test plan](docs/test-plan.md)
- [Regression checklist](docs/regression-checklist.md)
- [V3 manual testcases](frontend/docs/manual-v3-testcases.md)
- [V3 QA evidence template](docs/v3-qa-evidence-template.md)
- [V3-16 execution evidence](docs/v3-16-qa-evidence.md)
- [Final V2 evidence](docs/v2-test-evidence.md)
