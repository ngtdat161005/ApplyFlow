# ApplyFlow Agent Guide

## 1. Project State

ApplyFlow is a student portfolio project for tracking internship and job applications.

The repository has completed V2 and is entering V3.

- V1 defines the product and domain baseline.
- V2 defines the hardened current contracts and verified quality baseline.
- V3 is an incremental change set over the completed V2 repository.

V3 improves frontend server-state handling, account lifecycle security, and visual/UX quality. It is not a rewrite and is not a product-growth phase.

## 2. Current Stack

- Backend: Node.js, Express, MongoDB native driver, JWT, bcrypt.
- Frontend: React, Vite, React Router, plain CSS.
- Server-state addition owned by V3: `@tanstack/react-query`.
- Email provider owned by V3 password-reset work: Resend behind an adapter.
- UI frameworks: no Tailwind, MUI, CSS-in-JS system, or animation library.

Do not guess dependency or runtime versions. Inspect repository manifests, lockfiles, runtime configuration, and current official compatibility information when a task requires a version decision.

## 3. Source-of-Truth Order

For V3 work, read and apply sources in this order:

1. `AGENTS.md` — repository-wide operating rules.
2. `docs/v3-spec.md` — behavior explicitly added or changed by V3.
3. `docs/v3-tasks.md` — task scope, dependency order, branch/PR workflow, merge policy, and human-approval gates.
4. `docs/v2-spec.md` — all finalized V2 contracts not explicitly changed by V3.
5. `docs/v1-spec.md` — V1 product/domain baseline where V2/V3 are silent.
6. `docs/ApplyFlow Architecture.md` — existing architecture until an assigned V3 task intentionally updates it.
7. `docs/test-plan.md` and `docs/regression-checklist.md` — verification procedure and evidence classification.

`docs/v3-spec.md` is a delta specification. Silence in V3 does not authorize removing, renaming, or reinterpreting V1/V2 behavior.

If applicable sources materially conflict and this order does not resolve the conflict, stop and ask the user. Do not invent a compatibility rule merely to keep moving.

## 4. Required V3 Skill

For any V3 implementation, review, PR, merge, or multi-task orchestration request, read and follow:

```text
.codex/skills/applyflow-v3-executor/SKILL.md
```

The skill controls repeated execution procedure only. It does not override this file, `docs/v3-spec.md`, or `docs/v3-tasks.md`.

Do not use legacy V2 task-runner or QA-reviewer skills for V3 work.

## 5. Core Preservation Rules

Unless the assigned V3 task explicitly changes a contract, preserve:

- existing API base prefix and route paths;
- V2 request/response and shared error shapes;
- registration, login, `/auth/me`, logout, and protected-route behavior;
- user scoping and cross-user `404` privacy behavior;
- application CRUD, fields, statuses, search/filter/sort, and cascade behavior;
- event CRUD, fields, types, validation, ownership, and timeline ordering;
- dashboard and attention-flag contracts finalized by V2;
- existing MongoDB collection names;
- existing environment-variable names;
- existing loading, empty, filtered-empty, validation, error, not-found, and responsive behavior.

Do not perform unrelated refactors, broad formatting changes, architectural rewrites, or speculative cleanup.

## 6. Architecture Rules

Backend remains:

```text
Route → Middleware → Controller → Service → Repository → MongoDB
```

- Controllers handle HTTP concerns.
- Services handle business rules and orchestration.
- Repositories handle MongoDB access.
- MongoDB transaction/session mechanics must not leak into controllers.
- Do not introduce Mongoose, Prisma, microservices, generic CRUD base classes, or background-job infrastructure.

Frontend rules:

- Preserve existing page/feature/API separation.
- Keep HTTP construction in `src/api` modules.
- Keep Auth state in the existing Auth store/provider.
- TanStack Query is only for the V3 server-state domains named in the spec.
- Use plain CSS and the existing token system.
- Do not add optimistic updates or list-reordering animation.

## 7. Task and Branch Discipline

- Work on one V3 task at a time.
- Use the exact dependency order in `docs/v3-tasks.md`.
- Create each task branch from clean, current `main` after all prerequisites are merged.
- Branch format: `codex/v3-XX-short-name`.
- One task requires one focused branch, commit set, PR, evidence package, and merge decision.
- Do not combine multiple V3 tasks into one PR to keep a continuous run moving.
- Do not skip a blocked task and continue to a dependent task without explicit user approval changing the order.

Before editing:

1. inspect current branch and `git status`;
2. verify `main` is current with `origin/main`;
3. verify prerequisite task commits are present;
4. read the complete current task and referenced spec sections;
5. inspect the actual implementation and versions;
6. report and preserve unexplained user changes.

## 8. File and Dependency Ownership

