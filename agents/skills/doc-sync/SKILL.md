---
name: doc-sync
description: >
  Refresh this documentation set after an underlying library changes. Walks the tracked upstream
  repos (keiro, keiki, kiroku, shibuya + adapters, pgmq-hs, pg-migrate, keiro-runtime-jitsurei) from
  each one's pinned "last reviewed commit", classifies every upstream change into a documentation
  action — add a new page, update an existing one, retire a stale one, or explicitly no-op — applies
  the edits, runs the gates, and bumps the pointer so the next round only reads new commits.
  TRIGGER when: a framework/library under the docs changed, the docs need to catch up with source,
  the user asks what upstream drift is un-documented, or a new upstream library must be tracked.
argument-hint: <status|sync|register> [library …]
user-invocable: true
---

# Doc sync skill

`content/docs/` is **ported and cross-checked** against upstream Haskell source — it is not
generated from it. Correctness therefore depends entirely on a disciplined review boundary: for each
upstream repo, `docs/<library>-source-sync.md` pins the exact commit the docs were last reviewed
against. A round of work means: read the diff from that pin, decide what documentation each change
implies, do it, then move the pin.

Three modes:

| Mode | Ask | Do |
| --- | --- | --- |
| `status` | "what's un-documented?", "are the docs current?" | Phase 1 only, then report |
| `sync` | "update the docs for X", "catch the docs up" | All phases |
| `register` | "track library Y too" | `POINTER.md` → *Registering a new upstream* |

Companion files (read on demand, not up front):

- **`TRIAGE.md`** — the change → documentation-action matrix. The admission tests for adding a new
  guide / how-to / walkthrough chapter / cookbook recipe, the update ordering, and the retirement
  rules. **Read this before writing or deleting any page.**
- **`POINTER.md`** — the canonical pointer-file format, the bump procedure, and how to register a
  new upstream.
- **`LIBRARIES.md`** — the tracked-upstream registry: pointer file, docs tree, and per-library
  gotchas.
- **`status.mjs`** — mechanical staleness report across every pointer file.

## Phase 1 — Survey the drift

```bash
node agents/skills/doc-sync/status.mjs            # every tracked upstream
node agents/skills/doc-sync/status.mjs keiro keiki   # just these
```

For each library it prints the pinned SHA, upstream `HEAD`, commits behind, changed-file stats, and
whether the upstream worktree is dirty. It resolves paths through `mori registry show <name> --full`
and falls back to the pointer file's recorded path.

Then, per library with drift, read `LIBRARIES.md` for its gotchas and its pointer file's **Current
range** note — the previous round's summary tells you what was already folded in and what was
recorded as a known gap.

Stop here for `status`: report commits behind per library, plus a one-line guess at doc impact.
Do not bump anything.

## Phase 2 — Read intent before source

Cheapest-first, for the range `<pinned>..HEAD`:

1. **`docs/adr/*`** (keiro has ADRs 0001+) — rationale *and consequences*, faster than any plan.
2. **`CHANGELOG.md`** — the author's own view of what is user-visible and breaking.
3. **`docs/user/*`, `docs/guides/*`** — upstream prose the docs here mirror.
4. **`docs/plans/*`, `docs/masterplans/*`** — intent and scope only.
5. **The source diff** — the only authority.

Two hard rules:

- **Shipped source wins.** Upstream `docs/research/*` and `docs/plans/*` predate the implementation
  and diverge from it (renamed types, different SQL columns, unimplemented features). Never
  transcribe a signature from a plan.
- **Un-landed is not shipped.** A plan describing work not in the source, or an untracked/dirty file
  in the upstream worktree, must not be documented as a shipped API. Record it as an explicit gap in
  the pointer's range summary and move on.

## Phase 3 — Build the change ledger

Before editing anything, write a ledger to the scratchpad: one row per upstream change, with the
documentation action it implies. Classify each with **`TRIAGE.md`**.

```text
| upstream change | kind | action | target page(s) |
| `scheduleTimerOnceTx` now returns Bool | breaking-signature | UPDATE | reference/timers.mdx, walkthrough/durable-execution/04-*.mdx |
| `Keiro.ReplayAudit` (new module) | new-subsystem | ADD | reference/replay-audit.mdx + how-to/audit-real-logs-before-a-deploy.mdx + nav |
| `keiro_inbox_received_idx` dropped | schema | UPDATE | reference/migrations-and-schema.mdx |
| whole-tree format reflow | chore | NO-OP (doc-neutral) | — |
```

Every commit in the range must land in a row, including `NO-OP` rows — that is what makes the pointer
bump honest. Fold the ledger's shape into the range summary you write in Phase 6.

## Phase 4 — Apply the edits

Follow `TRIAGE.md`'s ordering (reference → explanation → how-to/tutorial → walkthrough → cookbook →
faq → index cards → `meta.json`) so downstream pages cite already-settled truth.

- New pages start from `content/docs/_templates/<type>.mdx`; match the diátaxis type, frontmatter
  shape, and voice of neighbouring pages.
- Every new page needs three wirings, all easy to forget: its directory's `meta.json`, the section
  index card (`<library>/<section>/index.mdx` or the section list), and at least one inbound
  cross-link from a related page.
- Transcribe signatures, record fields, SQL column shapes, and error constructors **verbatim** from
  source. Never paraphrase a type.
- When you retire something, follow `TRIAGE.md`'s deletion checklist — orphaned `meta.json` entries
  and dangling links both fail the gates.

## Phase 5 — Verify

```bash
node scripts/check-doc-links.mjs   # relative-link integrity
pnpm run lint:nav                  # meta.json ↔ filesystem
pnpm run typecheck
pnpm run build
```

Known gate gaps — cover these by hand:

- **`#anchors` are ungated.** `check-doc-links.mjs` strips them, and linkinator scans 0 links
  against a non-served `.output/public`. Verify every anchor against the real heading, remembering
  github-slugger gives each space its own hyphen (so an em dash in a heading yields a **double**
  hyphen).
- **Do not run `oxfmt --write` on `content/`.** It corrupts the hand-authored MDX; `content/` is
  excluded from the format gate deliberately.
- Grep for the old spelling after any rename — the gates cannot see a stale but well-formed claim.

## Phase 6 — Move the pointer

Only now, and only for libraries whose range you actually reviewed. Per `POINTER.md`: replace the
**Last reviewed commit** block with the new `HEAD` (full SHA, commit date, subject), demote the old
SHA into **Previous pointers** with a one-line range summary, and write the new **Current range**
note.

A library you reviewed and found doc-neutral still gets its pointer bumped, with the range summary
saying so. Skipping it means the next round re-reads those commits for nothing.

## Phase 7 — Report

State per library: commits reviewed, pages added / updated / retired, anything deliberately **not**
documented (and why), and any gate step that failed. Commit with a `docs:` conventional message on
the current branch — do not open a branch unless asked.
