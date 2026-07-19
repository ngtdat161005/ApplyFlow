# ApplyFlow — V3 Tasks

## 1. Purpose

This document converts `docs/v3-spec.md` into small, ordered, reviewable tasks for controlled Codex implementation.

V3 is not a rewrite. It improves the existing V2 codebase in three bounded areas:

1. structured frontend data fetching with TanStack Query;
2. complete password-reset and account-deletion flows;
3. visual quality, loading UX, motion, and accessibility.

The tasks are intentionally separated by contract and risk. Do not merge adjacent tasks merely because they touch the same feature.

---

## 2. Source of Truth

Every task must read and respect:

1. `AGENTS.md` and applicable repo-local Codex skills;
2. `docs/v3-spec.md` — canonical V3 behavior and scope;
3. this document — execution order and task boundaries;
4. `docs/v2-spec.md` — preserved V2 contracts;
5. `docs/ApplyFlow Architecture.md` — current architecture baseline;
6. `docs/test-plan.md` and `docs/regression-checklist.md`.

Conflict order:

1. `docs/v3-spec.md` wins for V3 behavior;
2. V2 behavior remains unchanged unless V3 explicitly changes it;
3. this document controls task ownership and order;
4. architecture documents guide structure but must be updated later when V3 intentionally changes architecture.

Codex must not silently resolve a material contradiction. Stop and report the exact conflict.

---

## 3. Operating Rules

### 3.1 One task, one branch

Branch format:

```txt
codex/v3-XX-short-name
```

Start from a clean, current `main` containing completed V2. Do not stack a task on an unmerged V3 branch unless this document explicitly permits it or the user approves it.

### 3.2 Required loop

For every task:

```txt
read task/spec
inspect git status and branch
confirm prerequisite commits are in history
inspect current implementation
implement only allowed scope
run required automated checks
perform required manual/API checks when environment permits
self-review diff and dependency changes
report exact PASS/FAIL/SKIPPED evidence
commit and push the focused branch
open a focused PR and wait for required CI/review state
merge only when every merge gate passes
delete the merged task branch when safe
update local main and verify the merge commit
continue to the next task
```

This is a merge-and-continue workflow. One Codex run may complete multiple ordered tasks, but each task still requires its own branch, commit, PR, evidence, and merge decision. Never combine several V3 tasks into one branch or one PR merely to keep the run moving.

### 3.3 Dependency policy

- `@tanstack/react-query` is the only mandatory new frontend runtime dependency.
- No Tailwind, MUI, animation library, CSS-in-JS system, or generic state/data framework.
- A backend dependency for Resend or scoped rate limiting is allowed only in its owning task, with justification and lockfile review.
- Do not add a dependency when the existing runtime safely satisfies the contract.

### 3.4 Documentation policy

- Implementation tasks may update focused tests and QA checklists when behavior changes.
- Do not rewrite `docs/v3-spec.md` or `docs/v3-tasks.md` during implementation.
- Architecture and README changes belong to V3-17.
- Final audit findings belong to V3-18; V3-18 does not silently fix unrelated product behavior.

### 3.5 Verification honesty

`PASS`, `FAIL`, and `SKIPPED` are distinct.

- A build does not prove browser UX.
- Source inspection does not prove HTTP E2E.
- Mocked transactions do not prove a real replica-set transaction.
- Console email transport does not prove Resend delivery.
- If MongoDB, backend, browser automation, Resend, or remote CI is unavailable, record the exact limitation.

### 3.6 Definition of done

A task is done only when:

- prerequisites are present;
- acceptance criteria are satisfied;
- required checks pass or environment-dependent checks are explicitly skipped;
- affected access-control, error, loading, and accessibility paths are checked;
- no unrelated files or dependencies are included;
- final report lists branch/PR, changed files, commands/results, manual evidence, known risks, commit, and merge result.

Unverified code must be reported as `Implemented, not fully verified`.

### 3.7 Merge gate

Codex may merge a task PR and continue only when all applicable conditions are true:

- prerequisite tasks are present on current `main`;
- the branch contains only the current task scope;
- required local checks pass;
- required GitHub checks pass;
- no review is requesting changes;
- no unresolved merge conflict exists;
- no secret, raw reset token, API key, private email, or connection string appears in the diff, logs, or evidence;
- no acceptance criterion classified as critical for the task remains unverified;
- skipped optional/environment-dependent checks are recorded and do not hide a release blocker;
- the PR is mergeable and merging it does not bypass repository protection rules.

After merge, Codex must return to `main`, update from `origin/main`, verify the merged commit is present, confirm the worktree is clean, and only then create the next task branch.

Passing local checks and CI is necessary but is not, by itself, independent verification of security-critical behavior. Current repository CI does not independently prove replica-set transactions, concurrent reset-token use, rollback behavior, or browser private-cache clearing. Codex must not treat its own test report as authority to merge the hard-gate tasks below.

#### 3.7.1 Auto-merge tasks

