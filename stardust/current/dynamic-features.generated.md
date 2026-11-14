# Dynamic features — detected (2026-11-13T20:14:50.615Z)

Pages probed: /, /header, /beverages, /blog, /myatelier, /of1, /blog/atelier-taste, /machines/atelier · settle 5000 ms · width 1440 · reach from 21/21 crawled pages

Evidence only. Every row must receive a disposition in `stardust/dynamic-features.md` (`dynamics-plan.mjs` drafts it).

| id | class | feature | pages | reach | evidence | hint |
|---|---|---|---|---|---|---|
| cr-main-empty-at-load-filled-after-client-rendered-page | CR client-rendered | main empty at load, filled after (client-rendered page) | 4/8 |  | text at load 0 → settled 3179<br>text at load 170 → settled 1301<br>text at load 0 → settled 2955 | client-rendered-page |
| f-form-footer-signup-no-action-js-wired-1-fields | F form | form "footer-signup" → no action (JS-wired) (1 fields) | 8/8 |  | email:footer-email | forms |
| f-form-account-signin-form-no-action-js-wired-1-fields | F form | form "account-signin-form" → no action (JS-wired) (1 fields) | 1/8 |  | email:email | forms |
| m-modal-trigger-aria-haspopup-chrome-only-target-outside-dom | M modal / interactive | modal trigger aria-haspopup (chrome only) → target outside DOM at capture | 8/8 | 21/21 | https://new.frescopa.coffee/ | chrome-interaction |
| m-modal-trigger-cards-featured-overlay-target-outside-dom-at | M modal / interactive | modal trigger cards-featured-overlay → target outside DOM at capture | 1/8 |  | https://new.frescopa.coffee/blog/atelier-taste | modal |
| t-unknown-third-party-host-of1-gen-web-service-franklin-prod | T tag / consent | unknown third-party host of1-gen-web-service.franklin-prod.workers.dev | 1/8 |  | of1-gen-web-service.franklin-prod.workers.dev | inspect |
| x-commerce-signals-cart-true-prices-10 | X auth / commerce | commerce signals (cart: true, prices: 10) | 1/8 |  |  | decided-out |
