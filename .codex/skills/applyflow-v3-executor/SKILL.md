---
name: applyflow-v3-executor
description: Execute, review, publish, and orchestrate ApplyFlow V3 tasks using the repository's V1/V2-preserving specification, one-task-per-branch workflow, exact evidence classification, merge-and-continue gates, six human-approval checkpoints, and stop-to-ask escalation. Use for any ApplyFlow task with ID V3-01 through V3-18, including implementation, QA, PR creation, merge decisions, or continuous multi-task runs.
---

# ApplyFlow V3 Executor

## Authority

Read `AGENTS.md`, `docs/v3-spec.md`, and the complete current task entry in `docs/v3-tasks.md` before V3 work. Load `docs/v2-spec.md`, `docs/ApplyFlow Specification.md`, `docs/ApplyFlow Architecture.md`, `docs/test-plan.md`, and `docs/regression-checklist.md` only as required by the task and risk.

This skill is procedural only. Canonical product, architecture, task order, merge, and stop rules remain owned by the repository documents.

## Required Input

Identify the task ID, goal, allowed scope, prerequisites, acceptance criteria, required evidence, and whether the task is auto-merge eligible or a human-approval hard gate.

## Preflight

Start from clean, current `main` with prerequisite merges present. Preserve unexplained user changes. Create one focused task branch. Inspect actual dependency versions, runtime configuration, nearby code, existing APIs, and tests before editing.

## Implement

Preserve V1/V2 contracts unless V3 explicitly changes them. Keep backend route, middleware, controller, service, repository, and MongoDB boundaries intact. Keep frontend API, page, feature, and auth-provider boundaries intact. Avoid unrelated refactors. Add or change dependencies only when the current task owns them. Do not edit secrets, `docs/v3-spec.md`, or `docs/v3-tasks.md` during implementation.

## Verify

Classify every result as `PASS`, `FAIL`, or `SKIPPED`. Identify the evidence source separately: GitHub CI, local automation, HTTP E2E, browser/manual QA, real replica-set transaction, mock, or source inspection.

A build is not browser QA. A mock is not real transaction evidence. Console email is not Resend delivery. Self-review is not independent human approval.

## Self-Review

Audit correctness, scope, API and error compatibility, auth and cross-user privacy, frontend loading/empty/error/validation states, transaction and concurrency assumptions, secrets/log output, dependencies, and evidence gaps.

## Publish

Audit the staged diff before commit. Commit only focused task changes, push the branch, open one PR per task, and wait for CI and review state.

## Merge Policy

Follow `docs/v3-tasks.md`. Never auto-merge V3-08, V3-09, V3-10, V3-12, V3-13, or V3-18. For those hard gates, stop with the required review packet and ask for approval for the exact current PR revision. Material PR changes invalidate prior approval. Missing critical evidence means recommend `DO NOT MERGE`.

## Continue After Merge

After an allowed merge, update `main`, verify the merged commit, confirm a clean worktree, and start the next task only when prerequisites pass. Never skip a blocked task.

## Stop And Ask

When a stop condition occurs, preserve state, state the blocker and evidence, explain why the sources do not decide it, offer two or three options with consequences, recommend one when justified, ask one focused question, and wait.
