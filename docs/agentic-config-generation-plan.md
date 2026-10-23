# Plan: Agentic Form-Config Generation

**Status:** Draft / design
**Owner:** TBD
**Last updated:** 2026-06-12

## Goal

Build an agentic flow that takes **natural-language requirements** for a form and emits a **valid `FormConfig`** (the JSON consumed by `ConfigForm`). The agent should reliably produce configs that:

1. Parse against the library's TypeScript types.
2. Are *semantically* sound — visibility/validation constraints reference real fields, options exist where required, the dependency graph is acyclic.
3. Render without throwing in a headless `ConfigForm`.

This is the first "authoring" surface for the future workflow platform (visual builder, hosted forms). The same validators the agent uses are the library's own React-free core functions — that's why they were kept React-free.

---

## The output contract

The agent's deliverable is one `FormConfig` object (`src/types/config.types.ts`):

```ts
type FormConfig = {
  id: string;
  name: string;
  version: string;
  fields: Record<string, FieldConfig>;   // key IS the field name
  fieldsOrder: string[];
  layout?: { columns?: 1|2|3; sections?: SectionConfig[] };
};
```

Key facts the agent must internalize (put these in the system prompt):

- **`field.name` does not exist** — the *key* in `fields` is the field name. Constraints reference fields by that key.
- **10 field types:** `text, textarea, number, select, multi-select, radio, checkbox, date, file, hidden`.
- **Constraints** (`FieldConstraint`) are a recursive boolean tree: a leaf is `{ field, operator, value? , targetField? }`; branches are `{ $and: [...] }`, `{ $or: [...] }`, `{ $not: ... }`.
- **Operators:** `EQ, NEQ, GT, GTE, LT, LTE, INC, NINC, EMPTY, NOT_EMPTY`. `EMPTY`/`NOT_EMPTY` take no `value`. Comparison can target a literal `value` or another field via `targetField`.
- **Validation** (`ValidationConfig`) slots: `required, minLength, maxLength, min, max, pattern, custom[]`. Each `ValidationRule` is `{ key, value, message?, constraints? }` — and `constraints` makes the rule *conditional*.
- `select`/`radio`/`multi-select` require non-empty `options`.

Use `playground/configs/employee-onboarding.json` as the canonical worked example (conditional `contractEndDate`/`salary`/`hourlyRate` on `employmentType`) — ship it as a few-shot example.

---

## Architecture

Per the Claude API decision tree, this is a **workflow with tool use that we orchestrate** — *not* a Managed Agent. Reason: the validation/preview tools must run the library's own code, so we host the compute and control the loop. (A Managed Agent would require shipping the validator as a custom tool anyway, with no benefit here.)

```
requirements (NL)
      │
      ▼
┌─────────────────────────────────────────────┐
│  Generation agent (claude-opus-4-8)          │
│  system prompt (CACHED): schema + field/op   │
│  catalog + 2–3 few-shot configs              │
│                                              │
│  loop:                                       │
│    draft config                              │
│    → call validate_form_config (tool)        │
│    → call render_preview (tool, optional)    │
│    → fix errors                              │
│  until clean (bounded iterations)            │
│                                              │
│  → submit_form_config (final)                │
└─────────────────────────────────────────────┘
      │
      ▼
authoritative validation gate (same validator)
      │
      ▼
valid FormConfig  ─→  playground / builder / disk
```

### Tiering (scale effort to the ask)

- **Tier 1 — simple forms (flat, ≤ ~8 fields, no cross-field logic):** single structured-output call, then one validation pass. No loop needed.
- **Tier 2 — conditional forms (visibility/validation dependencies):** the full agentic loop below.
- **Tier 3 — multi-section / nested (children, sections, field-to-field comparisons):** loop + `render_preview` enabled + higher effort.

Start by classifying the request (cheap heuristic or a quick model call), then route.

---

## Tools

The agent's tools wrap the library's existing **pure core** (`src/core/*`) — no React, runs server-side:

### `validate_form_config(config)` → `{ valid, errors: [{ path, code, message }] }`

Layered checks (structural → semantic → graph):

1. **Structural** — top-level shape; every field has a valid `type`; option-bearing types have non-empty `options`; `ValidationRule.key` matches its slot (`minLength` slot has `key: "minLength"`); `layout.columns ∈ {1,2,3}`.
2. **Referential** — every `field`/`targetField` in any constraint (visibility, `disabled`, and `validations.*.constraints`) resolves to a key in `fields` (or the enclosing `children`). `fieldsOrder` is a complete permutation of `Object.keys(fields)` — no orphans, no missing. `layout.sections[].fields` reference real keys.
3. **Operator hygiene** — `EMPTY`/`NOT_EMPTY` carry no `value`; all others carry exactly one of `value` | `targetField`.
4. **Dependency graph** — build via `extractDependencies`, assert acyclic (reject self/circular visibility chains).
5. **Recursion** — re-run 1–4 inside every `children` subtree; check `childrenOrder` consistency.

