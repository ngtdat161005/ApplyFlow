# Codex Workflow

This document defines how Codex should help with QA-controlled V2 development in ApplyFlow.

## Operating Rules

- Work from one task in `docs/v2-tasks.md` at a time.
- Create or use a focused task branch before implementation.
- Do not implement V2 features during planning-only tasks.
- Do not modify application source code unless the selected task requires it.
- Do not add dependencies unless the task explicitly requires and justifies them.
- Do not change `README.md` unless the task explicitly requires it.

## Required Loop

1. Task: Confirm the selected task, scope, acceptance criteria, and test notes.
2. Branch: Create a branch named for the task.
3. Implement: Make the smallest source or doc changes that satisfy the task.
4. Test: Run relevant commands from `docs/test-plan.md`.
5. Audit: Check affected areas against `docs/regression-checklist.md`.
6. Fix: Resolve failures and rerun affected checks.
7. Commit: Commit only the intended files with QA evidence ready for the PR.

## Branch Guidance

- Use `codex/v2-###-short-name` unless the user requests another branch name.
- Keep branches focused on one task.
- Avoid unrelated formatting or cleanup.

## PR Guidance

- Use `.github/pull_request_template.md`.
- Link the V2 task.
- List commands run and manual QA notes.
- Call out assumptions, skipped checks, and risks.
- Treat access-control regressions as blockers.

## Audit Expectations

- Read changed files before finalizing.
- Confirm no unrelated app source changes are included.
- Confirm dependency files changed only when intended.
- Run `git status --short` before reporting completion.
