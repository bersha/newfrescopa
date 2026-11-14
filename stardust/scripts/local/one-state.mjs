#!/usr/bin/env node
// one-state.mjs <slug> <deliveredPath> <template> : one-row state file for gate-all (first-page-first.md shape)
import { readFileSync, writeFileSync } from 'node:fs';
const [slug, path, template] = process.argv.slice(2);
const s = JSON.parse(readFileSync('stardust/state.json', 'utf8'));
const p = s.pages.find((x) => x.slug === slug);
if (!p) { console.error(`no ${slug} in state.json`); process.exit(2); }
const out = `stardust/.work/rollout/archetype/state-${slug}.json`;
writeFileSync(out, JSON.stringify({ pages: [{ slug, url: p.url, title: p.title, type: p.type, template, status: 'deployed', deployedPath: path, liveUrl: `https://main--7c29ab64--aemcoder.aem.live${path}` }] }, null, 2));
console.log(out);
