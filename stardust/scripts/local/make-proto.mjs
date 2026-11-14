// make-proto.mjs — writes stardust/prototypes/<slug>-proposed.html for a planned page:
// the source's server-rendered document (head metadata + authored, UNDECORATED content) — no source code:
// the page loads /scripts, /blocks, /styles from THIS project. Relative media (./media_x) is made
// root-relative to the page's folder so it resolves from the prototype URL.
// Usage: node stardust/scripts/local/make-proto.mjs <slug…|--all>
import fs from 'node:fs';
const rows = fs.readFileSync('stardust/current/source/pages.tsv', 'utf8').trim().split('\n').map((l) => l.split(' '));
const want = process.argv.slice(2);
if (!want.length || want.includes('--help')) { console.log('Usage: node make-proto.mjs <slug…|--all>'); process.exit(0); }
for (const [slug, p] of rows) {
  if (!want.includes('--all') && !want.includes(slug)) continue;
  const pagePath = p === '/index' ? '/' : p;
  const r = await fetch(`https://new.frescopa.coffee${pagePath}`);
  let html = await r.text();
  const dir = pagePath.endsWith('/') ? pagePath : pagePath.replace(/[^/]*$/, '');
  html = html.replace(/(src|srcset|href)="\.\/(media_[^"]*)"/g, (m, a, rest) => `${a}="${dir}${rest}"`)
    .replace(/srcset="([^"]*)"/g, (m, v) => `srcset="${v.replace(/\.\/media_/g, `${dir}media_`)}"`)
    .replace(/ nonce="[^"]*"/g, '');
  fs.writeFileSync(`stardust/prototypes/${slug}-proposed.html`, html);
  console.log(`${slug}: ${r.status} → stardust/prototypes/${slug}-proposed.html (${html.length} B)`);
}
