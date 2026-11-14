#!/usr/bin/env node
// multi-state.mjs <out.json> <template> <slug>=<path>… : multi-row state file for gate-all (deployed rows)
import { readFileSync, writeFileSync } from 'node:fs';
const [out, template, ...pairs] = process.argv.slice(2);
if (!out || out === '--help' || !pairs.length) { console.log('usage: multi-state.mjs <out.json> <template> <slug>=<path>…'); process.exit(0); }
const s = JSON.parse(readFileSync('stardust/state.json', 'utf8'));
const pages = pairs.map((pr) => {
  const [slug, path] = pr.split('=');
  const p = s.pages.find((x) => x.slug === slug);
  if (!p) { console.error(`no ${slug} in state.json`); process.exit(2); }
  return { slug, url: p.url, title: p.title, type: p.type, template, status: 'deployed', deployedPath: path, liveUrl: `https://main--7c29ab64--aemcoder.aem.live${path}` };
});
writeFileSync(out, JSON.stringify({ pages }, null, 2));
console.log(out);
