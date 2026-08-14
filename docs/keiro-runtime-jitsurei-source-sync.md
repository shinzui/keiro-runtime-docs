# keiro-runtime-jitsurei docs ↔ source sync pointer

The `content/docs/example-app/` tree documents the standalone **`keiro-runtime-jitsurei`**
application. Like the rest of this site, those pages are **ported and cross-checked** against the
application source, not generated from it. To keep updates efficient and predictable we pin the
exact upstream commit the docs were last reviewed against. When the app changes, diff from the
pinned commit to `HEAD`, update the affected pages, then bump the pointer below.

> **Not to be confused with [`keiro-source-sync.md`](keiro-source-sync.md).** That pointer tracks
> the keiro framework repo (which contains the small in-repo `jitsurei` worked example). *This*
> pointer tracks the separate, larger `keiro-runtime-jitsurei` application (two emergency-response
> microservices). See the
> [landing page](../content/docs/example-app/index.mdx) for the distinction.

## Upstream source

- **Qualified name (mori):** *not registered.* At the time the docs were authored,
  `keiro-runtime-jitsurei` did **not** appear in `mori registry list` (only the unrelated
  `shinzui/haskell-jitsurei` does). Reference it by path until it is registered.
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei`
- **Layout:** a Haskell monorepo. Two service packages under `services/`:
  - `services/incident-command/` (package `incident-command`, modules `IncidentCommand.*`)
  - `services/hospital-capacity/` (package `hospital-capacity`, modules `HospitalCapacity.*`)
  plus `runtime/` (scenario runner infrastructure), `scripts/`, `docs/` (the app's own internal
  documentation — the primary source material for the prose), `process-compose.yaml` (local
  Postgres + Redpanda/Kafka + Jaeger), `justfile` (task recipes), `flake.nix` (Nix dev env), and a
  root `cabal.project`.
- **Primary source material in the app's `docs/`** (read these before transcribing source):
  `docs/walkthroughs/runtime-feature-use.md`, `docs/walkthroughs/evidence-map.md`,
  `docs/scenarios/{README.md,mass-casualty-transfer.md,hospital-divert-reroute.md,supply-shortage-escalation.md}`
  and `docs/scenarios/transcripts/`, `docs/contracts/` (message contracts + fixtures),
  `docs/diagrams/keiki.md` (generated Keiki Mermaid), `docs/type-safety/`, and
  `docs/observability.md`. There is **no `README.md`** at the app repo root. The app keeps its own
  `docs/plans/` and `docs/masterplans/` — read those for design intent.

## Last reviewed commit

```text
04420ed1734f6c7ee850de7e50ab11e7073b8bfd  (04420ed)
2026-06-07  branch master
chore(deps): drop now-unused direct shibuya-pgmq-adapter dep
```

> **Construction status.** The app's master plan (EP-9, *refactor service modules around aggregate
> vertical slices*) is partially complete at this pin: most concerns are already split per
> aggregate, but a few horizontal-composition modules (`Store.hs`, `CommandCli.hs`) still bundle
> multiple aggregates. The docs note these work-in-progress areas with `<Callout type="info">`
> rather than implying everything is final.

> ### ⚠ POINTER DELIBERATELY NOT ADVANCED — re-port outstanding
>
> **Re-surveyed 2026-08-14 against `HEAD` = `e3c800e` (2026-08-08, *chore(dev): use the shared
> Redpanda cluster instead of starting one*).** The pin is still a proper ancestor, and the gap has
> **widened**: **20 commits, 272 files, +20,278/−2,995**. The worktree still carries one dirty file
> (`.gitignore`) — committed tree only, as usual. The extra commit beyond the previous survey is dev
> tooling; every conclusion below still holds unchanged.
>
> **Previously surveyed 2026-07-30 against `HEAD` = `b9bcf3c` (2026-07-22, *fix(observability): honor
> OTLP trace endpoint semantics*): 19 commits, 272 files, +20250/−2981.**
>
> The pointer is **not** bumped because this is not a fold-in, it is a **re-port of the whole
> `content/docs/example-app/` tree** (34 pages, ~2950 lines, 20 of them line-by-line source tours).
> Per `POINTER.md` rule 7, partial doc work must not advance a pointer; per `TRIAGE.md` §3, a page
> more than half of whose claims are false gets rewritten from the template, and walkthroughs must be
> re-read from the *actual* functions rather than patched from a diff.
>
> **Measured staleness (do not re-derive this next round):** of the **30** distinct
> `services/**/src/**.hs` files quoted across the tree, **24 changed or vanished** in the range.
> Reproduce with:
>
> ```bash
> A=$(mori registry show shinzui/haskell-jitsurei --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
> CHANGED=$(git -C "$A" diff --name-only 04420ed..b9bcf3c)
> for f in $(grep -rhoE "services/[a-z-]+/src/[A-Za-z/]+\.hs" content/docs/example-app/ | sort -u); do
>   echo "$CHANGED" | grep -qx "$f" && echo "CHANGED $f"
> done
> ```
>
> **What changed, by theme** (read the app's own `docs/plans/` and `docs/masterplans/` for intent):
>
> 1. **Both services adopted `keiro-dsl`.** This is the dominant change and the reason a surgical edit
>    cannot work: much of the hand-written code these chapters tour now lives in generated
>    `…/Generated/{Domain,Codec,EventStream,Projection,Harness}.hs` modules with hand-owned
>    `Holes.hs` / `*Holes.hs` beside them, and each service now carries
>    `keiro-dsl-manifest.<context>.txt` and `keiro-dsl-scaffold-record.<context>.txt`. Commits
>    `d4558cc` (*capture current service behavior*), `f9c8971` (*gate scaffold and evolution drift*),
>    `a771d87` (*complete the DSL baseline plan*).
> 2. **Validated runtime boundaries** — `9a26387` (incident-command), `cc1076b` (hospital-capacity),
>    `a29f858` (*complete documentation-grade validation*), plus `8415cad` proving replay safety.
> 3. **pgmq jobs and shibuya application lifecycles** — `cc1076b`, `e2ee5e1`.
> 4. **Service-owned `pg-migrate` plans** — `bbf10ae` (*compose service-owned pg-migrate plans*),
>    which invalidates the migration recipes under `running-it/`.
> 5. **OTLP trace endpoint semantics** — `b9bcf3c`, affecting the observability chapters.
>
> **Interim reader protection (done this round):** `content/docs/example-app/index.mdx` gained a
> prominent `type="warn"` callout naming the pin, the five themes, and the 24/30 figure, telling
> readers to treat every signature, module path, and `just` recipe in the section as historical and
> pointing them at the current per-subsystem references. Nothing else in the tree was edited —
> half-porting a source tour is worse than a consistently-old one that says so.
>
> **Suggested next round**, in dependency order: `overview/` (00 and 03 map features to exact files;
> `01-the-domain` embeds generated Keiki diagrams) → `incident-command/` and `hospital-capacity/`
> service tours, re-transcribing against the new generated/hand-owned split → `cross-service/`
> (contracts, outbox/inbox, telemetry signatures) → `running-it/` (re-check every recipe against the
> app `justfile` and the new service-owned migration plans). Expect the generated/`Holes` split to need
> a *new* framing chapter rather than edits to the existing ones — the app is now a `keiro-dsl`
> consumer, which is a different story from the hand-written tour these pages tell. Consider whether
> `content/docs/keiro/reference/keiro-dsl-mapped-types.mdx` and
> `keiro-dsl-workspaces.mdx` (added in the 2026-07-30 keiro round) now deserve worked examples drawn
> from this app.

## Pages most coupled to the app source

The entire `content/docs/example-app/` tree is ported from this app. The pages most coupled to the
source surface (they transcribe exact Haskell signatures, SQL shapes, or `just`/CLI recipes, so a
source change is most likely to invalidate them) are:

- **Service tours** (line-by-line source tours): every chapter under
  `content/docs/example-app/incident-command/` and `content/docs/example-app/hospital-capacity/`.
- **Cross-service** (contracts, outbox/inbox, telemetry signatures): every chapter under
  `content/docs/example-app/cross-service/`.
- **Running it** (real `just`/script recipes, scenario names, ports): every chapter under
  `content/docs/example-app/running-it/`.
- **Overview** (`overview/01-the-domain` embeds generated Keiki diagrams; `overview/00` and
  `overview/03` map features to exact files).

## Update procedure

1. List what changed since the pointer (in the app repo):
   ```text
   APP=/Users/shinzui/Keikaku/bokuno/keiro-runtime-jitsurei
   git -C "$APP" log --oneline 04420ed..HEAD
   git -C "$APP" diff --stat 04420ed..HEAD
   ```
   The app keeps its own `docs/plans/` and `docs/masterplans/` — the prose diff there is the
   fastest way to understand intent before touching the source.
2. Update the affected pages under `content/docs/example-app/`. Re-transcribe any quoted Haskell so
   the `-- services/.../File.hs` source comments still match the file at the new `HEAD`, and
   re-check that every `just`/CLI recipe in `running-it/` is still a real recipe in the app
   `justfile`.
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and note the reviewed
   range.
