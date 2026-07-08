# applyflow-qa-reviewer

## Purpose

Use this skill to audit a completed or partially completed ApplyFlow V2 task.

## When To Use This Skill

Use this skill for strict QA review of a current diff, completed task, partial implementation, or proposed commit. The goal is to find correctness, scope, security, regression, and evidence gaps before commit or merge.

## Required Input

- Task description
- Current diff
- Changed files
- Test results

Do not assume tests passed unless command output or test logs are provided.

## Review Checklist

1. Requirement correctness
2. Scope creep
3. Runtime bugs
4. Validation gaps
5. Auth/access-control issues
6. Cross-user data leakage
7. Error handling consistency
8. Loading/empty/error UI states
9. Missing test coverage
10. Unnecessary file changes
11. API contract breakage
12. Documentation/testcase gaps

## Review Rules

- Be strict.
- Do not praise unless justified by evidence.
- Treat missing logs as missing evidence.
- Prioritize bugs, regressions, security issues, and test gaps.
- Flag unrelated formatting churn or dependency changes.
- Recommend focused fixes and retest commands.
- Do not approve merge unless the task is correct, scoped, and supported by adequate checks.

## Output Format

Critical issues:

Minor issues:

Missing tests:

Scope creep / unrelated changes:

Suggested fixes:

Retest commands:

Verdict: COMMIT / FIX FIRST / REVERT
