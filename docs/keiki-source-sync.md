# Keiki docs ↔ source sync pointer

The `content/docs/keiki/` tree is ported and cross-checked against committed
Keiki source, not generated from it. This file pins the exact upstream commit
reviewed by the documentation.

## Upstream source

- **Qualified name (mori):** `shinzui/keiki`; resolve it with
  `mori registry show shinzui/keiki --full`.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiki`.
- **Reviewed releases:** `keiki 0.2.0.0` and `keiki-codec-json 0.2.0.0`.
- **Primary modules:** `Keiki.Core`, `Keiki.Builder`, `Keiki.Operators`,
  `Keiki.Acceptor`, `Keiki.Generics`, `Keiki.Generics.TH`, `Keiki.Composition`,
  `Keiki.Profunctor`, `Keiki.Symbolic`, `Keiki.Shape`, `Keiki.Validate`, and the
  render and JSON-codec modules.

## Last reviewed commit

```text
ce5748b5f2311de1355e648db564da8b404e42f2  (ce5748b)
2026-07-13T10:25:54-07:00
docs: update roadmap for 0.2 release
```

The `344c4ca..ce5748b` review covered the 0.2 release: removal of the Decider
facade, structured command and replay failures, explicit builder output intent,
located construction errors, stricter replay validation, checked composition,
exact symbolic models, pinned shape identities, snapshot compatibility, and
versioned JSON event envelopes. The source tree was clean at the reviewed SHA.

## Most-coupled pages

- Exact signatures under `content/docs/keiki/reference/`.
- Source tours under `content/docs/keiki/walkthrough/`.
- Persistence and upgrade pages for snapshots, shape hashes, and JSON codecs.
- Composition, validation, and solver explanations and recipes.

## Previous pointers

- `344c4cadd55e0b997cc2c6ce0ab687851d66fa31` (`344c4ca`), 2026-06-06 —
  Keiki 0.1 baseline before the 0.2 correctness, composition, persistence, and
  codec review.

## Update procedure

1. Resolve the source with mori and inspect committed drift:
   ```text
   KEIKI=$(mori registry show shinzui/keiki --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KEIKI" log --oneline ce5748b..HEAD
   git -C "$KEIKI" diff --stat ce5748b..HEAD
   ```
2. Read changed source, tests, changelogs, and release notes. Treat historical
   design notes as context only when they disagree with shipped modules.
3. Update affected pages, replace the reviewed SHA above, and move the prior
   pointer into the traceability list.
