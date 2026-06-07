# Keiki docs ↔ source sync pointer

The `content/docs/keiki/` tree is **ported and cross-checked** against the keiki source repo, not
generated from it. To keep updates efficient and predictable we pin the exact upstream commit the
docs were last reviewed against. When keiki changes, diff from the pinned commit to `HEAD`, update
the affected pages, then bump the pointer below.

## Upstream source

- **Qualified name (mori):** `shinzui/keiki` — resolve the on-disk path with
  `mori registry show shinzui/keiki --full` (prefer this over the hard-coded path, which can move).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiki`
- Relevant packages:
  - `keiki` (`0.1.0.0`): the pure core library. Modules `Keiki.Core`, `Keiki.Builder`,
    `Keiki.Operators`, `Keiki.Generics` (+ `Keiki.Generics.TH`), `Keiki.Decider`, `Keiki.Acceptor`,
    `Keiki.Composition`, `Keiki.Profunctor`, `Keiki.Symbolic`, `Keiki.Shape`,
    `Keiki.Render.{Mermaid,Markdown,Inspector,Pretty,Validate}`, `Keiki.NoThunks`,
    `Keiki.Internal.Slots`.
  - `keiki-codec-json` (`0.1.0.0`): the sibling JSON codec package (RegFile + event JSON).
  - `jitsurei`: the runnable worked-example package, **inside the keiki repo** at
    `jitsurei/src/Jitsurei/*.hs` with specs under `jitsurei/test/Jitsurei/*Spec.hs`.
- keiki requires **GHC 9.12**; `nix develop` in the keiki repo provides ghc 9.12, cabal, and z3.

## Last reviewed commit

```text
344c4cadd55e0b997cc2c6ce0ab687851d66fa31  (344c4ca)
2026-06-06
keiki 0.1.0.0 (pre-Hackage), keiki-codec-json 0.1.0.0
```

> **Trust the source over the in-repo notes.** keiki's own `docs/research/*`, `docs/historical/*`,
> and `docs/plans/*` are design-time notes that **predate or diverge from** the shipped
> implementation. The canonical example: the `Keiki.Decider` record is now **five** fields with
> **two** state parameters (`decide`, `evolve`, `evolveStreaming`, `initialState`, `isTerminal`), not
> the four-field Chassaing record still quoted in the module's own haddock and the research notes.
> Other divergences: the formalism-choice note still describes a `toMultiDecider`/state-refinement
> path that the shipped `[OutTerm]` output-widening GSM + `InFlight` streaming replaced;
> `Keiki.Generics` exports more than its design note lists (`mkInCtor0`, `mkWireCtor0`,
> `RegFieldsOf`). Where a note disagrees with the source, the **source wins** — cross-check every
> Haskell name against the module headers and the test specs.

### Most-coupled pages (a source change most likely invalidates these)

The pages that transcribe exact Haskell signatures or read the real source line by line, so a keiki
source change is most likely to invalidate them:

- **The walkthrough chapters** under `content/docs/keiki/walkthrough/*/` (ordered, source-faithful
  tours of the real modules).
- **The signature-transcribing reference pages** under `content/docs/keiki/reference/`.
- The `explanation/data-carrying-alphabets.mdx` and `explanation/deriving-event-sourcing.mdx`
  theory essays (they name the concrete `Edge`/`SymTransducer`/`HsPred` surface and the key result).
- The **worked-example tutorials** — `tutorials/your-first-aggregate.mdx` (EmailDelivery),
  `tutorials/a-multi-command-lifecycle.mdx` (OrderCart), and
  `tutorials/a-loan-application-process-manager.mdx` (the LoanApplication → Loan → CoreBankingSync →
  LoanWorkflow capstone; quotes the `loanWorkflow` composition verbatim).
- The **cookbook recipes** under `content/docs/keiki/cookbook/` — each quotes a `jitsurei` snippet
  verbatim (e.g. `itemCount` tally, `approvalGuard`, `checkHiddenInputs`, the `loanWorkflow` chain).
- The **FAQ** `content/docs/keiki/faq.mdx` (names the `stepEither`/`StepFailure`, `warnOpaqueGuards`,
  and `lmapMaybeCi` surfaces).

> Reviewed by EP-26 finalization (2026-06-06): this list now covers every Phase-2 page plus the
> Phase-3 cookbook/tutorials/FAQ.

### Previous pointers (for traceability)

- (none yet — `344c4ca` is the first reviewed commit for the keiki doc set.)

## Update procedure

1. List what changed since the pointer:
   ```text
   KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KEIKI" log --oneline 344c4ca..HEAD
   git -C "$KEIKI" diff --stat 344c4ca..HEAD
   ```
   keiki also keeps its own `docs/`, `CHANGELOG.md`, and `docs/plans|masterplans` entries — but those
   in-repo notes diverge from the shipped code (see the warning above). Trust the shipped source.
2. Update the affected pages under `content/docs/keiki/` (the most-coupled pages above are the first
   to check).
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old SHA into
   **Previous pointers** with a one-line summary of what the range covered.
