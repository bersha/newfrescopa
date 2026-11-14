# Dynamics parity check — https://main--7c29ab64--aemcoder.aem.live — 2026-11-13T21:27:59.800Z

Replayed 11 checks over 9 features · pass 11 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| main filled by block decoration | CR | done | dom-count | PASS | 8 × main .block (min 3) |  |
| main filled by block decoration | CR | done | no-page-errors | PASS | none on 8 page(s) |  |
| footer newsletter sign-up | F | interim | dom-count | PASS | 1 × footer form (min 1) |  |
| café booking form | F | interim | dom-count | PASS | 7 × main form input, main form select, main form textarea (min 7) | a.tile.openstreetmap.org:200×8 c.tile.openstreetmap.org:200×9 b.tile.openstreetmap.org:200×8 nominatim.openstreetmap.org:200×2 |
| account sign-in | F | interim | dom-count | PASS | 1 × main form input[type=email] (min 1) |  |
| store locator (27 cafés, Nominatim geocode, OSM tiles) | L | done | dom-count | PASS | 27 × .store-locator-card (min 27) | a.tile.openstreetmap.org:200×8 c.tile.openstreetmap.org:200×9 b.tile.openstreetmap.org:200×8 nominatim.openstreetmap.org:200×2 |
| store locator (27 cafés, Nominatim geocode, OSM tiles) | L | done | dom-count | PASS | 1 × .leaflet-container (min 1) | a.tile.openstreetmap.org:200×8 c.tile.openstreetmap.org:200×9 b.tile.openstreetmap.org:200×8 nominatim.openstreetmap.org:200×2 |
| header search panel | M | done | dom-count | PASS | 1 × header [aria-haspopup] (min 1) |  |
| Ask Anything assistant (of1 SDK) | T | done | dom-count | PASS | 1 × main .of1 (min 1) | of1-gen-web-service.franklin-prod.workers.dev:200×2 |
| machine price / add-to-cart UI | X | interim | dom-count | PASS | 1 × main .product-hero (min 1) |  |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (0 gated · 0 cross-site host(s) blocked) |  |

## Features without checks
