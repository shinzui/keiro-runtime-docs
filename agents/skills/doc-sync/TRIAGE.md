# Triage: upstream change → documentation action

Every upstream change gets exactly one of four actions: **ADD** a page, **UPDATE** existing pages,
**RETIRE** a page, or **NO-OP** with a stated reason. Default to UPDATE — the doc set is mature, and
most source changes belong in a page that already exists. A new page is a claim that no existing page
is the right home, and every extra page costs navigation weight, cross-link maintenance, and a future
review.

## 1. The classification matrix

| Kind of upstream change | Action | Where it lands |
| --- | --- | --- |
| **New package / subsystem** (new library, new `Keiro.X` family with its own concepts) | ADD a doc area | explanation + reference + tutorial + 2–4 how-tos + ≥1 cookbook recipe + faq entries + `getting-started/the-keiro-family` and `choosing-a-library` + nav + index cards |
| **New API on an existing subsystem** (function, type, option field) | UPDATE reference; ADD only if it passes §2 | `reference/<subsystem>.mdx`; a how-to only if there's a task with a decision in it |
| **Changed signature / record field / SQL column** (breaking or not) | UPDATE | reference verbatim, **every** walkthrough chapter touring that source, plus any tutorial/how-to/cookbook snippet that would no longer compile |
| **Behaviour change, same API** (ordering, retry, dedupe, defaults) | UPDATE | reference note or callout + the explanation page owning the *why* + walkthrough narration |
| **New failure mode, gate, or operational rule** | ADD a how-to (runbook-shaped) + UPDATE | how-to with a verifiable end state; reference entry for the error/exit code; faq entry |
| **New invariant or rule authors must respect** | UPDATE explanation, or ADD one if genuinely new | explanation page; cross-link from every reference page the rule constrains |
| **Rename / convention change** (no API change) | UPDATE everywhere | grep the old spelling across `content/docs/`; fix all hits; faq entry if the old spelling was documented |
| **New migration / table / index** | UPDATE | `reference/migrations-and-schema.mdx` (file **and** table counts), `reference/deploy-ordering.mdx` |
| **New telemetry instrument** | UPDATE | `reference/telemetry.mdx` |
| **Deprecated API** | UPDATE with a deprecation callout | keep the page; name the replacement and the version |
| **Removed API** | RETIRE per §4 | |
| **Dependency bump** | UPDATE only if it changes a documented constraint | `getting-started/compatibility-and-upgrades.mdx`, the pointer's *Reviewed release* line |
| **Chore / format / refactor with byte-identical public surface** | NO-OP | record as reviewed in the range summary |
| **Upstream doc/plan/research-only commit** | NO-OP | if it describes unshipped work, record it as an explicit gap |
| **Test-only change** | NO-OP, unless it reveals a documented behaviour was wrong | |

Verify "byte-identical public surface" rather than assuming it: diff the library source subtree
alone (e.g. `git diff --stat <pin>..HEAD -- keiro/src keiro-core/src`). A range whose diff is all
`docs/` and a new package is an *additive* round that invalidates nothing — that conclusion is worth
the thirty seconds it takes to establish, because it collapses the work.

## 2. Admission tests for a new page

Apply the test for the type. If it fails, the content belongs inside an existing page.

- **Reference page** — a new named module or type family with a public surface a reader must look up
  field by field. One page per subsystem. A handful of new functions on an existing subsystem is a
  new *section*, not a new page.
- **How-to** — there is a real task a user arrives with, it has a verifiable end state, and it
  requires **at least one decision the reference alone does not settle** (which policy, which order,
  what to do when it fails). Steps-only-restating-the-reference is a reference example.
- **Tutorial** — only for a new subsystem someone must learn from zero. **At most one per
  subsystem**; it must run end to end for a reader who has done `getting-started` and nothing else.
- **Explanation** — there is a *why* that is non-obvious and load-bearing: a tradeoff, an invariant, a
  rejected alternative. If the concept already has a page, extend it; two explanation pages on one
  concept is the failure mode here.