The following tasks may be merged automatically when every ordinary merge gate passes:

- V3-01 through V3-07;
- V3-11;
- V3-14 through V3-17.

Auto-merge authority does not waive any test, review, CI, scope, or stop condition. If a material decision or blocker exists, §3.8 still requires Codex to stop and ask.

#### 3.7.2 Human-approval hard gates

The following six tasks always require explicit per-PR user approval before merge, even when local checks and GitHub CI pass:

- **V3-08** — `tokenVersion` changes authentication for every protected request;
- **V3-09** — forgot-password issuance, email enumeration resistance, token replacement, and rate limits;
- **V3-10** — atomic reset consumption, concurrency, transaction behavior, and old-session invalidation;
- **V3-12** — account-deletion cascade, rollback, and transaction behavior;
- **V3-13** — deletion UX and removal of private client cache;
- **V3-18** — final V3 release verdict and acceptance of remaining limitations.

For each hard-gate PR, Codex must stop after the PR is ready and provide a review packet containing:

1. PR link, branch, and commit SHA;
2. exact changed-file list and concise security-impact summary;
3. automated commands with PASS/FAIL/SKIPPED results;
4. which evidence came from current GitHub CI, local automation, real replica-set execution, mocks, source inspection, or manual browser QA;
5. unverified acceptance criteria and known limitations;
6. focused diff areas the user should inspect;
7. a clear recommendation: `APPROVE MERGE` or `DO NOT MERGE`;
8. one explicit question asking whether to merge this exact PR revision.

The original instruction to run V3 continuously is **not** advance approval for these six merges. Approval must be given after the current review packet exists. If any commit is added or the PR changes materially after approval, approval is invalidated and Codex must present updated evidence and ask again.

Codex must not enable auto-merge, merge through another method, bypass protection, or continue to a dependent task while approval is pending. Human approval prevents unilateral agent merge but does not claim that the human independently executed missing tests.

Hard-gate minimum evidence remains mandatory before Codex may recommend approval:

- V3-08: protected-route/backend auth regression must run.
- V3-09: enumeration response, token replacement, and scoped rate limiting must be verified.
- V3-10: one-time/concurrent token use and transaction behavior must be verified.
- V3-12: cascade success, forced rollback, and real transaction behavior must be verified.
- V3-13: successful deletion must leave no reachable private client cache.
- V3-18: no release blocker may remain for a `READY` recommendation.

If mandatory evidence cannot be obtained, Codex must recommend `DO NOT MERGE` and ask how the user wants to resolve the blocker. Human approval must not be presented as a substitute for missing critical evidence.

### 3.8 Decision escalation — stop and ask

Codex must make routine, reversible implementation decisions that are already constrained by the spec. It must **stop the entire task chain and ask the user** when a material decision cannot be derived confidently from the source documents or current repository.

Stop and ask when any of these occurs:

- two source-of-truth documents materially conflict;
- the repository differs from a prerequisite assumption in a way that changes scope, API behavior, data model, security, or task order;
- more than one reasonable option would produce meaningfully different public behavior, architecture, dependency footprint, migration behavior, cost, or security posture;
- satisfying the task appears to require an out-of-scope feature, new service, unapproved dependency, broad refactor, destructive migration, or weakening of a V2/V3 contract;
- required environment credentials, provider configuration, repository permission, database capability, or user-owned choice is missing;
- a security-critical test cannot be executed or produces ambiguous evidence;
- CI fails for a reason that cannot be corrected within the current task without changing scope;
- review feedback requests behavior outside the task/spec;
- merge conflict resolution would require choosing between meaningful user changes and task changes;
- a potentially exposed secret or destructive data operation is discovered;
- a merge gate cannot be classified confidently as pass, fail, or acceptable skip.

When stopping, Codex must:

1. stop before committing, pushing, merging, or starting another task if the unresolved decision affects those actions;
2. preserve the current branch/worktree and avoid destructive cleanup;
3. state the exact blocker and the evidence that produced it;
4. explain why the spec/repository does not determine the answer;
5. present 2–3 concrete options with consequences and identify the recommended option when one is supportable;
6. ask one focused question;
7. wait for the user's answer and do not continue the chain automatically.

Codex must **not** stop for routine choices that are local, reversible, and behavior-preserving, such as a private helper name, small file placement consistent with the existing architecture, or equivalent test-fixture details. Record those choices in the task report instead of asking unnecessarily.

### 3.9 Chain stop conditions

In addition to decision escalation, stop the continuous run when:

- current `main` or the task branch has unexplained dirty changes;
- a prerequisite task/merge is missing;
- a required check fails after reasonable in-scope fixes;
- required CI is failing or unavailable beyond a reasonable wait;
- a PR has unresolved requested changes;
- a hard-gate check is `SKIPPED`;
- repository protection prevents the authorized merge;
- the current task ends as `Implemented, not fully verified` and the missing verification is material to the next task.

Do not skip the blocked task and continue with later tasks unless the user explicitly changes the task order.

