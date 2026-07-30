# The pointer files

`docs/<library>-source-sync.md` is the review boundary: it is what makes the next round cheap, and
it is the only record of *why* a page says what it says. Treat it as a deliverable, not a bookmark.

## Canonical shape

Existing files vary slightly (some carry `## Status`, some `## Current source-backed claims`, some
inline the coupled-page list into the procedure). Keep a file's existing structure when updating it;
use this order for a new one:

```markdown
# <library> docs ↔ source sync pointer

<One paragraph: which docs tree this covers, that it is ported and cross-checked rather than
generated, and that the pointer below is the exact review boundary.>

## Status                      # optional — for trees whose coverage is partial
## Upstream source
- **Qualified name (mori):** `shinzui/<repo>` — resolve the on-disk path with
  `mori registry show shinzui/<repo> --full`.
- **Path at last sync:** `/absolute/path`      # a hint; mori is authoritative
- **Packages reviewed:** …                     # and what each one owns
- **Docs reviewed:** …                         # upstream prose that fed this round
- **Reviewed release:** `<package family> at <version>`

## Last reviewed commit

```text
<40-hex full sha>  (<short>)
<committer date, ISO 8601>
<commit subject>
```

> **Current range.** <what `<old>..<new>` covered, what it invalidated, which pages moved, what was
> deliberately not documented.>

> **Note (prior range).** <kept for as long as it is still useful context>

## Most-coupled pages           # the pages a source change is most likely to invalidate
## Previous pointers            # newest first, one entry per bumped round
## Update procedure             # the concrete commands, with the current SHA baked in
```

The **Update procedure** section embeds the current SHA in its example commands. Bump it too — a
stale command there silently re-reviews an old range.

## Writing the range summary

This is the part that pays off later. A good summary lets the next round skip re-deriving the story;
a bad one ("updated docs for recent changes") forces a full re-read of an already-reviewed range.

Include:

- **The themes**, not a commit list. Two or three named threads beat sixty bullet points.
- **Breaking changes**, called out as breaking, with the new shape.
- **New migrations/tables**, with the running counts.
- **Which pages were added, rewritten, or retired** — by path.
- **What was deliberately not documented**, and why (unshipped plan, untracked file, unreleased
  export).
- **Anything surprising about the upstream repo itself** — a dirty worktree, prose that diverges
  from source, a package that moved.

Demote the old note to `> **Note (prior range).**` and add a `Previous pointers` entry:

```markdown
- `<full sha>` (`<short>`, <date>, <release>) — the baseline before <round name>. The
  `<old>..<new>` range (<n> commits) landed <one-sentence summary>.
```

Prune prior-range notes once they no longer explain anything a current page says; the
`Previous pointers` list is the permanent trail and stays.

## Bump rules

1. **Bump only what you reviewed.** Never advance a pointer past commits you did not read.
2. **Bump even when the range was doc-neutral** — with a summary saying so. This is the whole point
   of the mechanism.
3. **Pin to a committed SHA.** If the upstream worktree is dirty, review the committed tree, pin
   there, and note the excluded uncommitted work.
4. **Full SHA in the block**, short SHA in prose and commands.
5. Use the committer date from `git -C "$REPO" show -s --format=%cI <sha>`, not today's date.
6. **One pointer per upstream repo**, even when several packages live in it — except where an
   adapter warrants its own boundary (see `shibuya-kiroku-adapter`, which pins `shinzui/kiroku`).
   Two pointers may share a repo; they then advance independently.
7. If a range's doc work is only partly done, **do not bump**. Record progress in the plan/commit
   message instead. A pointer means "everything up to here is reflected in the docs."

Useful commands:

```bash
REPO=$(mori registry show shinzui/keiro --full | sed -e $'s/\x1b\\[[0-9;]*m//g' -n 's/.*[Pp]ath: *//p' | head -1)
git -C "$REPO" log --oneline <pin>..HEAD
git -C "$REPO" diff --stat <pin>..HEAD
git -C "$REPO" log -1 --format='%H  (%h)%n%cI%n%s'      # the block to paste
git -C "$REPO" status --porcelain                        # dirty? note it
```

## Registering a new upstream

1. Confirm it is registered with mori: `mori registry list`, then
   `mori registry show <name> --full`. If it is not, the docs cannot track it reliably — register it
   upstream first.
2. Decide the docs home: its own tree under `content/docs/<library>/`, or a page under
   `content/docs/integrations/` if it only documents how two libraries compose.
3. Create `docs/<library>-source-sync.md` in the canonical shape above. The first **Last reviewed
   commit** is the SHA the initial authoring pass reviewed — with no `Previous pointers` section yet
   and a range summary that says "initial authoring baseline".
4. Add a row to `LIBRARIES.md`.
5. `status.mjs` picks it up automatically — it globs `docs/*source-sync.md` and parses the mori name
   and SHA. Confirm with `node agents/skills/doc-sync/status.mjs <library>`.
