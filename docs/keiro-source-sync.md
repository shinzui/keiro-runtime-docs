# Keiro docs ↔ source sync pointer

The `content/docs/keiro/` tree is **ported and cross-checked** against the keiro source repo, not
generated from it. To keep updates efficient and predictable we pin the exact upstream commit the
docs were last reviewed against. When keiro changes, diff from the pinned commit to `HEAD`, update
the affected pages, then bump the pointer below.

## Upstream source

- **Qualified name (mori):** `shinzui/keiro` — resolve the on-disk path with
  `mori registry show shinzui/keiro --full` (prefer this over the hard-coded path, which can move).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiro`
- Relevant packages: `keiro` (framework library), `keiro-core` (pure core: `Codec`, `EventStream`,
  `Stream`, `Integration.Event`, `Snapshot.Policy`), `keiro-migrations` (the `keiro-migrate`
  executable and embedded schema), `keiro-test-support` (test fixtures); `jitsurei` (the runnable
  worked example).

## Last reviewed commit

```text
3f5dc9c1fa90f6358cebb9e85d92dde4c325db48  (3f5dc9c)
2026-05-31 17:46:39 -0700
keiro 0.1.0.0
```

### Previous pointers (for traceability)

- _(none yet — `3f5dc9c` is the baseline the keiro doc set was first authored against.)_

### Known upstream drift since this pin

The docs intentionally describe keiro **as released at `3f5dc9c` (0.1.0.0)**. keiro `master` has since
advanced; the following changes are **not** reflected in the docs and should be folded in **only when
they ship in a tagged release** (at which point bump the pin):

- **OpenTelemetry 1.40 upgrade (keiro `master`, ~`c519f2a`).** `Keiro.Telemetry` now links
  `hs-opentelemetry-semantic-conventions 1.40.0.0` and **imports** the `messaging.*` / `db.*`
  `AttributeKey`s from `OpenTelemetry.SemanticConventions` (re-exporting them), instead of **vendoring**
  them locally as it did at `0.1.0.0`. Wire-level attribute names are unchanged, so
  `reference/telemetry.mdx`'s **attribute table** stays correct; only its **"Vendored attribute keys"**
  section (the 0.1.0.0 vendoring rationale) will need rewording to "re-exported from
  semantic-conventions 1.40" when this releases. The bespoke `keiro_*` keys remain locally defined
  either way.
- **Docs-driven comment fix (keiro `94c85e2`).** The `Keiro.Command` Haddock now names the middle
  phase **"Transduce"** (was "Decide"), matching this doc set's Hydrate → Transduce → Append
  terminology. Comment-only; no pin bump needed.

## Update procedure

1. List what changed since the pointer:
   ```text
   KEIRO=$(mori registry show shinzui/keiro --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KEIRO" log --oneline 3f5dc9c..HEAD
   git -C "$KEIRO" diff --stat 3f5dc9c..HEAD
   ```
   keiro also keeps its own `docs/`, `CHANGELOG.md`, and `docs/plans|masterplans` entries — the
   prose diff there is the fastest way to understand intent before touching the source. Note that
   keiro's in-repo `docs/research/*` and `docs/plans/*` notes **predate the implementation and
   diverge from it** (renamed types, different SQL columns, unimplemented features); trust the
   shipped source over the notes.
2. Update the affected pages under `content/docs/keiro/`. The pages most coupled to the source
   surface (transcribe exact Haskell signatures, SQL column shapes, or option-record fields, so a
   source change is most likely to invalidate them) are:
   - **Reference pages** (verbatim signatures and SQL): `reference/command.mdx`,
     `reference/event-stream-and-stream.mdx`, `reference/codec.mdx`, `reference/router.mdx`,
     `reference/projection.mdx`, `reference/read-model.mdx`, `reference/snapshot.mdx`,
     `reference/process-manager.mdx`, `reference/timers.mdx`, `reference/integration-event.mdx`,
     `reference/inbox.mdx`, `reference/outbox.mdx`, `reference/telemetry.mdx`,
     `reference/migrations-and-schema.mdx`.
   - **Walkthroughs** (line-by-line tours of the real source): every chapter under
     `walkthrough/command-cycle/`, `walkthrough/read-side/`, `walkthrough/workflow/`, and
     `walkthrough/integration/`.
   - **Conceptual anchors**: `explanation/what-is-keiro.mdx`, `explanation/the-keiro-stack.mdx`,
     `explanation/the-jitsurei-example.mdx`, and `tutorials/getting-started.mdx`.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into
   **Previous pointers** with a one-line summary of what the range covered.