---

## 4. Phase and Task Overview

| Phase | Tasks | Purpose |
|---|---|---|
| 0 — Readiness | V3-01 | Verify the completed V2 baseline and map exact V3 touchpoints |
| 1 — Frontend foundations | V3-02–V3-07 | Tokens, Query Client, and feature-by-feature query migration |
| 2 — Password reset | V3-08–V3-11 | Session invalidation, reset request, reset consumption, frontend flow |
| 3 — Account deletion | V3-12–V3-13 | Transactional backend deletion and protected Settings UX |
| 4 — Visual polish | V3-14–V3-15 | Auth presentation, skeletons, and restrained in-app motion |
| 5 — QA and release | V3-16–V3-18 | Large-data QA, documentation, and final regression audit |

### Task list

- **V3-01** — Audit V2 completion and V3 implementation baseline
- **V3-02** — Expand and apply frontend design tokens
- **V3-03** — Install and configure TanStack Query foundation
- **V3-04** — Migrate application list queries and mutations
- **V3-05** — Migrate application detail queries and mutations
- **V3-06** — Migrate application events queries and mutations
- **V3-07** — Migrate dashboard query and audit invalidation
- **V3-08** — Add `tokenVersion` session invalidation contract
- **V3-09** — Implement forgot-password request, email adapter, and rate limits
- **V3-10** — Implement atomic reset-password consumption
- **V3-11** — Implement password-reset frontend flow
- **V3-12** — Implement transactional account deletion backend
- **V3-13** — Implement Settings page and delete-account frontend
- **V3-14** — Redesign Login/Register presentation
- **V3-15** — Add in-app skeletons and restrained micro-interactions
- **V3-16** — Expand V3 automated/manual QA and large-dataset checks
- **V3-17** — Update architecture, setup, security, and README documentation
- **V3-18** — Run final V3 regression and release audit

### Dependency gates

- V3-03 must merge before V3-04.
- V3-04 → V3-05 → V3-06 → V3-07 are sequential migrations.
- V3-08 must merge before V3-09 and V3-10.
- V3-09 must merge before V3-10; V3-10 before V3-11.
- V3-09 must merge before V3-12 because V3-09 creates the `passwordResetTokens` collection/repository that account deletion must clean up. The normal sequential task order still places V3-10 and V3-11 before V3-12.
- V3-12 must merge before V3-13.
- V3-02 must merge before V3-14 and V3-15.
- V3-07 should merge before V3-15 so skeleton/filter transitions are built on the final query lifecycle.
- V3-14 and V3-15 must merge before V3-16.
- All implementation tasks must merge before V3-17.
- V3-17 must merge before V3-18.

---

## 5. Common Prompt Header

Use this header for every implementation prompt:

```txt
Use AGENTS.md.
Read docs/v3-spec.md and the full V3 task entry before changing files.
Start only from a clean task branch with all prerequisite tasks merged.
Preserve V2 contracts unless this task explicitly changes them.
Do not edit unrelated files. Commit/push/PR/merge authority applies only to this V3 merge-and-continue workflow and remains subject to every merge gate and stop condition.
Report PASS/FAIL/SKIPPED evidence exactly; never infer a test passed.
For this V3 execution, commit, push, open a PR, wait for required checks, merge, update main, and continue only when the merge gate in docs/v3-tasks.md passes.
Never auto-merge V3-08, V3-09, V3-10, V3-12, V3-13, or V3-18. For those tasks, stop with the required review packet and obtain explicit approval for the exact current PR revision.
If a material choice is not determined by the spec/repository, or any stop condition occurs, stop the full chain, present options, ask one focused question, and wait. Never guess merely to keep the run moving.
```

---

# Phase 0 — Readiness

## V3-01 — Audit V2 Completion and V3 Implementation Baseline

### Goal

Verify the repository actually matches the assumptions in `v3-spec.md` before V3 source changes begin.

### Branch

```txt
codex/v3-01-baseline-audit
```

### Allowed scope

- repository/source inspection;
- `docs/v3-baseline-audit.md`;
- focused corrections to V3 planning docs only if a blocking factual mismatch is found and explicitly reported.

No application source changes and no dependency changes.

### Required audit

- Confirm V2 final task/PR is merged and `main` is clean/current.
- Confirm current Node/npm/frontend/backend versions from repository files; do not guess versions.
- Locate `query-client.js`, provider setup, `refreshKey`, duplicated loading/error state, and current API functions.
- Record current token payload and `requireAuth` behavior.
- Record user, application, and event collection names and Mongo client/session access.
- Record current auth routes, page routes, styles/tokens, loaders, and reusable preview components.
- Inspect current backend check scripts, frontend scripts, CI, and environment validation.
- Identify dirty/untracked files without modifying or deleting them.

### Acceptance criteria

- Audit distinguishes verified source facts from unrun runtime behavior.
- Every later V3 task has confirmed touchpoints or an explicit uncertainty.
- No V3 feature is implemented.

