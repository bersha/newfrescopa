# Dynamic features — plan

1. **chrome** (row 6): header search overlay rebuilt per the header contract in the header block (C0 foundation). Verify: `chrome-compare` exit 0.
2. **blocks with client behaviour** (rows 2–5, 7, 8): recreated as blocks with the source's client behaviour (forms validate and show the same confirmation, store-locator geocode + map, of1 widget calling the same worker). Verify at 1440/360 on the published origin, parity row each.
3. **martech** (row 9): `martech-scaffold.mjs` writes `scripts/martech.js` from the empty, disabled contract before deploy; `dynamics-check.mjs` verifies `/` requests no tag host.
Owner decisions: see `dynamic-features.md` § Decision batch. Effort: inside the block recreation; no separate phase.
