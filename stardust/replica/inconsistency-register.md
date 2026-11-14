# Inconsistency register — Fréscopa replica

The ONLY permitted design deltas. No audit was requested and no `--register` items were supplied; the entries below are hard-assert fixes (horizontal overflow is a fail no iteration cap waives).

## R1 — sign-in email input overflows the 360 viewport
- **Evidence:** live https://new.frescopa.coffee/myatelier at 360: the `account-signin` email input is 19 px wider than the viewport (content-box width + padding), document scrollWidth 379 > 360. Gate dir `stardust/replica/gates/myatelier-360/`.
- **Minimal change:** `box-sizing: border-box` on the input below 600 px only (`blocks/account-signin/account-signin.css`); 1440 unchanged.
- **Status:** applied (gated: 360 pixel 0.01 %, Δh 0, overflow ok).

Informational (cap-probe `capRegister`, not a delta): content width differs by archetype as authored on the source — 1120 px shell, 680 px article column, 760 px sign-in — reproduced as-is.
