#!/usr/bin/env node
// plain-to-da.mjs <plain.html> <out.html> [--img <srcPrefix>=<url>]… [--meta Key=Value]…
// Wraps an EDS .plain.html body (top-level divs = sections) into the DA document shape:
// section classes → section-metadata Style rows, <picture> with the given src prefix → one <img>,
// page metadata appended to the last section. Content otherwise verbatim.
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  console.log('usage: plain-to-da.mjs <plain.html> <out.html> [--img <prefix>=<url>]… [--meta Key=Value]…');
  process.exit(args.includes('--help') ? 0 : 2);
}
const [inFile, outFile] = args;
const imgs = []; const meta = [];
for (let i = 2; i < args.length; i += 1) {
  if (args[i] === '--img') { const [k, ...v] = args[i + 1].split('='); imgs.push([k, v.join('=')]); i += 1; }
  else if (args[i] === '--meta') { const [k, ...v] = args[i + 1].split('='); meta.push([k, v.join('=')]); i += 1; }
}
let html = readFileSync(inFile, 'utf8').trim();
// pictures → single img with the rehosted URL, alt kept
html = html.replace(/<picture>[\s\S]*?<img([^>]*)>\s*<\/picture>/g, (m, attrs) => {
  const src = (attrs.match(/src="([^"]*)"/) || [])[1] || '';
  const alt = (attrs.match(/alt="([^"]*)"/) || [])[1] || '';
  const hit = imgs.find(([k]) => src.startsWith(k));
  if (!hit) throw new Error(`no --img mapping for ${src}`);
  return `<img src="${hit[1]}" alt="${alt}">`;
});
// split top-level sections
const sections = [];
let depth = 0; let start = -1;
const re = /<(\/?)div\b[^>]*>/g; let m;
while ((m = re.exec(html))) {
  if (!m[1]) { if (depth === 0) start = m.index; depth += 1; } else {
    depth -= 1; if (depth === 0) sections.push(html.slice(start, re.lastIndex));
  }
}
const out = sections.map((s, i) => {
  const open = s.match(/^<div([^>]*)>/);
  const cls = (open[1].match(/class="([^"]*)"/) || [])[1];
  let inner = s.slice(open[0].length, -'</div>'.length).trim();
  // section-metadata: Style from the class, every other key from its data-* attribute (EDS emits non-style keys as data-<key>)
  const rows = [];
  if (cls) rows.push(['Style', cls.split(/\s+/).join(', ')]);
  for (const [, k, v] of open[1].matchAll(/\sdata-([\w-]+)="([^"]*)"/g)) rows.push([k, v]);
  if (rows.length) inner += `\n<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
  if (i === sections.length - 1 && meta.length) {
    inner += `\n<div class="metadata">${meta.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
  }
  return `<div>\n${inner}\n</div>`;
});
writeFileSync(outFile, `<body>\n<header></header>\n<main>\n${out.join('\n')}\n</main>\n<footer></footer>\n</body>\n`);
console.log(`${outFile}: ${sections.length} sections`);
