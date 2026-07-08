# applyflow-test-designer

## Purpose

Use this skill to design automated and manual tests for one ApplyFlow V2 task.

## When To Use This Skill

Use this skill before or during V2 task implementation when test coverage, regression checks, or manual QA evidence need to be planned. The output should be specific to one feature or task, not a generic app-wide test plan.

## Required Input

- Feature/task description
- Affected backend endpoints
- Affected frontend pages/components

If an area is not affected, mark it out of scope instead of inventing tests.

## Backend Test Categories

- Happy path
- Validation errors
- Missing token
- Invalid `ObjectId`
- Cross-user access
- CRUD regression
- Cascade behavior where relevant
- Dashboard/count correctness where relevant

## Frontend Manual Test Categories

- Page load
- Navigation
- Form validation
- Loading state
- Empty state
- Error state
- Refresh behavior
- Responsive sanity check
- Regression around auth, applications, events, and dashboard

## Test Design Rules

- Tie each test to a requirement or acceptance criterion.
- Include the expected result for each manual case.
- Keep cases practical enough to execute during a Codex QA loop.
- Separate automated checks from manual browser verification.
- Identify evidence to capture, such as command logs, screenshots, or short notes.

## Output Format

Automated tests/checks:

Manual test cases:

Regression cases:

Edge cases:

Out of scope:

Recommended test evidence to record:
