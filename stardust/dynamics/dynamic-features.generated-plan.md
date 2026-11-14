<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-11-13T20:16:24.053Z · input stardust/current/_dynamics.json (8 pages, 8 findings) · target probe https://main--7c29ab64--aemcoder.aem.page · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | cr-main-empty-at-load-filled-after-client-rendered-page | CR | main empty at load, filled after (client-rendered page) | 4/8 | static-snapshot | content | needs-human-capture | pending | client-rendered-page | human-browser capture; never migrate blank |  |
| 2 | f-form-footer-signup-no-action-js-wired-1-fields | F | form "footer-signup" → no action (JS-wired) (1 fields) | 8/8 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 3 | f-form-account-signin-form-no-action-js-wired-1-fields | F | form "account-signin-form" → no action (JS-wired) (1 fields) | 1/8 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 4 | m-modal-trigger-aria-haspopup-chrome-only-target-outside-dom | M | modal trigger aria-haspopup (chrome only) → target outside DOM at capture | 8/8 (reach 21/21) | rebuild-native | runtime | self | delivered-by-capture | chrome-interaction | none (the header contract is the spec) | output already carries "https://new.frescopa.coffee/" |
| 5 | m-modal-trigger-cards-featured-overlay-target-outside-dom-at | M | modal trigger cards-featured-overlay → target outside DOM at capture | 1/8 | rebuild-native | runtime | self | delivered-by-capture | modal-loader | none | output already carries "https://new.frescopa.coffee/blog/atelier" |
| 6 | t-unknown-third-party-host-of1-gen-web-service-franklin-prod | T | unknown third-party host of1-gen-web-service.franklin-prod.workers.dev | 1/8 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "of1-gen-web-service.franklin-prod.worker" |
| 7 | x-commerce-signals-cart-true-prices-10 | X | commerce signals (cart: true, prices: 10) | 1/8 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 8 | chrome-search | S | header search: Search (chrome only) | 1/1 | index-backed | widget | self | pending | search-index-backed | none (results from the query index; overlay and typeahead per the contract) |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 1 row(s) — search-index-backed.
- **One owner decision batch:** 3 row(s) — human-browser capture; never migrate blank · production endpoint; interim capture ships now.
- **Already delivered by the capture pipeline:** 3 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **interactive** — 3
- **forms** — 2
- **capture** — 1
- **tags** — 1
- **register** — 1
