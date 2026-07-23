# ApplyFlow V3 Final Regression and Release Audit

## 1. Audit Metadata

| Field | Value |
| --- | --- |
| Task | V3-18 - Final V3 Regression and Release Audit |
| Audit date | 2026-07-23 (Asia/Saigon) |
| Baseline branch | `main` / `origin/main` |
| Baseline SHA | `9187f79995e03ac4641a335df2438336ef9fb928` |
| Audit branch | `codex/v3-18-final-audit` |
| Evidence revision before this document | `9187f79995e03ac4641a335df2438336ef9fb928` |
| Final audit-document revision | Recorded in the V3-18 hard-gate PR packet because a commit cannot contain its own SHA |
| Runtime | Node.js `v20.20.2`; npm `10.8.2`; Windows/PowerShell |
| Repository state at branch creation | Local `main` and `origin/main` matched; worktree clean |

This audit is documentation-only. It does not change product source, dependencies, lockfiles, README, architecture, environment files, or historical V2/V3-16 evidence.

## 2. Final Verdict

**Canonical blocker verdict: `NOT READY`**

**Merge recommendation: `DO NOT MERGE`**

The configured database was not explicitly confirmed as disposable. The root `.env` file was detected by presence only and was not read. Consequently, current write-through HTTP E2E, current real replica-set reset/deletion evidence, current authenticated browser/private-cache evidence, and current live 30-record evidence were mandatory `SKIPPED` outcomes. V3-18 treats a skipped hard-gate security check as a release blocker.

## 3. Baseline and V3 Task History

Local `main` and `origin/main` both resolved to the baseline SHA above. The branch was created directly from that clean revision. First-parent history contains V3-01 through V3-17 in order:

| Task | Merge PR | Merge commit |
| --- | ---: | --- |
| V3-01 | #37 | `da77120e29c9c9d750f5ec2cee3b9d681b194eb1` |
| V3-02 | #38 | `63256e2f2b430ec64742d7020f56c8df91bf1425` |
| V3-03 | #39 | `11c0d4afe1d581713b99eb39ddd4b37706e72f72` |
| V3-04 | #40 | `425582474a4290516397524582e250f4ef40223f` |
| V3-05 | #41 | `4cefa7d76e0160692d342089748aa467ae9b1fd6` |
| V3-06 | #42 | `8ad20369376bc1cb88fe31fe6ac4245149a8fd21` |
| V3-07 | #44 | `c1f317f19eae7ceecd59b86f43115f11dac2d67e` |
| V3-08 | #45 | `d49bd4cc34ed19bf23a86f3a440777fdfa735819` |
| V3-09 | #46 | `f917773092ccb706ecbbd3d477dd343df156e545` |
| V3-10 | #47 | `4e1792f2f104dbafc7d801e98900dd3b03b059cf` |
| V3-11 | #48 | `c27fb8620aa5180aaa67d5c1c30e0749fa7a12c8` |
| V3-12 | #49 | `50e2767482add77af395c23b025d5a11429b686c` |
| V3-13 | #50 | `8c0e95abe62e9d21802ecf2b22af1324c69a13f8` |
| V3-14 | #51 | `42b2f7c171f2736ed2c137137ef7d02e1c4a553e` |
| V3-15 | #52 | `003014c097cd38af0833cc84d24fefd2ddaccf02` |
| V3-16 | #53 | `b1ee2142fee4be31afd8883beeeef65a1712f55c` |
| V3-17 | #54 | `9187f79995e03ac4641a335df2438336ef9fb928` |

PR bodies for hard-gate tasks V3-08, V3-09, V3-10, V3-12, and V3-13 contain their evidence packets. GitHub returned no review or comment records for those PRs, so approval for each exact revision could not be independently confirmed from GitHub. This is an audit evidence gap; it is not evidence that approval did not occur in another system.