### Verification

```sh
git status --short --branch
git log --oneline --decorate -n 20
cd backend && npm run check:attention && npm run check:backend-hardening
cd ../frontend && npm run build
```

Run only safe existing checks. Mark database/browser/remote-CI checks as SKIPPED unless actually executed.

### Prompt body

```txt
Task: V3-01 — Audit the completed V2 repository against docs/v3-spec.md.
Create docs/v3-baseline-audit.md only. Do not implement V3 features.
Verify exact source paths, dependency versions, scripts, auth/JWT behavior, Mongo connection/session shape, frontend data-fetch patterns, tokens/loaders, and reusable components.
Run safe existing checks and report unrun checks honestly.
```

---

# Phase 1 — Frontend Foundations

## V3-02 — Expand and Apply Frontend Design Tokens

### Goal

Create the visual token foundation without redesigning pages or changing behavior.

### Branch

```txt
codex/v3-02-design-tokens
```

### Allowed scope

- `frontend/src/styles.css` and existing page/component CSS using arbitrary type/spacing values;
- focused visual regression notes.

### Requirements

- Add the exact type, spacing, secondary accent, and 8px radius tokens from spec §3.
- Replace arbitrary values where an exact scale value preserves the intended layout.
- Do not mechanically replace values that encode a real geometry constraint, icon size, breakpoint, border width, or component-specific calculation.
- Preserve primary accent, font family, semantics, responsive layout, and status colors.
- Verify secondary-accent contrast and never use color alone for state.

### Out of scope

- Auth redesign, skeletons, parallax, route animation, component restructuring, query work.

### Acceptance and checks

- No obvious arbitrary font-size/spacing drift remains in V3-touched UI.
- Existing pages remain usable at desktop and mobile widths.
- `cd frontend && npm run build` passes.
- Manual visual notes cover Login, Register, Dashboard, Applications, and Detail at one desktop and one mobile viewport.

### Prompt body

```txt
Task: V3-02 — Expand and apply frontend design tokens.
Implement only spec §3. Preserve current page behavior and visual identity.
Do not redesign auth, add motion, change query logic, or add dependencies.
Use judgment: geometric constants and breakpoints are not spacing-token violations.
Run the frontend build and record desktop/mobile visual evidence.
```

---

## V3-03 — Install and Configure TanStack Query Foundation

### Goal

Replace the placeholder query setup with a real, minimal Query Client foundation without migrating feature pages yet.

### Branch

```txt
codex/v3-03-query-foundation
```

### Requirements

- Install the repository-compatible stable version of `@tanstack/react-query`; inspect current React/package versions first.
- Implement `app/query-client.js`, Query Client provider wiring, and centralized key factories from spec §2.4.
- Preserve the existing AuthProvider/store; provider ordering must not break auth bootstrap.
- Do not build a generic API framework, custom cache wrapper, optimistic updates, or devtools dependency.
- Ensure filters will be canonical serializable objects.

### Acceptance and checks

- App renders with Query Client available.
- Login, protected redirect, authenticated refresh, and logout still behave as before.
- No feature has two competing query providers.
- Only intended package/lockfile changes occur.
- `cd frontend && npm run build` passes.

### Prompt body

```txt
Task: V3-03 — Add the minimal TanStack Query foundation from spec §2.
Do not migrate applications, detail, events, dashboard, or auth state in this task.
Do not add devtools or a generic data layer.
Review the lockfile diff and verify existing auth/protected-route behavior.
```

---

## V3-04 — Migrate Application List Queries and Mutations

### Goal

Replace application-list `refreshKey` and duplicated request state with TanStack Query.

### Branch

```txt
codex/v3-04-query-application-list
```

### Requirements

- Use `applicationKeys.list(canonicalFilters)` for list reads.
- Preserve V2 search/filter/sort/reset behavior and backend query contract.
- Migrate list-owned create/update/delete mutations only where the current page owns them.
- Invalidate list and dashboard keys exactly as spec §2.5 requires.
- Remove deleted application detail/event cache entries after successful deletion.
- Preserve distinct initial loading, empty, filtered-empty, error, retry, and mutation-loading states.
- No optimistic updates and no animation work.

### Acceptance and checks

- No `refreshKey` remains for the application list.
- Search/filter/sort generate stable query keys and no accidental request loop.
- Create/update/delete refresh appropriate data without full-page reload.
- Frontend build passes.
- Manual test with at least 10 records covers search, filter, sort, retry, create, update, and delete.

### Prompt body

```txt
Task: V3-04 — Migrate only the Applications list to TanStack Query.
Preserve every V2 list state and query parameter contract.
Use canonical filters and exact invalidation rules; remove deleted detail/event cache.
Do not migrate detail, events, dashboard, or auth and do not add animation.
```

---

## V3-05 — Migrate Application Detail Queries and Mutations

### Goal

Move application-detail loading/update/delete behavior onto the shared query contract.

### Branch

```txt
codex/v3-05-query-application-detail
```

