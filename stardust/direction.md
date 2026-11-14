---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-11-13T19:21:21Z
  againstInput: https://new.frescopa.coffee/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://new.frescopa.coffee/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-11-13T19:21:21Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(1 entry — R1, a 360 overflow fix).

Fidelity: ia verbatim · design verbatim · content verbatim.

HANDS-OFF activated 2026-11-13T19:21:21Z (invocation `--hands-off`): every gate auto-resolves per the master skill; approvals recorded `approvedBy: "hands-off"`.

Roster: the 21 pages of `stardust/.labs/site-plan.json` (fixed by the run; no volume cap applies — 21 of 21 selected). Breakpoints: source breakpoints kept; gate widths 1440 and 360 (run.json `desktop,mobile`).

Named assumptions (hands-off):
- Publish decision: publish (made by the run owner) — delivered pages, redirects and chrome documents go live.
- Martech: carry the source's analytics/tags/consent over with every contract part disabled.
- First page first: site-scope capture finished before a first-page track could start; home is the first archetype in the standard order.

## Decision — E2 link audit: out-of-roster internal targets (2026-11-13, hands-off)
Six internal targets linked from delivered pages are outside this run's fixed 21-page scope and answer 404 on the source site itself: `/coffee-pdp` (beverages/coffee ×20), `/atelier` (blog/atelier-taste), `/coffee` (cafe), `/machines/atelier/worth-it` (proffee, proffee-jp), `/bundles`, `/event-registration` (proffee-jp). Scope extension → repointed to the source site (`https://new.frescopa.coffee/<path>`), as the E2 rule prescribes; the visitor outcome is unchanged (those pages do not exist on the source either). No page beyond the plan was crawled or delivered. Owner follow-up: create those pages or remove the links at the source.
