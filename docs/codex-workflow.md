# Codex Workflow

This file routes Codex workflow instructions by ApplyFlow version. It preserves the historical path used by V2 documents without making V2 rules authoritative for V3.

## V3 Work

V3 work must follow:

- `AGENTS.md`;
- `docs/v3-spec.md`;
- `docs/v3-tasks.md`;
- the V3 merge-and-continue, human-approval hard-gate, evidence-classification, and stop-and-ask rules.

V1/V2 behavior remains preserved unless `docs/v3-spec.md` explicitly changes it. `docs/v3-tasks.md` owns V3 task order and merge policy.

## Historical V2 Work

Historical V2 work must follow:

- `docs/v2-spec.md`;
- `docs/v2-tasks.md`;
- the historical V2 task scope and QA-controlled branch workflow.

V2-only workflow rules do not override active V3 instructions.