- **Cookbook recipe** — a composition of **≥2 subsystems**, or a pattern with a real-world caveat
  (something the obvious reading gets wrong). Single-subsystem tasks are how-tos.
- **Walkthrough chapter** — new *source* that a reader must be walked through line by line, and it
  fits an existing tour arc (`command-cycle`, `read-side`, `workflow`, `durable-execution`,
  `scaling`, `operations`, `integration`, `foundation`). Prefer extending the chapter that already
  tours that file. A new arc needs its own hub entry and ordering.
- **FAQ entry** — a question a user would actually type, answerable in under a screen, that then
  links to the canonical page. The FAQ is a routing table, not a second reference.
- **Integration page** (`content/docs/integrations/`) — the change is about how **two** libraries
  compose, not about either one alone.

When a change is genuinely new but small, the honest answer is usually: one reference section, one
faq entry, one cross-link.

## 3. Updating existing pages

**Order matters** — go reference → explanation → how-to/tutorial → walkthrough → cookbook → faq →
section index cards → `meta.json`. Later pages quote earlier ones, so settling the reference first
prevents re-editing.

- **Surgical edit vs rewrite:** if more than roughly half a page's claims are now false, rewrite the
  page from the template. Otherwise edit in place — churn in a page's untouched prose makes the diff
  unreviewable and loses hard-won wording.
- **Follow the source, not the page's own history.** If a page's snippet was already subtly wrong,
  fix it in this round and say so.
- **Walkthroughs are the highest-risk pages** — they transcribe real code with line-level narration,
  so any change to a toured file invalidates prose that reads as if it were still accurate. When a
  toured function changes, re-read the actual function; do not patch the narration from the diff
  alone.
- **Counts and enumerations rot silently:** migration-file counts, table counts, "all seven node
  families", "nine instruments". Grep for them.
- **Breaking changes need a migration note** for readers on the prior release, not just a corrected
  signature.

## 4. Retirement

Retiring is not the same as deleting. Choose by *why* the page is stale:

| Situation | Do |
| --- | --- |
| API removed upstream, but shipped in a release users may still run | **Keep** the page; add a deprecation/removal callout naming the version and the replacement. Move it out of tutorials/how-to prominence. |
| API removed and never appeared in a released version | **Delete** — it documents something that never existed for a user. |
| Feature superseded by a better one | **Merge**: fold anything still true into the successor page, leave a short pointer section, delete once the successor covers it. |
| Two pages now say the same thing | **Merge** into the canonical one; the other becomes a redirect-style stub or is deleted with its links repointed. |
| Page describes a plan that never shipped | **Delete**, and record the gap in the pointer note so it is not re-added by mistake. |
| Page is still true but nobody needs it (obsolete workaround, dead ecosystem) | **Delete.** Rot in an unread page is still rot. |

Prefer merge over delete, and deprecation-callout over merge, whenever a real reader could still be
on the old version. When in doubt, ask — deletion is the one action here that destroys work.

**Deletion checklist** (in this order; skipping a step trips a gate or, worse, does not):

1. Remove the entry from the directory's `meta.json`.
2. Remove the card/link from the section `index.mdx` and the library `index.mdx` if present.
3. `grep -rn "<slug>" content/docs/` — repoint every inbound link, including from `faq.mdx`,
   `getting-started/`, and `integrations/`.
4. Delete the file.
5. `node scripts/check-doc-links.mjs && pnpm run lint:nav`.
6. Note the retirement in the pointer's range summary — a deleted page must be explainable later.

## 5. Deliberate non-goals

Record these in the pointer note rather than acting on them:

- Unshipped plans, untracked upstream files, and dirty-worktree work.
- Upstream features present in source but not exported / not released.
- Known documentation gaps you chose not to fill this round (say which, and why).

An explicit gap is a feature of the pointer file. A silent one costs the next round a full re-read.
