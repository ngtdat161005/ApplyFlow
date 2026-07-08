# applyflow-task-runner

## Purpose

Use this skill when implementing one ApplyFlow V2 task.

## When To Use This Skill

Use this skill for scoped V2 implementation work where the requested output is code, configuration, docs, or tests tied to a single task. Do not use it for broad rewrites, unrelated cleanup, dependency changes, or tasks without clear acceptance criteria.

## Required Input

- Task ID
- Task description
- Acceptance criteria
- Allowed scope

If any required input is missing, identify the gap before editing files.

## Required Process

1. Read `AGENTS.md`.
2. Read `docs/v2-spec.md`.
3. Read `docs/v2-tasks.md`.
4. Read `docs/codex-workflow.md`.
5. Inspect `git status`.
6. Implement only the assigned scope.
7. Avoid unrelated refactors.
8. Preserve API contracts unless the task explicitly says otherwise.
9. Run relevant checks.
10. Self-audit the diff before reporting.
11. Report changed files, tests, risks, and a suggested commit message.

## Backend Rules

- Preserve existing auth behavior.
- Preserve user scoping.
- Validate input.
- Handle invalid `ObjectId` values safely.
- Avoid cross-user data leakage.
- Keep error handling consistent with nearby routes.
- Do not change API response shapes unless required by the task.

## Frontend Rules

- Preserve existing routing patterns.
- Use plain CSS.
- Cover loading, empty, and error states when relevant.
- Avoid adding MUI or other UI libraries.
- Keep UI changes consistent with existing components and page structure.
- Do not introduce new global state patterns unless required by the task.

## Output Format

Task:

Branch:

Changed files:

Implemented behavior:

Tests/checks run:

Manual test needed:

Risks:

Suggested commit message:

Verdict: READY / NEEDS FIX