### Requirements

- Use `applicationKeys.detail(applicationId)`.
- Preserve invalid ID, not-found, unauthorized/not-found privacy, refresh, edit, delete, and navigation behavior.
- Update mutation invalidates detail, lists, and dashboard.
- Delete mutation clears detail/events cache before safe navigation.
- Do not migrate events in this task even if rendered on the same page; keep boundaries explicit.

### Acceptance and checks

- Detail no longer owns duplicated fetch/loading/error state.
- No stale deleted private data is visible after deletion.
- Direct URL refresh and invalid/not-found URLs remain safe.
- Frontend build and page-specific browser checks pass.

### Prompt body

```txt
Task: V3-05 — Migrate only application detail reads and detail-owned mutations.
Preserve V2 error/privacy/navigation behavior.
Do not migrate event requests or dashboard in this task.
Verify direct URL refresh, update, delete, invalid ID, and not-found states.
```

---

## V3-06 — Migrate Application Events Queries and Mutations

### Goal

Move nested event CRUD and timeline fetching onto TanStack Query.

### Branch

```txt
codex/v3-06-query-events
```

### Requirements

- Use `applicationKeys.events(applicationId)`.
- Preserve event ordering, validation, parent ownership, form state, and timeline semantics.
- Event mutations invalidate events and dashboard summary.
- Preserve empty, loading, error, retry, form-submit, and delete states.
- No optimistic reordering or animation.

### Acceptance and checks

- Event CRUD updates without manual refresh.
- Wrong-parent/cross-user behavior remains private and safe.
- Timeline ordering remains deterministic.
- Frontend build passes; browser QA covers create/edit/delete/error/empty timeline.

### Prompt body

```txt
Task: V3-06 — Migrate application events to TanStack Query.
Preserve V2 event validation, ownership, and timeline ordering.
Invalidate only the documented event/dashboard keys.
Do not add optimistic updates, list animation, or dashboard migration.
```

---

## V3-07 — Migrate Dashboard Query and Audit Invalidation

### Goal

Complete query migration and prove cross-feature mutations refresh dashboard data correctly.

### Branch

```txt
codex/v3-07-query-dashboard
```

### Requirements

- Use `dashboardKeys.summary()` for dashboard reads.
- Preserve the finalized V2 dashboard response and all empty/loading/error sections.
- Remove remaining V3-targeted `refreshKey` and duplicated fetch states.
- Audit application/event mutation invalidation across V3-04–V3-06.
- Do not broaden into auth state or unrelated fetches.

### Acceptance and checks

- Applications list, detail, events, and dashboard use the shared query layer.
- Creating/updating/deleting applications or events produces fresh dashboard data on next view without manual browser refresh.
- No query/refetch loop or stale deleted detail data.
- Frontend build passes; manual cross-page invalidation evidence is recorded.

### Prompt body

```txt
Task: V3-07 — Migrate dashboard summary and audit all V3 query invalidation.
Do not change backend dashboard contracts or migrate auth state.
Verify cross-page freshness after every application/event mutation and report exact evidence.
```

---

# Phase 2 — Password Reset

## V3-08 — Add `tokenVersion` Session Invalidation Contract

### Goal

Make protected sessions revocable before password-reset endpoints are introduced.

### Branch

```txt
codex/v3-08-token-version
```

### Requirements

- New users receive `tokenVersion: 0`; existing missing values read as `0`.
- Session JWTs include numeric `tokenVersion`.
- `requireAuth` verifies JWT, loads the user, and compares versions.
- Missing payload version means `0`; negative/non-numeric values return `401`.
- Missing/deleted users return the existing unauthorized contract.
- Safe user mappers never expose `passwordHash` or `tokenVersion`.
- Keep controllers thin and Mongo access in repositories.

### Out of scope

- Forgot/reset endpoints, email, reset-token collection, frontend reset UI, refresh tokens.

### Acceptance and checks

- Existing tokens for users without stored version continue working as version 0.
- Version mismatch returns `401` on every protected route.
- Login/me/register behavior and all user-scoped endpoints regress cleanly.
- Backend checks and backend E2E run when database is available.

### Prompt body

```txt
Task: V3-08 — Implement only tokenVersion issuance and requireAuth validation from spec §6.7.
Do not add password-reset endpoints yet.
Regression-test every protected domain because requireAuth now performs a DB lookup.
Do not expose tokenVersion in API user objects.
```

---

## V3-09 — Implement Forgot-Password Request, Email Adapter, and Rate Limits

### Goal

Create reset requests securely without exposing whether an account exists.

### Branch

```txt
codex/v3-09-forgot-password
```

### Requirements

- Implement `passwordResetTokens` schema/repository and required indexes.
- Implement `POST /auth/forgot-password` exactly as spec §§6.1–6.6.
- Generate 32-byte random raw tokens; store SHA-256 only; never log raw email/token.
- Delete old user tokens before creating a replacement; TTL remains cleanup only.
- Implement email adapter with Resend and development/test transport boundaries.
- Apply normalized-email and IP limits with explicit trusted-proxy behavior.
- Preserve the same success status/body for existing and non-existing accounts.
- On delivery failure, sanitize logs and leave no usable active token.
- Validate new environment configuration at startup.

