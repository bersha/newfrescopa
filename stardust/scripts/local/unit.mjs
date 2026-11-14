#!/usr/bin/env node
// unit.mjs <name> <json-patch-file|-> : merge a patch object into units.<name> of stardust/rollout/progress.json
import { readFileSync, writeFileSync } from 'node:fs';
const [name, src] = process.argv.slice(2);
const f = 'stardust/rollout/progress.json';
const p = JSON.parse(readFileSync(f, 'utf8'));
const patch = JSON.parse(readFileSync(src === '-' ? 0 : src, 'utf8'));
p.units[name] = { ...(p.units[name] || {}), ...patch };
writeFileSync(f, `${JSON.stringify(p, null, 2)}\n`);
console.log(`units.${name}: ${p.units[name].status}`);
