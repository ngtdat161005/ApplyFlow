# ApplyFlow V2 Tasks

Use this file as the V2 task queue. Add, refine, and complete tasks here before starting implementation branches.

## Task Format

```md
## V2-### Task Name

Status: Proposed | Ready | In Progress | In Review | Done
Branch:
Owner:

### Goal

### Scope

### Acceptance Criteria

### Test Notes

### Audit Notes
```

## Workflow

1. Move one task to `Ready` only when scope and acceptance criteria are clear.
2. Create a dedicated branch for that task.
3. Implement only the accepted scope.
4. Run the tests listed in `docs/test-plan.md`.
5. Audit with `docs/regression-checklist.md`.
6. Fix failures and rerun affected checks.
7. Commit after QA evidence is ready for the PR.

## Backlog

## V2-001 Define First Product Task

Status: Proposed
Branch:
Owner:

### Goal

Choose the first V2 product or technical improvement.

### Scope

- Define the behavior change.
- Define affected backend and frontend areas.
- Define test and regression requirements.

### Acceptance Criteria

- The task is small enough for one focused branch.
- Manual and automated checks are listed before implementation.
- Risks are documented.

### Test Notes

- Use `docs/test-plan.md` to select checks.

### Audit Notes

- Use `docs/regression-checklist.md` before opening a PR.
