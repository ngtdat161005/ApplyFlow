# ApplyFlow Test Plan

This plan defines the default checks for V2 branches. Add task-specific checks in the PR when a change touches behavior not covered here.

## CI Checks

GitHub Actions runs checks that do not require external secrets:

```sh
cd backend
npm ci
npm run check:attention
npm run check:backend-hardening
```

```sh
cd frontend
npm ci
npm run build
```

## Local Backend Checks

Run these before opening a PR for backend changes:

```sh
cd backend
npm run check:attention
npm run check:backend-hardening
```

Run the backend E2E check only when a local backend and database are available:

```sh
cd backend
npm run dev
```

In another terminal:

```sh
cd backend
npm run check:e2e
```

Use `APPLYFLOW_BACKEND_ORIGIN` if the backend is not running at the default origin.

## Local Frontend Checks

Run this before opening a PR for frontend changes:

```sh
cd frontend
npm run build
```

For manual browser QA:

```sh
cd frontend
npm run dev
```

## Manual QA Evidence

Record:

- Browser and viewport used.
- Test account or fixture data used.
- Main happy path verified.
- Permission or unauthorized path verified when access control is involved.
- Screenshots or notes for any visual changes.
