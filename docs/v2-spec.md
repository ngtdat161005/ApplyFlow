# ApplyFlow V2 Specification

This document is the working contract for V2 development. It defines how V2 scope is proposed, accepted, tested, and audited before source changes are merged.

## Goals

- Improve ApplyFlow through small, reviewable tasks.
- Keep application behavior covered by repeatable checks before each merge.
- Make regressions visible across auth, applications, events, dashboard, access control, and frontend UX.
- Separate planning and QA control from feature implementation.

## Non-Goals

- This document does not implement V2 features.
- This setup does not add dependencies.
- README changes are deferred unless a later task explicitly requires them.

## V2 Development Loop

Every V2 change follows this loop:

1. Task: Select one task from `docs/v2-tasks.md` and define its acceptance criteria.
2. Branch: Create a focused branch named for the task.
3. Implement: Change only the files needed for that task.
4. Test: Run relevant backend, frontend, and manual checks from `docs/test-plan.md`.
5. Audit: Review behavior against `docs/regression-checklist.md`.
6. Fix: Address failed checks and repeat test plus audit.
7. Commit: Commit only after the task passes its checks and the PR records QA evidence.

## Acceptance Rules

- Each task must state user-visible behavior, API behavior, or internal quality outcome before implementation starts.
- Each PR must link to the task and list commands run.
- CI must pass before merge.
- Manual QA must be recorded when behavior cannot be fully verified by automated checks.
- Cross-user data access must be treated as a blocking issue.

## Quality Gates

- Backend checks that do not require external secrets must pass in CI.
- Frontend build must pass in CI.
- Local E2E checks that require a running backend or database are manual QA until a service-backed CI job is intentionally added.
- Dependency additions require a separate task and justification.