### Dependency rule

Any Resend/rate-limit dependency must be justified in the task report. Review package and lockfile changes. Do not introduce global rate limiting.

### Acceptance and checks

- Second request invalidates the first token.
- Existing/non-existing emails receive the same public success contract.
- Sixth same-email request in 15 minutes returns documented `429`.
- CI uses no real email network call and emits no raw token.
- Existing auth endpoints regress cleanly.

### Prompt body

```txt
Task: V3-09 — Implement forgot-password issuance, reset-token persistence, email adapter, and scoped rate limits.
Do not implement password consumption or frontend UI.
Treat TTL as cleanup only, prevent email enumeration, sanitize logs, and justify dependencies.
Test with fake/console email capture without printing secrets in normal CI output.
```

---

## V3-10 — Implement Atomic Reset-Password Consumption

### Goal

Consume reset tokens once, update the password, and revoke all old sessions atomically.

### Branch

```txt
codex/v3-10-reset-password
```

### Requirements

- Implement `POST /auth/reset-password` and exact spec error contracts.
- Hash incoming token with SHA-256 and compare safely.
- Check expiry in the query/logic, independent of TTL cleanup.
- Within one Mongo transaction: atomically claim/delete one unexpired token, hash/update password, increment `tokenVersion`.
- Abort restores the claim if any step fails.
- Transactions unavailable → `503 RESET_UNAVAILABLE`; no non-atomic fallback.
- Reset does not issue a JWT or log the user in.
- Two concurrent submissions with one token cannot both succeed.

### Acceptance and checks

- Valid reset succeeds once.
- Used, malformed, missing, expired, and weak-password cases match spec.
- Old JWT becomes `401`; login with old password fails and new password succeeds.
- A real replica-set test or explicit SKIPPED result is recorded separately from mocked tests.

### Prompt body

```txt
Task: V3-10 — Implement atomic reset-password consumption.
Use one ClientSession transaction for token claim, password update, and tokenVersion increment.
Do not fall back when transactions are unavailable and do not auto-login.
Add a concurrency test proving one raw token cannot succeed twice.
```

---

## V3-11 — Implement Password-Reset Frontend Flow

### Goal

Expose the backend flow through accessible, non-enumerating frontend screens.

### Branch

```txt
codex/v3-11-password-reset-ui
```

### Requirements

- Add `/forgot-password` and `/reset-password?token=...` public routes.
- Add “Forgot password?” from Login.
- Forgot form always shows the generic success state on normal success.
- Reset form includes new password and confirmation; token is read from URL and sent only on submit.
- Invalid/expired/used tokens share a safe user-facing message.
- Success redirects/links to Login without auto-login.
- Handle loading, double-submit prevention, validation, `429`, `503`, missing URL token, and generic failure.
- Do not store raw reset tokens in local storage, app state persistence, analytics, or logs.

### Acceptance and checks

- Frontend build passes.
- Browser QA covers generic email response, weak/mismatched password, missing/invalid/expired/used token, success, mobile layout, and keyboard focus.
- Existing Login/Register behavior remains intact.

### Prompt body

```txt
Task: V3-11 — Implement the complete password-reset frontend flow from spec §§6 and 8.
Do not redesign the auth pages yet and do not auto-login after reset.
Keep reset tokens ephemeral and handle 429/503/error/loading states explicitly.
Run build and browser QA at desktop and mobile widths.
```

---

# Phase 3 — Account Deletion

## V3-12 — Implement Transactional Account Deletion Backend

### Goal

Delete the authenticated user and owned data atomically after password confirmation.

### Branch

```txt
codex/v3-12-delete-account-backend
```

### Requirements

- Implement `DELETE /users/me`; accept password only, never a client userId.
- Re-read authenticated user and verify current password.
- Use one shared `ClientSession` and pass `{ session }` through every repository delete.
- Delete events → applications → reset tokens → user.
- Wrong password returns `401 INVALID_PASSWORD` without mutation.
- Unsupported transactions return `503 DELETE_UNAVAILABLE`; no non-atomic fallback.
- Success returns only `{ "message": "Account deleted." }`.
- Preserve the documented concurrent-mutation limitation; do not add a deletion state machine.

### Acceptance and checks

- Correct password removes all four data categories.
- Wrong password and forced mid-cascade failure leave all data intact.
- User A cannot target user B.
- Deleted JWT no longer authenticates.
- Replica-set transaction evidence is separate from mock evidence; unsupported environments are SKIPPED honestly.

### Prompt body

```txt
Task: V3-12 — Implement DELETE /users/me with password confirmation and an atomic MongoDB cascade.
Use the authenticated identity only and preserve repository/service/controller boundaries.
No non-atomic fallback and no account-status state machine.
Test success, wrong password, rollback, cross-user safety, and unsupported transactions.
```

