#!/usr/bin/env node
// search-thumbs.mjs <url> — open the header search, report trending thumbnail state + link colour
import { openBrowser } from '../../../scripts/stardust/browser.mjs';

const url = process.argv[2];
if (!url || url === '--help') { console.log('usage: search-thumbs.mjs <url>'); process.exit(0); }
const browser = await openBrowser({ mode: 'chromium' }).catch(() => openBrowser());
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('requestfailed', (r) => console.log('FAILED', r.url()));
page.on('response', (r) => { if (/trending|media_1/.test(r.url())) console.log('RESP', r.status(), r.url()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.click('header a[href$="/"]:has-text("Search"), header [aria-haspopup]');
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.search-trending-item')].map((a) => {
  const img = a.querySelector('img');
  return {
    cls: a.querySelector('picture')?.className, src: img?.currentSrc || img?.src, nw: img?.naturalWidth, complete: img?.complete,
    color: getComputedStyle(a.querySelector('.search-trending-name')).color,
    font: getComputedStyle(a.querySelector('.search-trending-name')).fontFamily,
  };
})), null, 1));
await browser.close();