The preserved user stash remains `stash@{0}: On codex/v3-13-delete-account-ui: preserve user sequence diagram before V3-14`. Local excludes still keep `/.agents/` and `/skills-lock.json` outside repository changes.

## 4. Environment and Evidence Classification

| Evidence class | Available now | Classification |
| --- | --- | --- |
| GitHub CI | Baseline `main` run at the exact source SHA | `PASS` |
| Local automated checks | Clean installs, source/mock checks, query QA, production build | `PASS`, except the separately reported low-severity dependency audit |
| HTTP E2E | No explicitly disposable configured database | `SKIPPED` |
| Browser/manual | Public frontend-only smoke at desktop/mobile; no authenticated fixtures | Public subset `PASS`; authenticated matrix `SKIPPED` |
| Real replica-set transaction | No explicitly disposable transaction-capable database | `SKIPPED` |
| Mock/source inspection | Backend hardening and query QA scripts plus focused source review | `PASS` for what those checks assert |
| Real Resend delivery | No provider delivery test | `SKIPPED` (non-blocking integration limitation) |

The root `.env` file exists, but the audit did not read it or print any value. No `V3_QA_DISPOSABLE_CONFIRM` confirmation was present. Fixture count for all write-through tests was therefore zero, and no database cleanup was required.

## 5. Dependency and Scope Audit

Clean install retained both lockfiles byte-for-byte from Git. Current installed direct dependencies include backend Express `4.22.2`, MongoDB driver `6.21.0`, bcrypt `6.0.0`, jsonwebtoken `9.0.3`, and Resend `6.17.2`; frontend React `19.2.7`, React Router `7.18.1`, TanStack Query `5.101.2`, and Vite `8.1.3`.

The V2-to-V3 manifest delta adds only the task-owned runtime dependencies: `@tanstack/react-query` and `resend`. No Tailwind, MUI, CSS-in-JS system, animation library, OAuth, refresh-token subsystem, OCR/vision feature, SMS provider, or background-job infrastructure was found. Forgot-password rate limiting remains scoped to that public endpoint. The API prefix, MongoDB collection names, environment-variable names, and route/service/repository layering remain intact by source inspection and the current safe checks.

`npm audit --omit=dev --json` in `backend` returned exit code 1 for one low-severity transitive `body-parser` advisory affecting the installed dependency graph; a fix is reported as available. V3-18 did not run an audit fix or alter a manifest/lockfile. Frontend clean install reported zero vulnerabilities. This low-severity advisory is a dependency risk requiring a separately authorized remediation or acceptance decision; it is not represented as a product-runtime exploit test.

## 6. Automated Checks

| Exact command | Exit/result | Evidence class | Proves | Does not prove |
| --- | --- | --- | --- | --- |
| `cd backend; npm ci` | `PASS` (exit 0) | Clean install | Backend lockfile resolves cleanly | Runtime/API behavior |
| `cd frontend; npm ci` | `PASS` (exit 0) | Clean install | Frontend lockfile resolves cleanly | Browser behavior |
| `cd backend; npm run check:attention` | `PASS` | Local automated | Existing attention-domain assertions | Live MongoDB or HTTP behavior |
| `cd backend; npm run check:backend-hardening` | `PASS` | Mock/source inspection | Hardening assertions for token versions, reset, deletion, rollback/error handling | Real replica-set atomicity or concurrency |
| `cd backend; node --check scripts/check-backend-e2e.js` | `PASS` | Syntax | HTTP E2E helper parses | That the E2E scenarios ran |
| `cd backend; node --check scripts/check-v3-large-dataset.js` | `PASS` | Syntax | Large-dataset helper parses | Live dataset behavior |
| `cd backend; npm run check:v3-large-dataset` with disposable confirmation unset | `SKIPPED` by guard, exit 0 | Safety gate | Helper refuses unsafe writes | Any 30-record runtime acceptance criterion |
| `cd frontend; npm run check:v3-query-qa` | `PASS` | Local automated/source | Query key/invalidation/cache source assertions and synthetic 30-item cache assertions | Authenticated browser cache/Back behavior |
| `cd frontend; npm run build` | `PASS` | Local automated | Vite production bundle compiles | API, responsive, accessibility, or transaction behavior |
| `cd backend; npm audit --omit=dev --json` | `FAIL` (exit 1; one low advisory) | Dependency audit | Installed backend graph has the reported advisory | Exploitability in ApplyFlow or runtime failure |