Implement as a standalone function (it's also reusable as a library export and in the builder).

### `render_preview(config, sampleValues[])` → `{ ok, error?, visibleFieldsPerSample }`

Render `ConfigForm` headlessly (jsdom / RTL) with a mock `ComponentRegistry` covering all 10 types, across a few representative value sets, and assert no throw. Surfaces runtime issues a static validator misses (e.g., a constraint that references a field rendered conditionally). Optional for Tier 1.

> Give the agent `validate_form_config` as a tool it calls **itself** and instruct it to iterate until clean before submitting. Then run the **same validator** as an authoritative gate after `submit_form_config` — the agent's self-check is not trusted blindly.

---

## Why not just structured outputs?

`output_config.format` (json_schema) **cannot fully express this schema** — structured outputs don't support recursive schemas (`children: Record<string, FieldConfig>` and the `$and`/`$or`/`$not` constraint tree are both recursive) or numeric/length constraints. So:

- Use a Zod schema (`zodOutputFormat`) / `submit_form_config` tool with `strict: true` to lock down the **envelope** (`id`, `name`, `version`, `fieldsOrder`, the `fields` map shape, leaf field props).
- Accept the recursive `constraints`/`children` portions as loosely typed.
- Rely on `validate_form_config` for full correctness.

This hybrid — constrain what the schema *can* express, validate the rest in the loop — is the honest answer and avoids a false sense of guarantees.

---

## Claude API specifics

(Grounded in the current `claude-api` reference; TypeScript SDK since the lib is TS.)

- **Model:** `claude-opus-4-8` (1M context; $5 / $25 per MTok). Strong at decomposing requirements and getting constraint logic right. For Tier-1 trivial forms a cheaper tier is defensible, but default to Opus.
- **Thinking / effort:** `thinking: { type: "adaptive" }`; `output_config: { effort: "high" }` (use `"xhigh"` for Tier 3). Adaptive interleaves thinking between the validate→fix tool calls.
- **Prompt caching:** the system prompt (schema + field/operator catalog + few-shot configs) is the **stable prefix** — mark it with `cache_control` and keep the per-request **requirements** *after* it. The catalog+examples comfortably exceed Opus 4.8's 4096-token cache minimum. Do **not** interpolate timestamps/request IDs into the system prompt (silent cache invalidator).
- **Tool input parsing:** always `JSON.parse` tool inputs — never string-match the serialized form (4.x escaping varies).
- **max_tokens:** large forms can be big — default `~16000` non-streaming; **stream** (`.stream()` + `.finalMessage()`) for big multi-section configs.
- **Loop:** SDK tool runner (`client.beta.messages.toolRunner`) with `validate_form_config`/`render_preview` as `betaZodTool`s is the least-code path; drop to a manual loop only if you need a hard cap on repair iterations or human-in-the-loop approval.
- **Refusals:** check `stop_reason` before reading content (defensive; unlikely for this benign domain).

---

## Repo placement

- New package or dir, e.g. `agent/` (or a sibling `rhf-config-agent` package) — the library itself stays dependency-light; the Anthropic SDK is the agent's dep, not the library's.
- Validation tools **import `src/core/*` directly** (`evaluateConstraint`, `extractDependencies`, `buildValidationRules`) — this is the payoff of the React-free core.
- Wire the output straight into `playground/` so a generated config drops into the existing split-screen editor for human review.

---

## Milestones

1. **`validate_form_config` validator** (no LLM) + unit tests against the playground configs and deliberately-broken fixtures. *This is the foundation — build it first; it's independently useful in the builder.*
2. **Single-shot generator** (Tier 1) — structured-output envelope + validator gate. Measure pass rate on a small eval set of requirement→config pairs.
3. **Agentic loop** (Tier 2) — add `validate_form_config` as an agent tool + repair iterations + caching. Track repair-iterations-to-valid as the core metric.
4. **`render_preview`** + Tier 3 (sections, children, field-to-field).
5. **Eval harness** — a fixed set of requirement prompts with golden configs / rubric; gate changes on pass rate + mean repair iterations.

---

## Open decisions

- **Clarification step?** When requirements are ambiguous (unstated field types, validation thresholds), should the agent ask 1–2 questions first, or assume sensible defaults and annotate them? (Lean: assume + annotate for an API/batch flow; ask for an interactive flow.)
- **Output of rationale** alongside the config (why each constraint exists) — useful for the builder, costs tokens.
- **Determinism / regeneration** — same requirements should yield stable configs; pin via low-temperature-equivalent prompting (sampling params are removed on Opus 4.8 — steer via prompt) and a canonical field-ordering rule.

---

## Future-platform hooks

- The validator is a shared library export → powers live validation in the **visual builder**.
- The generator becomes the "describe your form" entry point that seeds the builder canvas.
- Wrapping the loop as a hosted endpoint is the first step toward **hosted/embeddable** form authoring.
