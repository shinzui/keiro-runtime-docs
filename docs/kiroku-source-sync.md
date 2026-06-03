# Kiroku docs ↔ source sync pointer

The `content/docs/kiroku/` tree is **ported and cross-checked** against the kiroku
source repo, not generated from it. To keep updates efficient and predictable we pin the
exact upstream commit the docs were last reviewed against. When kiroku changes, diff from
the pinned commit to `HEAD`, update the affected pages, then bump the pointer below.

## Upstream source

- **Qualified name (mori):** `shinzui/kiroku` — resolve the on-disk path with
  `mori registry show shinzui/kiroku --full` (prefer this over the hard-coded path, which
  can move).
- **Path at last sync:** `/Users/shinzui/Keikaku/bokuno/kiroku-project/kiroku`
- Relevant packages: `kiroku-store` (core store + subscription FSM), `kiroku-otel`
  (optional OpenTelemetry sister package).

## Last reviewed commit

```
0a39598a4a9614528316f6c9c63842cc1d55d313  (0a39598)
2026-06-01 11:07:54 -0700
docs(kiroku-metrics): user guide and self-verifying runnable example
```

> **Note.** Released versions at this pin: `kiroku-store` **0.2.0.0**, `kiroku-store-migrations`
> **0.1.1.0**, `kiroku-otel` **0.2.0.0**, `kiroku-cli` **0.1.0.0** (new), `kiroku-metrics` **0.1.0.0**
> (new), `shibuya-kiroku-adapter` **0.2.0.0**. The `98f46b3..0a39598` range added two **new
> packages** — `kiroku-metrics` (`reference/metrics.mdx`, `how-to/serve-metrics-and-health.mdx`) and
> `kiroku-cli` (`reference/operator-cli.mdx`, `how-to/inspect-subscriptions-with-the-cli.mdx`) — plus
> the **OpenTelemetry 1.0 / semantic-conventions 1.40 and Shibuya 0.6 upgrade** (kiroku-otel deliver
> and db-error spans now also carry `messaging.*` / `db.*` semantic-convention attributes; folded into
> `reference/opentelemetry.mdx`). The subscription registry, `deliver`/`stopped` spans, and
> ack-coupled checkpointing were already documented at the prior pin.

### Previous pointers (for traceability)

- `98f46b368e9d4e73d05e849703bbbe6cec3aeaff` (`98f46b3`, 2026-05-31, pre-release) — baseline before
  the metrics/CLI packages and the OTel-1.0/Shibuya-0.6 upgrade. The `98f46b3..0a39598` range added
  `kiroku-metrics` and `kiroku-cli`, bumped the release versions above, and upgraded the
  OpenTelemetry/Shibuya dependencies (adding `messaging.*` / `db.*` semantic-convention attributes to
  the subscription spans).
- `0f33d72` (2026-05-31 07:21) — baseline before the state-tracking / OpenTelemetry
  overhaul. The `0f33d72..98f46b3` range is what the older pages reflect; it introduced
  the central subscription-state registry (`subscriptionStates`, `currentState ::
  m (Maybe SubscriptionState)`), the per-batch `kiroku.subscription.deliver` span
  (replacing `kiroku.subscription.fetch`), the always-emitted
  `kiroku.subscription.stopped` span, and the striped lock-free span registry in
  `kiroku-otel`.

## Update procedure

1. List what changed since the pointer:
   ```sh
   KIROKU=$(mori registry show shinzui/kiroku --full | sed -n 's/.*[Pp]ath: *//p' | head -1)
   git -C "$KIROKU" log --oneline 98f46b3..HEAD
   git -C "$KIROKU" diff --stat 98f46b3..HEAD
   ```
   Kiroku also keeps its own `docs/`, `CHANGELOG.md` files, and `docs/plans|masterplans`
   entries — the prose diff there is the fastest way to understand intent before touching
   the source. The `kiroku-metrics/example/Main.hs` and `kiroku-cli/test/Main.hs` are
   self-verifying usage references for the two newer packages.
2. Update the affected pages under `content/docs/kiroku/`. The pages most coupled to the
   subscription/observability surface are:
   - `explanation/tracing-subscriptions.mdx`, `explanation/subscriptions-and-consumer-groups.mdx`
   - `reference/opentelemetry.mdx`, `reference/core-types.mdx`
   - `reference/metrics.mdx` (kiroku-metrics), `reference/operator-cli.mdx` (kiroku-cli)
   - `how-to/serve-metrics-and-health.mdx`, `how-to/inspect-subscriptions-with-the-cli.mdx`
   - `walkthrough/01-the-state-machine.mdx`, `walkthrough/03-subscribe-and-lifecycle.mdx`,
     `walkthrough/05-consumer-groups-and-policy.mdx`, `walkthrough/06-tracing-the-subscription.mdx`
   - `tutorials/getting-started.mdx`, `how-to/enable-opentelemetry.mdx`
3. Replace the **Last reviewed commit** block above with the new `HEAD`, and move the old
   SHA into **Previous pointers** with a one-line summary of what the range covered.