The production build emitted no source maps. The dependency installs produced no manifest or lockfile diff.

## 7. GitHub CI

Baseline workflow run: [CI run 29972922489](https://github.com/ngtdat161005/ApplyFlow/actions/runs/29972922489), event `push`, exact SHA `9187f79995e03ac4641a335df2438336ef9fb928`, completed successfully on 2026-07-23.

| Job | Result | Included checks |
| --- | --- | --- |
| Backend checks | `PASS` | Node 22, `npm ci`, `check:attention`, `check:backend-hardening` |
| Frontend build | `PASS` | Node 20, `npm ci`, production build |

This CI proves the repository-defined jobs passed on the exact source baseline. It does not run HTTP E2E, real MongoDB transactions, authenticated browser QA, the V3 query QA script, large-dataset HTTP QA, real Resend delivery, or the dependency audit. The V3-18 PR's exact current-revision CI is recorded in the hard-gate review packet after the audit document is committed and pushed; it cannot be pre-recorded in the commit that triggers that run.

## 8. Backend HTTP E2E

**Result: `SKIPPED`.**

The audit detected a root environment file by presence only, but found no explicit disposable-database confirmation. It therefore did not start the backend or run `npm run check:e2e`. No registrations, reset requests, application/event fixtures, deletions, or cleanup writes were attempted.

Syntax inspection and source review show the E2E helper contains disposable-user/application cleanup, reset-token cleanup, real replica-set capability assertions, reset replay/concurrency assertions, old-JWT invalidation, deletion cascade, forced rollback, and unsupported-transaction checks. This source evidence does not replace a current HTTP execution.

## 9. Real Replica-Set Transaction Evidence

**Result: `SKIPPED` - mandatory release blocker.**

No current environment was both explicitly disposable and confirmed to expose replica-set/session capability. Therefore none of the following received current real-database evidence:

- reset-token consume plus password/token-version update atomicity;
- replay rejection after a successful reset;
- exactly one success from concurrent reset submissions;
- invalidation of a JWT issued before reset;
- account/application/event/reset-token deletion cascade;
- forced mid-cascade rollback without partial deletion;
- controlled failure on unsupported transaction infrastructure.

Historical V3-10 and V3-12 PR evidence describes prior real replica-set runs, but V3-18 requires a current rerun and does not reclassify historical evidence as current. Fixture count and cleanup are both zero for this audit.

## 10. Password Reset and Session Invalidation

`npm run check:backend-hardening` currently passes mock/source assertions covering public response normalization, validation, provider failure handling, token hashing/replacement, reset expiry/use rules, token-version changes, and controlled transaction failure. The E2E helper contains live assertions for email/IP rate limits, enumeration resistance, reset replay, concurrent consume, and old-JWT invalidation.

Current public browser smoke passed for the forgot-password required-field state, missing reset-token error state, and reset form required-field states. No provider request or database write was submitted. Real Resend delivery, live rate limiting, live enumeration equivalence, reset success, replay, concurrency, and old-JWT invalidation remain `SKIPPED`.

## 11. Account Deletion and Rollback

`npm run check:backend-hardening` passes current mock/source assertions for password verification, cross-user scoping, transaction/session propagation, cascade ordering, rollback/error behavior, and controlled unsupported-transaction handling. The real account-deletion HTTP/replica-set matrix was not run, so wrong-password preservation, successful cascade, cross-user isolation, forced rollback, old-session invalidation, and unsupported-environment behavior are `SKIPPED` at the required runtime evidence class.

Known accepted limitation, not misrepresented as resolved: **A separately authenticated concurrent mutation during account deletion is not fully prevented.**

## 12. Query and Private-Cache Lifecycle

`npm run check:v3-query-qa` passes current source and synthetic-cache assertions. Focused inspection confirms a single `QueryClientProvider`, Auth nested under that provider, server-state query ownership for the V3 application/detail/event/dashboard domains, invalidation/removal after relevant mutations, and `queryClient.clear()` on logout, unauthorized invalidation, and successful account deletion.

**Authenticated private-cache result: `SKIPPED` - mandatory release blocker.** No disposable authenticated fixture was created, so this audit cannot prove in a real browser that logout, a 401, or account deletion removes private cached content, nor that Browser Back cannot reveal it afterward. Source inspection and synthetic QueryClient assertions do not replace that runtime evidence.

## 13. Browser and Accessibility Regression

Browser: Codex in-app browser, frontend-only Vite server, no backend. Desktop viewport was `1280x800`; mobile viewport was `375x667`. Fixture count was zero.

Public evidence currently `PASS`:

- desktop login renders a coherent two-column layout with no horizontal/vertical overflow at the tested viewport;
- the sample-data preview is clearly labeled and visually separated;
- keyboard focus on the email field shows a 2px blue outline;
- forgot-password blank submission focuses the invalid email field and exposes its error through `aria-invalid`;
- missing reset token renders an active alert and a recovery link;
- reset form blank submission marks both password fields invalid and shows specific messages;
- mobile login hides the decorative preview and has no horizontal overflow;
- mobile reset form has no horizontal overflow;
- a logged-out visit to `/settings` renders the Login region;
- no browser console warning/error was captured during this public route set.

The full authenticated matrix is `SKIPPED`: login/restore/logout with disposable credentials; application CRUD/search/filter/sort; dashboard transitions; event CRUD/timeline ordering; account deletion; cache/Back behavior; loading skeleton timing; repeated async action blocking; and real responsive authenticated layouts. Reduced-motion emulation and coarse-pointer/touch emulation were unavailable in the active browser capability set and are `SKIPPED`.

The document title was empty on tested public routes. This is recorded as a non-blocking metadata/accessibility limitation rather than silently treated as verified. The design assessment used only relevant visual, responsive, focus, and interaction guardrails; no redesign or site-generation tool was used.

## 14. Large-Dataset Regression

The live 30-record HTTP scenario is **`SKIPPED`** because disposable database confirmation was absent. The guarded command exited safely without writes and explicitly reported its skip. Fixture count: 0; cleanup: not applicable.

The frontend query QA's synthetic 30-item cache assertions passed, but that evidence proves only query/cache logic under its isolated harness. It does not prove live HTTP pagination/search/filter/sort, DOM rendering, responsive layout, or browser interaction with 30 persisted records.

## 15. Secret and Privacy Audit

Current tracked files and the 41-commit patch history from `v2.0.0..HEAD` were scanned without printing candidate values. Results:

- only `.env.example` has an environment-style tracked filename;
- no real `.env`, log file, private key, or source map is tracked;
- all detected MongoDB references are loopback fixtures/placeholders without embedded credentials;
- no live-shaped Resend key or JWT was found;
- no private email domain was found; detected addresses use reserved test/example domains;
- no private absolute user path was found;
- the root and backend `.env` locations are ignored;
- temporary browser logs were scanned for live-shaped secret patterns and removed after the frontend audit;
- no raw reset token, password, private account value, or provider credential is included in this document.

This pattern/source audit reduces accidental exposure risk but cannot prove that untracked local files, external systems, deleted history before V2, or runtime provider logs contain no secrets.

## 16. PASS / FAIL / SKIPPED Matrix

| Area | Result | Evidence class | Release impact |
| --- | --- | --- | --- |
| Clean backend/frontend installs | `PASS` | Local automated | Lockfiles resolve |
| Backend attention check | `PASS` | Local automated | Required safe check passes |
| Backend hardening check | `PASS` | Mock/source | Safe hardening assertions pass |
| Frontend query QA | `PASS` | Local automated/source/synthetic cache | Query harness passes |
| Frontend production build | `PASS` | Local automated | Required build passes |
| Baseline GitHub CI | `PASS` | GitHub CI | Repository jobs pass at baseline SHA |
| Public desktop/mobile browser subset | `PASS` | Browser/manual | Tested public states pass |
| Current/history secret-pattern audit | `PASS` | Source/history inspection | No disallowed candidate found in scanned range |
| Backend dependency audit | `FAIL` | Dependency audit | One low-severity transitive advisory; no lockfile mutation |
| Backend HTTP E2E | `SKIPPED` | HTTP E2E | Release blocker |
| Real reset transaction/concurrency/JWT invalidation | `SKIPPED` | Real replica set | Mandatory release blocker |
| Real deletion cascade/rollback/unsupported transaction | `SKIPPED` | Real replica set | Mandatory release blocker |
| Authenticated browser/private cache/Back | `SKIPPED` | Browser/manual | Mandatory release blocker |
| Live 30-record regression | `SKIPPED` | HTTP/browser | Required runtime coverage unavailable |
| Reduced motion/coarse pointer | `SKIPPED` | Browser/manual | Unverified accessibility/interaction matrix |
| Real Resend delivery | `SKIPPED` | External integration | Non-blocking deployment limitation |
| Historical hard-gate approval artifacts | `SKIPPED` / unavailable on GitHub | Governance audit | Approval cannot be independently confirmed from GitHub |

## 17. Known Limitations

- A separately authenticated concurrent mutation during account deletion is not fully prevented.
- Real Resend delivery is unverified; console/source behavior does not prove provider delivery.
- Public-route document titles are empty in the tested browser session.
- The repository CI does not run HTTP E2E, transaction, query QA, browser, large-dataset, or dependency-audit jobs.
- Historical hard-gate approval may exist outside GitHub, but no GitHub review/comment artifact was available to this audit.
- A low-severity transitive backend dependency advisory remains unresolved.

## 18. Release Blockers

1. No current real disposable replica-set evidence for reset atomicity, replay, concurrency, old-JWT invalidation, deletion cascade, forced rollback, and controlled unsupported-transaction behavior.
2. No current authenticated browser evidence for logout/401/deletion private-cache clearing and Browser Back safety.
3. Current write-through backend HTTP E2E and live 30-record regression were not run because the configured database was not explicitly disposable.
4. Exact-revision approvals for prior hard-gate PRs could not be independently confirmed from the available GitHub review/comment history.

The dependency advisory and empty document title remain explicit risks/limitations. They are not used to conceal or downgrade the mandatory security-evidence blockers above.

## 19. Merge Recommendation

**`DO NOT MERGE`**

Do not merge the V3-18 PR and do not enable auto-merge. The recommended blocker-resolution path is to provide or explicitly confirm a disposable, transaction-capable MongoDB replica-set test environment outside committed files and normal evidence; rerun current HTTP/transaction/large-dataset checks; run the authenticated browser/private-cache matrix with disposable accounts; and attach any authoritative prior hard-gate approval records that exist. Dependency remediation, if chosen, must occur in a separately authorized task because V3-18 cannot change dependencies or lockfiles.

## 20. Final Conclusion

V3-18 is **implemented, not fully verified**. The clean build, repository-defined checks, query QA, baseline CI, source/history privacy audit, and public browser subset provide useful current evidence, but they cannot substitute for the mandatory real replica-set and authenticated private-cache evidence. The exact final audit verdict is **`NOT READY`**, and the exact merge recommendation is **`DO NOT MERGE`**.
