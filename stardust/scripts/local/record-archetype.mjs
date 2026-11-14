// record-archetype.mjs <slug> — merges stardust/replica/progress-<slug>.json into progress.json types.<type>
import fs from 'node:fs';
const slug = process.argv[2];
const p = JSON.parse(fs.readFileSync(`stardust/replica/progress-${slug}.json`, 'utf8'));
const f = 'stardust/replica/progress.json';
const all = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { types: {} };
all.types ||= {};
all.types[p.type] = { archetype: slug, ...p, recordedAt: new Date().toISOString() };
fs.writeFileSync(f, JSON.stringify(all, null, 2) + '\n');
console.log(`recorded ${p.type} ← ${slug}`);