---

## V3-13 — Implement Settings Page and Delete-Account Frontend

### Goal

Provide a protected, deliberate danger-zone flow for account deletion.

### Branch

```txt
codex/v3-13-delete-account-ui
```

### Requirements

- Add protected `/settings` route and discoverable authenticated navigation entry.
- Scope Settings to account deletion only; no profile/preferences expansion.
- Danger zone explains permanence and affected data.
- Confirmation modal requires password and deliberate submit.
- Disable double-submit and support keyboard/focus management.
- `401 INVALID_PASSWORD` remains inline and keeps session intact.
- `503` and generic errors keep session/data and allow retry.
- Only a successful `200` clears auth/query caches and redirects to Login.

### Acceptance and checks

- Unauthenticated `/settings` redirects safely.
- Cancel, wrong password, unavailable service, success, refresh, mobile, and keyboard paths are verified.
- Successful deletion leaves no private cached screen reachable through Back navigation.
- Frontend build passes.

### Prompt body

```txt
Task: V3-13 — Add the protected Settings danger zone and delete-account UX.
Do not add profile editing or other settings.
Clear auth and private query caches only after backend success.
Verify wrong-password/error paths preserve the session and Back navigation reveals no stale private data after success.
```

---

# Phase 4 — Visual Polish

## V3-14 — Redesign Login/Register Presentation

### Goal

Make Auth the restrained presentation surface while preserving real auth behavior.

### Branch

```txt
codex/v3-14-auth-visual
```

### Requirements

- Implement split-screen layout using V3 tokens.
- Prefer real presentational components with clearly labeled sample data.
- Preview is read-only: no navigation, mutations, or real pre-login data.
- If reuse requires meaningful production-component coupling, use a static CSS/HTML illustration without duplicating production markup.
- Add ≥12s gradient animation, ±8px pointer parallax via CSS variables/requestAnimationFrame, and mount fade-in.
- Disable parallax on touch/reduced-motion; reduced-motion disables non-essential animation.
- Preserve Login/Register/password-reset behavior, errors, loading, autocomplete, labels, focus, and responsive layout.

### Acceptance and checks

- No Tailwind/MUI/animation dependency.
- Preview is explicitly “Sample data” and inert.
- Desktop split-screen collapses cleanly on mobile.
- Reduced-motion and touch checks pass.
- Frontend build and auth regression pass.

### Prompt body

```txt
Task: V3-14 — Redesign Login/Register presentation according to spec §§4–5.
Behavior and auth contracts are frozen; this is visual/accessibility work.
Use real components only when reuse stays presentational and small; otherwise use an inert static illustration.
Verify reduced motion, touch, mobile, keyboard, login, register, and forgot-password entry.
```

---

## V3-15 — Add In-App Skeletons and Restrained Micro-interactions

### Goal

Improve repeated-use pages without introducing distracting motion or masking query errors.

### Branch

```txt
codex/v3-15-in-app-motion-skeletons
```

### Requirements

- Add 150–200ms fade-in on mount, not crossfade.
- Card hover changes box-shadow only; no scale/translation.
- Replace full-page loaders with layout-matching skeletons for Dashboard, Applications, Detail, and relevant Settings/protected bootstrap states.
- Decorative skeletons are `aria-hidden`; loading is announced accessibly.
- Filter/sort transition is opacity only, ≤200ms, without reorder animation or layout shift.
- Respect reduced-motion everywhere.
- Preserve error, empty, filtered-empty, background-refetch, and mutation states; do not show initial skeleton for every background refetch.

### Acceptance and checks

- Initial loading and background refetch are visibly distinct and do not flash the whole page.
- No layout shift or transformed dense-list cards.
- 20–50-item filtering/sorting remains stable.
- Frontend build, reduced-motion, desktop/mobile, slow-network, and error-state checks are recorded.

### Prompt body

```txt
Task: V3-15 — Add in-app skeletons and restrained micro-interactions.
Build on the completed TanStack Query lifecycle; do not change data contracts.
Keep initial load separate from background refetch and preserve every empty/error state.
No reorder animation, card transform, animation library, or layout shift.
```

---

# Phase 5 — QA and Release

## V3-16 — Expand V3 QA and Large-Dataset Checks

### Goal

Turn V3 security/query/visual claims into repeatable evidence.

### Branch

```txt
codex/v3-16-qa-expansion
```

### Allowed scope

- backend check/E2E scripts;
- frontend/manual testcase documents;
- `docs/test-plan.md`, `docs/regression-checklist.md`, and V3 evidence templates;
- minimal testability hooks only when justified, with no product behavior change.

### Required coverage

