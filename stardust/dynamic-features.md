# Dynamic features — new.frescopa.coffee

<!-- stardust provenance: skill=stardust:replica (dynamics Phases 1–3, hands-off) · 2026-11-13 · input stardust/dynamics/dynamic-features.generated-plan.md (10 rows) -->

## Listings contract
none — no index-fed listing blocks on the source. `cards-*` blocks carry their items as authored rows; the store locator's 27 café cards are authored rows in the `store-locator` block document (`/cafe`, `/japan`).

## Features
| # | id | feature | class | reach | disposition | target | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | cr-main-empty-at-load | main empty at load, filled after (EDS block decoration) | CR | 21/21 | static-snapshot | content | self | delivered-by-capture | client-rendered-page | none — the source is EDS; every page's authored content is in its `.plain.html` (saved to `stardust/current/source/plain/`) | `_dynamics.json`; plain docs non-empty for all 21 |
| 2 | f-footer-signup | footer newsletter sign-up (1 field, JS-wired, no action) | F | 21/21 | rebuild-native | block | needs-backend | interim | forms | production endpoint for sign-ups (owner); interim = same client behaviour as the source (no submission backend on source either) | footer fragment |
| 3 | f-booking-form | café booking form (7 fields, JS-wired) | F | 1 (/cafe) | rebuild-native | block | needs-backend | interim | forms | booking backend (owner); interim = source client behaviour, no backend connected | `booking-form` block |
| 4 | f-account-signin | account sign-in (email, JS-wired) | F | 1 (/myatelier) | rebuild-native | block | needs-backend | interim | forms | auth backend (owner); interim = source client behaviour | `account-signin` block |
| 5 | l-store-locator | store locator: 27 authored café cards, geocode search via nominatim.openstreetmap.org, OSM tiles (Leaflet) | L/V | 2 (/cafe, /japan) | client-only | block | self | pending | listing (authored rows) + media-as-url | none — rows stay authored; geocoding + tiles are public third-party services already used by the source | `store-locator.js` NOMINATIM + tile.openstreetmap.org |
| 6 | m-header-search | header search trigger (aria-haspopup) | M/S | 21/21 | rebuild-native | runtime | self | pending | chrome-interaction | none — header contract is the spec (`stardust/chrome/header-contract.json`) | header contract: 1 control, 2 states @1440 |
| 7 | t-of1-assistant | "Ask Anything" assistant served by of1-gen-web-service.franklin-prod.workers.dev | T | 1 (/of1) | embed-passthrough | block | self | pending | embed | none — the source's own worker; kept as-is (named assumption: the worker accepts the new host) | `of1.js` DEFAULT_WORKER_URL |
| 8 | x-commerce | machine price / add-to-cart UI (prices ×10, cart) | X | 1 (/machines/atelier) | static-snapshot | content | needs-backend | interim | commerce | commerce backend (owner); interim = same UI as source (no cart backend observed) | `product-hero`, `bundle-cards` |
| 9 | martech | analytics / tags / consent | T | 21/21 | embed-passthrough | runtime | self | scaffolded-awaiting-owner | consent-gated-tags | none found on source (no CMP, no tag manager) — contract scaffolded empty, every part disabled | `stardust/martech-contract.json` |

## Decision batch (hands-off: recorded as named assumptions, interim tiers ship)
- **Backends** (rows 2, 3, 4, 8): newsletter sign-up, café booking, account sign-in and cart have no submission backend observed on the source; the rebuilt UI keeps the source's client behaviour. Owner: name production endpoints if these should submit.
- **Assistant** (row 7): the of1 worker is kept as the source's own service; owner confirms it accepts requests from the new host.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| — | none | — |

## Verification — rollout B2 (2026-11-13T20:16Z)
Fresh evidence: `dynamics-detect.mjs --from-state stardust/state.json --reach stardust/current` (8 representative pages, 8 findings, 0 host-bound of 0 probed API paths), `dynamics-plan.mjs --target-origin https://main--7c29ab64--aemcoder.aem.page --migrated stardust/migrated --chrome` (8 draft rows). Every draft row maps to a curated row above; no new feature:
- draft `cr-main-empty-at-load` → row 1 (EDS decoration; authored `.plain.html` exists for all 21 pages — not a human-capture case).
- draft `f-form-footer-signup`, `f-form-account-signin-form` → rows 2, 4. Booking form (row 3) is on `/cafe`, not in the probe set; unchanged.
- draft `m-modal-trigger … aria-haspopup` and `chrome-search` → row 6. The source search is an overlay with no data fetch (no query index read); ours (`blocks/header/search.js`) matches — no index needed.
- draft `m-modal-trigger cards-featured-overlay` → not a modal: a full-card link overlay anchor (`blocks/cards-featured/cards-featured.js`), delivered by the block; no row.
- draft `t-… of1-gen-web-service` → row 7; `x-commerce-signals` → row 8; martech → row 9 (scaffold written: `scripts/martech.js`, all parts disabled).
