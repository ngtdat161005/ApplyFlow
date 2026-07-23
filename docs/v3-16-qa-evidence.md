# V3-16 QA Expansion Evidence

## Run Metadata

| Field | Recorded value |
|---|---|
| Date/timezone | 2026-07-23, Asia/Saigon |
| Tester | Codex local checks and in-app browser automation |
| Branch | `codex/v3-16-qa-expansion` |
| Base commit | `003014c097cd38af0833cc84d24fefd2ddaccf02` (V3-15 merge) |
| Task revision | V3-16 pre-commit working tree; final commit and CI belong to the PR record |
| OS | Windows |
| Node.js/npm | `v20.20.2` / `10.8.2` |
| Browser | Codex in-app browser |
| Viewports | 1280x800 and 375x667 |
| Frontend origin | `http://127.0.0.1:5173` |
| Backend/database | Not started or inspected; no disposable-database confirmation was available |

No private account, real email, credential, access token, reset-link value, provider configuration,
or database connection string was used or recorded in this run.

## Automated Results

| Evidence class | Command | Result | Exit code | Concise evidence and limit |
|---|---|---|---:|---|
| Local automated | `cd backend; npm run check:attention` | PASS | 0 | Deterministic attention-domain assertions passed; no HTTP/browser proof. |
| Mock/source | `cd backend; npm run check:backend-hardening` | PASS | 0 | Forgot-password enumeration/replacement/rate limits/provider failure/safe logs; reset one-time orchestration and unavailable transactions; account password gate/cascade orchestration/unavailable transactions. These are not real MongoDB transaction results. |
| Syntax only | `cd backend; node --check scripts/check-backend-e2e.js` | PASS | 0 | Existing full E2E script parses; scenarios did not execute. |
| Syntax only | `cd backend; node --check scripts/check-v3-large-dataset.js` | PASS | 0 | New large-dataset helper parses; no HTTP/database proof. |
| HTTP/database | `cd backend; npm run check:e2e` | SKIPPED | — | The configured database was not explicitly confirmed disposable. Running could create/mutate test data, so the backend and `.env` were not used. |
| HTTP large dataset | `cd backend; npm run check:v3-large-dataset` | SKIPPED | 0 | Helper refused writes because `V3_QA_DISPOSABLE_CONFIRM=YES` was absent. A zero exit code with explicit `SKIPPED` is not PASS. |
| Logic/synthetic cache/source | `cd frontend; npm run check:v3-query-qa` | PASS | 0 | Canonical keys/retry rules, 30 varied in-memory records, prefix/exact invalidation, deleted detail/event clearing, mutation matrix, async states, skeleton semantics, and motion/touch guards passed in their named classes. |
| Build | `cd frontend; npm run build` | PASS | 0 | Vite 8.1.3 transformed 120 modules and produced a bundle; no runtime behavior is inferred. |
| Diff hygiene | `git diff --check` | PASS | 0 | No whitespace errors at the recorded pre-commit revision. |

The frontend build was rerun outside the filesystem sandbox after an initial sandbox-only `EPERM`
while Vite tried to write `frontend/node_modules/.vite-temp`. The rerun passed; the sandbox failure
is not a product failure.

## Browser Smoke Results

This was a focused public-route smoke, not a complete execution of
`frontend/docs/manual-v3-testcases.md`.

| Area | Result | Evidence observed |
|---|---|---|
| Forgot-password blank validation | PASS | Blank submit associated `Email is required.`, set `aria-invalid=true`, and focused the email field. |
| Forgot-password malformed email | PASS | Native email validity reported `typeMismatch=true`; the value stayed editable and focused. No request was submitted. |
| Reset link missing | PASS | Controlled invalid/expired alert rendered and received programmatic focus with `tabindex=-1`. |
| Reset blank fields | PASS | Both field errors and `aria-invalid=true` appeared; focus moved to the new-password field. No request was submitted. |
| Mobile login at 375x667 | PASS | No document overflow; form occupied the viewport width and the decorative preview was hidden. |
| Mobile reset at 375x667 | PASS | No document overflow; panel and both inputs stayed inside the viewport. |
| Desktop login at 1280x800 | PASS | No document overflow; form and presentation regions rendered; form itself had no transform. |
| Keyboard focus sample | PASS WITH LIMITATION | Tab moved from email to password and the password focus outline was visible. The automation did not complete a full-page keyboard sequence. |
| Protected settings route | PASS | Logged-out `/settings` resolved to `/login` and rendered no settings/delete-account content. |
| Browser console | PASS | Zero warning/error entries after the public-route smoke. |
| Fine-pointer parallax movement | BLOCKED | The automation pointer move did not dispatch an observable page `pointermove`; source guards passed separately, but runtime motion was not claimed. |
| Reduced motion and coarse/touch pointer | NOT RUN | The selected browser capability controlled viewport only and did not emulate media/input preferences. Source inspection is separate evidence. |
| Authenticated settings dialog | NOT RUN | No disposable account/backend was used; dialog focus, errors, and deletion states remain manual cases. |
| Skeleton/background refetch browser states | NOT RUN | No controlled authenticated API fixture was started. Logic/source evidence passed, but rendered timing/error states were not claimed. |

## Security and Transaction Classification

| Area | Mock/source | HTTP/database | Real replica set | Browser |
|---|---|---|---|---|
| Forgot password | PASS | SKIPPED | Not required for provider/rate-limit mock checks | Public validation PASS; live response SKIPPED |
| Reset password | PASS | SKIPPED | SKIPPED | Local validation/invalid-link PASS; live reset SKIPPED |
| Account deletion | PASS | SKIPPED | SKIPPED | Logged-out protection PASS; authenticated flow NOT RUN |

The existing E2E script contains explicit `hello.setName` and logical-session assertions before its
reset/delete transaction cases. Because that script was not run in this task revision, no current
real replica-set commit, rollback, concurrency, password update, old-JWT invalidation, cascade, or
cross-user result is claimed.

## Cleanup

- The large-dataset helper performed no writes because its disposable-data confirmation was absent.
- Browser forms were not submitted to the backend.
- The temporary frontend process was stopped, port 5173 was released, and both temporary log files
  were removed.
- The browser viewport override was reset and the QA tab was closed.
- No application, event, reset token, or user cleanup was required.

## PASS / FAIL / SKIPPED Summary

- PASS: backend attention, backend mock/source hardening, both backend syntax checks, frontend query
  QA, frontend build, diff hygiene, and the public browser observations listed above.
- FAIL: none.
- SKIPPED: live backend E2E, real replica-set evidence, and live 30-record HTTP E2E because the
  database was not explicitly confirmed disposable.
- BLOCKED/NOT RUN: fine-pointer motion automation, reduced-motion/coarse-pointer runtime,
  authenticated settings, and controlled skeleton/background-refetch browser states.

## Risks and Recommendation

The repeatable QA assets cover every required V3-16 area, but current runtime evidence remains
environment-limited. Before a release audit, run the live commands against an explicitly disposable
replica set and execute the V3 browser checklist with controlled authenticated fixtures. For this
QA/documentation task, the missing environment-dependent evidence is recorded rather than hidden or
misclassified.
