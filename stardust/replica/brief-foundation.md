# Foundation (gated, frozen for block authors — do not edit these files; request changes in your report)
Files: styles/styles.css, styles/fonts.css, scripts/scripts.js, blocks/header/*, blocks/footer/*, fonts/*.
- Buttons: `p.button-wrapper` > `a.button` + `.primary` (bold link) / `.secondary` (italic) / `.accent` (bold+italic); plain `.button` = terracotta pill.
- Eyebrow: first `<p>` of a default-content block is auto-styled as eyebrow (not in dark, feed, voices, cards-coffee, article sections); `.eyebrow` utility.
- Section metadata `style` → section class. alt, light, highlight, feed, voices, learn → paper-2 bg; intro, mood, sustain → paper; dark → charcoal + amber glow. Global rules exist for catalogue intro (.alt with h1), sticky machine-filter-container, cards-featured-container, cards-article-container spacing, article layout.
- Containers: `main > .section` padding-block var(--section-y)=72px; children max var(--content)=1120px with var(--gutter) side padding; --content-wide, --content-narrow, --nav-height.
- All brand.css tokens (--fs-*, --lh-*, --space-*, --r-*, --shadow-*, --ease-*, --dur-*).
- Scroll reveal: scripts.js adds .reveal/.is-in to content in every section after the first.
- Built by scripts.js: .page-breadcrumb, .article-breadcrumb, .section-head-split/-copy/-note, .article-header.
- Lazy-image rule: `main .default-content-wrapper img[width][height]` holds authored size (the gate does not scroll the build). Block images that lazy-load may need the same care (give them their aspect ratio).
- Captured font files in stardust/current/source/code/fonts are gzip-compressed; /fonts has decompressed copies.
