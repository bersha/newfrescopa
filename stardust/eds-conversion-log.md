# EDS conversion log

- 2026-11-13 — Publish decision (run owner, recorded once): **publish**. Every delivered page, the redirects sheet and the chrome documents (nav, footer and locale variants) go live on the aem.live origin (deploy-batch.mjs without --no-publish).
- 2026-11-13 — /proffee davids-model override (hands-off, replica): the source (itself EDS) authors 7 `Text` blocks around default content (D1 🔴). Replica keeps the source's authoring verbatim — unwrapping changes the cards-machine section layout and breaks `.plain.html` = source. Shipped as authored; delivered `.plain.html` identical to source; gate-all 0.00 % Δh 0 at 1440 and 360, clip 0, content 0/0.
- 2026-11-13 — E2: 6 out-of-scope internal hrefs (dead on source) repointed to the source host on 5 pages; re-PUT --force, live 5/5. See direction.md § Decision — E2 link audit.