- Do not edit `.env`, secret files, private credentials, or real provider configuration.
- Do not delete existing product data or run destructive database operations against non-disposable data.
- Do not rewrite `docs/v3-spec.md` or `docs/v3-tasks.md` during implementation.
- Focused test/checklist updates are allowed only when owned by the task.
- Architecture and README changes belong to V3-17.
- Final audit evidence belongs to V3-18.

Dependency exceptions:

- V3-03 owns installation/configuration of `@tanstack/react-query`.
- V3-09 may own narrowly justified Resend/rate-limit backend dependencies.
- All other dependency additions or material upgrades require an explicit task/spec change approved by the user.
- Every dependency change requires manifest and lockfile review plus an explanation in the PR.

## 9. Verification Integrity

Always distinguish:

- GitHub CI;
- local automated checks;
- HTTP E2E;
- browser/manual QA;
- real replica-set transaction tests;
- mocked transaction tests;
- source inspection.

`PASS`, `FAIL`, and `SKIPPED` are different outcomes.

- A build does not prove browser behavior.
- Source inspection does not prove runtime behavior.
- A mock does not prove a real MongoDB transaction.
- Console email transport does not prove Resend delivery.
- A Codex self-review is not independent human approval.
- Never infer or invent a result for a command that was not run.

Default existing checks:

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

Run additional task-specific checks from `docs/v3-tasks.md`. Environment-dependent checks must be run when their environment is available or reported as `SKIPPED` with the exact reason.

## 10. Secrets and Privacy

Never expose, commit, or include in normal evidence:

- `.env` contents;
- MongoDB connection strings;
- JWT secrets or live JWTs;
- Resend API keys;
- raw reset tokens;
- passwords;
- private user emails;
- private test-account credentials.

Use disposable accounts and sanitized identifiers. Inspect configuration keys and shapes without printing secret values.

If a possible secret exposure is found, stop the task chain, do not repeat the value, preserve evidence safely, and ask the user how to proceed.

## 11. Merge-and-Continue Policy

The V3 execution may proceed continuously:

```text
task → checks → self-audit → commit → push → PR → CI/review gate
→ merge when authorized → update main → next task
```

All ordinary merge gates in `docs/v3-tasks.md §3.7` remain mandatory.

The following tasks must never be auto-merged:

- V3-08;
- V3-09;
- V3-10;
- V3-12;
- V3-13;
- V3-18.

For these tasks, stop with the complete review packet required by `docs/v3-tasks.md` and request explicit approval for the exact current PR revision.

A general request to complete V3 is not advance approval. If a hard-gate PR receives a new commit or material change after approval, approval is invalidated and must be requested again.

Do not use human approval as a substitute for missing mandatory security evidence. If required evidence is unavailable, recommend `DO NOT MERGE`.

## 12. Stop-and-Ask Rule

Stop the entire task chain and ask the user when:

- source documents materially conflict;
- the repository invalidates a prerequisite assumption in a way that affects behavior, architecture, data, security, dependency choice, or task order;
- multiple reasonable options produce materially different public behavior, migration behavior, security, cost, or dependency footprint;
- implementation appears to require out-of-scope work, a new external service, broad refactor, destructive migration, or weakened V1/V2/V3 contract;
- required credentials, permission, provider configuration, database capability, or user-owned choice is missing;
- a security-critical test cannot run or produces ambiguous evidence;
- CI/review/merge conflict cannot be resolved within current scope;
- a merge gate cannot be classified confidently;
- a possible secret exposure or destructive operation is discovered.

When stopping:

1. stop before the unresolved choice affects commit, push, merge, or a later task;
2. preserve the branch/worktree without destructive cleanup;
3. state the exact blocker and evidence;
4. explain why the current sources do not decide it;
5. provide 2–3 concrete options and consequences;
6. recommend one option when justified;
7. ask one focused question and wait.

Do not ask about routine, reversible, behavior-preserving details such as a private helper name or equivalent local test-fixture structure. Decide those consistently with nearby code and report the choice.

## 13. Pull Request and Merge Rules

- Use the repository PR template.
- Link the exact V3 task.
- List changed files, behavior, commands/results, manual evidence, assumptions, skips, and risks.
- Wait for required GitHub checks and review state.
- Do not bypass branch protection or merge conflicts.
- Do not merge with requested changes unresolved.
- After merge, update local `main`, verify the merge commit, and confirm a clean worktree before the next branch.

For hard-gate tasks, include the review packet and wait for explicit user approval.

## 14. Required Final Report Format

```text
Task:
Branch:
Commit SHA:
PR:

Changed files:

Implemented behavior:

Preserved V1/V2 contracts:

Checks and evidence:
- GitHub CI:
- Local automated:
- HTTP E2E:
- Browser/manual:
- Replica-set transaction:
- Mock/source inspection:

PASS / FAIL / SKIPPED summary:

Unverified items:

Risks and known limitations:

Merge recommendation:

Human approval required: YES / NO
Merge result:

Next task or blocker:
```

If the task is not fully verified, state `Implemented, not fully verified`. Do not call it complete.