- Query invalidation matrix and deleted-cache clearing.
- Forgot-password enumeration resistance contract, replacement token, rate limits, provider failure, and secret-safe logs.
- Reset token expiry, one-time use, concurrent submissions, password update, and old-JWT invalidation.
- Account delete wrong password, cascade success, rollback, unsupported transaction, and cross-user safety.
- Real replica-set evidence distinguished from mocks.
- Auth/reset/settings accessibility and responsive checks.
- Reduced-motion, touch parallax, skeleton/error/background-refetch states.
- Seed/use 20–50 disposable applications with varied statuses/dates; never use private real-user data.

### Acceptance and checks

- Tests clean up disposable data where practical.
- Secrets/tokens/emails are not printed in committed evidence.
- Environment-dependent checks report SKIPPED precisely.
- Existing backend checks and frontend build pass.

### Prompt body

```txt
Task: V3-16 — Expand automated and manual QA for all V3 contracts.
Do not add product features or rewrite implementation solely to make tests convenient.
Keep mock, standalone-Mongo, replica-set, browser, and remote-CI evidence separate.
Use disposable large-list data and sanitize all evidence.
```

---

## V3-17 — Update Architecture, Setup, Security, and README Documentation

### Goal

Make repository documentation accurately describe the merged V3 implementation.

### Branch

```txt
codex/v3-17-docs
```

### Allowed scope

- `docs/ApplyFlow Architecture.md`;
- `README.md`;
- `.env.example` documentation alignment if not already owned by implementation;
- links among V3 spec/tasks/test/evidence documents.

### Requirements

- Document Query Client/provider, key factory, migration boundaries, and no optimistic updates.
- Document reset-token collection/indexes, email adapter, scoped rate limits, tokenVersion DB lookup, and transaction semantics.
- Document account-deletion cascade and accepted concurrent-mutation limitation.
- Document all new environment variables without real secrets.
- Add exact setup/test commands verified against package scripts.
- Clearly separate console email development flow from Resend production-like flow.
- Do not claim real Resend delivery, replica-set E2E, browser QA, or CI passed without evidence.

### Acceptance and checks

- README and architecture match actual merged code, not intended design.
- No secret, raw token, personal email, API key, or private connection string is included.
- Links and commands are valid.
- Documentation diff contains no unrelated V1/V2 rewrite.

### Prompt body

```txt
Task: V3-17 — Align architecture, README, environment setup, and security notes with merged V3 code.
Document only verified implementation and evidence.
Do not change application behavior and do not expose secrets.
Audit every command/link and record any unverified claim as a limitation.
```

---

## V3-18 — Final V3 Regression and Release Audit

### Goal

Decide whether V3 is ready to merge/release as a coherent portfolio milestone.

### Branch

```txt
codex/v3-18-final-audit
```

### Allowed scope

- final audit/evidence document;
- focused test/checklist corrections;
- no feature implementation, broad refactor, or silent README rewrite.

### Required audit

- Confirm V3-01 through V3-17 commits/PRs are present in order.
- Run backend install/checks and frontend clean install/build.
- Run backend E2E on available database; separately identify replica-set transaction coverage.
- Run the manual V3 regression checklist with 20–50 disposable applications when browser/backend are available.
- Inspect remote CI if access is available; do not infer it.
- Audit dependency diffs, environment examples, logs, source maps/config, and repository history/diff for exposed secrets.
- Verify no Tailwind/MUI/animation framework, auth-to-React-Query migration, optimistic updates, global rate limit, OAuth, Twilio, OCR, or account-deletion state machine entered V3.
- Record known limitation: concurrent authenticated mutation during deletion is not fully prevented.

### Release blockers

- Access-control or private-cache leak.
- Password-reset token replay/concurrent double success.
- Email enumeration through response contract.
- Old JWT remains valid after successful reset.
- Partial account deletion is committed after forced cascade failure.
- Required transaction silently falls back to non-atomic behavior.
- Build/check failure or fabricated evidence.
- Secret/token/API key committed or logged.

### Deliverable

`docs/v3-final-regression.md` with:

- commit/branch baseline;
- exact commands and results;
- manual browser/API evidence;
- PASS/FAIL/SKIPPED matrix;
- known limitations;
- blocker verdict: `READY` or `NOT READY`.

### Prompt body

```txt
Task: V3-18 — Perform the final V3 regression and release audit.
Do not implement missing features during the audit.
Run every safe available check, separate replica-set/mock/browser/remote-CI evidence, audit for secrets and scope drift, and write docs/v3-final-regression.md.
Return only READY or NOT READY with blockers and exact evidence.
```

---

## 6. Final Scope Guard

V3 explicitly does not include:

- Tailwind, MUI, CSS-in-JS, or animation libraries;
- auth state migration to TanStack Query;
- optimistic updates or reorder animation;
- refresh tokens, OAuth, Gmail inbox access, SMS/Twilio;
- global rate limiting beyond forgot-password;
- profile editing or settings beyond account deletion;
- deletion status/recovery state machine;
- OCR/vision or V4 work;
- product-market-fit or real-user growth work.

If a task appears to require one of these, stop and request a spec change instead of implementing it implicitly.
