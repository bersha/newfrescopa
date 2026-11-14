<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-11-13 source=https://new.frescopa.coffee/styles/brand.css + _computed-styles.json -->
---
name: Fréscopa (current state)
colors:
  paper: "oklch(97% 0.010 82deg)"
  paper-2: "oklch(94.8% 0.015 78deg)"
  ink: "oklch(26.2% 0.021 52deg)"
  charcoal: "oklch(22.2% 0.016 52deg)"
  burgundy: "oklch(34% 0.093 25deg)"
  terracotta: "oklch(60.5% 0.116 44deg)"
  amber: "oklch(79% 0.128 74deg)"
typography:
  display: "Schibsted Grotesk"
  body: "Hanken Grotesk"
rounded: { sm: 8px, md: 14px, lg: 22px, xl: 32px, pill: 999px }
spacing: { section-y: 72px, content: 1120px, content-wide: 1320px, gutter: "clamp(1.25rem, 0.4rem + 3vw, 3rem)", nav-height: 72px }
---

# Design — current state (descriptive)

Warm paper backgrounds (`--paper`, alternating `alt` sections on `--paper-2`, `dark` sections on charcoal), burgundy display headings in Schibsted Grotesk with tight tracking, Hanken Grotesk body at 17px / 1.62. Terracotta is the action colour (pill buttons, links, eyebrows). Cards are 22px-rounded with soft warm two-layer shadows (`--shadow-md`). Eyebrow labels: 12px uppercase, 0.2em tracking.

Type ramp (fluid clamps): h1 `clamp(2.9rem, 1.7rem + 4.6vw, 5.4rem)`, h2 `clamp(1.8rem, 1.3rem + 2vw, 2.8rem)`, h3 `clamp(1.6rem, 1.25rem + 1.4vw, 2.3rem)`, h4 `clamp(1.25rem, 1.08rem + 0.7vw, 1.6rem)`.

Full token list: `DESIGN.json` (lifted from the source `brand.css`). Module candidates (37 EDS blocks) in `DESIGN.json extensions.modules`.
