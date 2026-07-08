# ApplyFlow Agent Guide

## Project Overview

ApplyFlow is a student portfolio project for internship and job application tracking. V2 work should improve correctness, QA evidence, maintainability, and explainability without rewriting the application.

## Current Stack

- Backend: Node.js, Express, MongoDB native driver, JWT, bcrypt
- Frontend: React, Vite, React Router, plain CSS
- UI libraries: do not use MUI or add any UI library unless explicitly approved

## V2 Goal

ApplyFlow V2 is a controlled quality pass, not a rewrite. Codex work should be scoped, reviewable, testable, and easy to explain.

## Hard Rules For Codex

- Do not implement V2 features unless explicitly assigned.
- Do not modify backend source code unless the assigned task allows it.
- Do not modify frontend source code unless the assigned task allows it.
- Do not add dependencies unless explicitly approved.
- Do not change `README.md` unless explicitly requested.
- Do not edit `.env` or any secret file.
- Do not remove existing docs.
- Do not change `package.json` or `package-lock.json` unless explicitly approved.
- Avoid unrelated refactors and formatting churn.
- Preserve existing API contracts unless the task explicitly requires a change.
- Stop before merge unless explicitly asked to merge.

## Required Docs Before V2 Work

Read these files before implementing any V2 task:

- `docs/v2-spec.md`
- `docs/v2-tasks.md`
- `docs/test-plan.md`
- `docs/regression-checklist.md`
- `docs/codex-workflow.md`

## Default Checks

Backend:

```powershell
cd backend
npm run check:attention
npm run check:backend-hardening
```

Frontend:

```powershell
cd frontend
npm run build
```

Codex must report exact command results. Never fake, infer, or invent test results. If a command was not run, say so and explain why.

## Standard Final Output Format

Changed files:

Implemented behavior:

Tests/checks run:

Manual test needed:

Risks:

Suggested commit message:

Verdict:
