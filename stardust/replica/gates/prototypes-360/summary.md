# Prototype gate — every crafted prototype, 360px

2026-11-13T20:11:59.567Z · **7 PASS / 1 FAIL / 0 error of 8** (+1 documented override → 8 delivered)

Verdict: overlap pixel % ≤ 10 AND |Δh| ≤ 5% of origin height AND clipped ≤ 0 (+ documented allowance)

Calibration — pixel-only verdict (criteria 1+2): **7 PASS**; full verdict (1–4): **7 PASS**. Failing by criterion: pixel 1, height 0, clip 0, content 0; content n/a (origin not probed) 0.
| page | template | tier | origin | browser | pixel % (text %) | Δh px | clipped | content | units | verdict | reasons |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/cafe-proposed.html` | - | - | stitch-live | chrome | 0 | 0 | 0 | n/a | - | PASS | - |
| `/machines-proposed.html` | - | - | stitch-live | chrome | 0 | 0 | 0 | n/a | - | PASS | - |
| `/of1-proposed.html` | - | - | stitch-live | chrome | 0 | 0 | 0 | n/a | - | PASS | - |
| `/blog-atelier-taste-proposed.html` | - | - | stitch-live | chrome | 0 | 0 | 0 | n/a | - | PASS | - |
| `/of1-knowledge-machines-proposed.html` | - | - | stitch-live | chrome | 0 | 0 | 0 | n/a | - | PASS | - |
| `/myatelier-proposed.html` | - | - | stitch-live | chrome | 0.01 | 0 | 0 | n/a | - | PASS | - |
| `/machines-atelier-proposed.html` | - | - | stitch-live | chrome | 0.24 | 0 | 0 | n/a | - | PASS | - |
| `/index-proposed.html` | - | - | stitch-live | chrome | 13.15 | 30 | 0 | n/a | - | FAIL → PASS (capture-state): mood-calendar auto-advances every 3 s on live and build; a day whose note wraps one more line at 360 grows the section +24–30 px and offsets every band below. At rest measure.mjs reads every main section and the footer Δx/Δy/Δw/Δh 0 at 360 (stardust/.work/replica/bg/idx-measure.log); gate.sh iter3 360: 4.62 % Δh 0, content 0/0. Timer-driven media is delivered as on live (captureState restoreAtDelivery). | pixel 13.15% > 10% |
