<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-11-13 source=https://new.frescopa.coffee/ pages=21 mode=prep -->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web — the source is already an AEM Edge Delivery Services site (block-based documents, `aem.js`).

## Users

Home coffee drinkers considering a premium smart coffee machine (the Fréscopa Atelier), existing owners (account sign-in, "My Atelier"), café visitors in US cities and Tokyo, and Japanese-language readers (`/japan`, `/proffee-jp`).

## Product Purpose

Fréscopa sells coffee machines (lead product: the Atelier, a machine that "learns your taste"), beverages (coffee, tea, cold-pressed juice) and runs café showrooms. The site markets the machine, lists machines and beverages, publishes a journal, books café visits and hosts an "Ask Anything" assistant (`/of1`) backed by plain knowledge documents (`/of1/knowledge/*`). The footer states: "A fictional brand, created for demonstration."

## Positioning

"Every morning, perfected." — premium, warm, domestic ritual; "Great coffee, without the barista price tag."

## Capabilities and Constraints

Café booking form, store locator (geocoding via nominatim.openstreetmap.org), machine filter, account sign-in form, assistant app loaded from `of1-gen-web-service.franklin-prod.workers.dev`. Header/footer loaded from `/fragments/nav` and `/fragments/footer`.

## Brand Commitments

Register: `brand` (marketing). Personality observed: warm, crafted, calm, confident. Anti-references observed: cold tech minimalism, discount retail.

## Evidence on Hand

`stardust/current/pages/*.json|html` (21 live captures), `assets/screenshots/`, `assets/fonts/` (Schibsted Grotesk, Hanken Grotesk — OFL), `assets/logo.svg`, `_computed-styles.json`, `source/plain/*.html` (authored content), `source/code/` (source CSS for value lifting).

## Product Principles

_provenance: inferred — from captured copy._ Make the morning effortless; show the craft; invite people in (try before you buy).

## Accessibility & Inclusion

Bilingual content (English, Japanese). Reduced-motion is respected by the source (`prefers-reduced-motion`).
