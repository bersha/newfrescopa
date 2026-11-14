// proto-server.mjs — serves replica prototypes for the local gate.
//   /<slug>-proposed.html        → stardust/prototypes/<slug>-proposed.html
//   /scripts /blocks /styles /fonts /icons /widgets /plugins, /favicon.ico → project-root code (OUR code only)
//   authored content the page fetches (*.plain.html fragments, media_*, images, json) → source origin, disk-cached
// Usage: node stardust/scripts/local/proto-server.mjs [--port 8791] [--source https://new.frescopa.coffee]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--help')) { console.log('Usage: node proto-server.mjs [--port 8791] [--source <origin>]'); process.exit(0); }
const PORT = Number(arg('--port', 8791));
const SOURCE = arg('--source', 'https://new.frescopa.coffee');
const ROOT = process.cwd();
const CACHE = path.join(ROOT, 'stardust/.work/proto-cache');
const CODE = /^\/(scripts|blocks|styles|fonts|icons|widgets|plugins)\/|^\/favicon\.ico$|^\/head\.html$/;
const PROXY = /media_|\.plain\.html$|\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|json|pdf)$/i;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };

function sendFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(buf);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = decodeURIComponent(url.pathname);
  if (/^\/[a-z0-9-]+-proposed\.html$/.test(p)) return sendFile(res, path.join(ROOT, 'stardust/prototypes', p));
  if (/^\/[a-z0-9-]+-proposed\.(css|js)$/.test(p)) return sendFile(res, path.join(ROOT, 'stardust/prototypes', p));
  if (CODE.test(p)) {
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    return sendFile(res, f);
  }
  if (PROXY.test(p)) {
    const key = path.join(CACHE, Buffer.from(p + url.search).toString('base64url'));
    if (fs.existsSync(key) && fs.existsSync(`${key}.type`)) {
      res.writeHead(200, { 'content-type': fs.readFileSync(`${key}.type`, 'utf8') });
      res.end(fs.readFileSync(key)); return;
    }
    try {
      const r = await fetch(SOURCE + p + url.search);
      const buf = Buffer.from(await r.arrayBuffer());
      const type = r.headers.get('content-type') || 'application/octet-stream';
      if (r.ok) { fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(key, buf); fs.writeFileSync(`${key}.type`, type); }
      res.writeHead(r.status, { 'content-type': type }); res.end(buf);
    } catch (e) { res.writeHead(502); res.end(String(e)); }
    return;
  }
  res.writeHead(404); res.end('not found');
}).listen(PORT, () => console.log(`proto-server on :${PORT} (source ${SOURCE})`));
