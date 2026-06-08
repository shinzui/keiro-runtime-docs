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
