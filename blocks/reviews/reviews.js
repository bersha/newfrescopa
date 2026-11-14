const STAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const txt = (node) => (node ? node.textContent.trim() : '');

function stars(n) {
  const row = el('span', 'reviews-stars');
  row.setAttribute('aria-label', `${n} out of 5 stars`);
  for (let i = 0; i < 5; i += 1) {
    const star = el('span', i < n ? 'reviews-star is-on' : 'reviews-star');
    star.setAttribute('aria-hidden', 'true');
    star.innerHTML = STAR;
    row.append(star);
  }
  return row;
}

/**
 * Reviews: aggregate head + grid of quote cards.
 * Rows: [eyebrow · h2 · "4.8" · note] then [rating] [blockquote + attribution p].
 * @param {Element} block
 */
export default function decorate(block) {
  const [headRow, ...rows] = [...block.children];
  if (!headRow) return;

  const kids = [...(headRow.firstElementChild?.children || [])];
  const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
  const headingIdx = heading ? kids.indexOf(heading) : 0;
  const paras = kids.filter((k) => k.tagName === 'P');
  const score = paras.find((p) => /^\d(\.\d)?$/.test(txt(p)));
  const eyebrow = paras.find((p) => kids.indexOf(p) < headingIdx && txt(p));
  const note = paras.find((p) => p !== eyebrow && p !== score
    && /verified|from \d|owner|review/i.test(txt(p)));

  const copy = el('div', 'reviews-head-copy');
  if (eyebrow) copy.append(el('p', 'reviews-eyebrow', txt(eyebrow)));
  if (heading) copy.append(el('h2', null, txt(heading)));
  const head = el('div', 'reviews-head');
  head.append(copy);
  if (score) {
    const agg = el('div', 'reviews-aggregate');
    agg.append(el('span', 'reviews-aggregate-num', txt(score)), stars(Math.round(parseFloat(txt(score)))));
    if (note) agg.append(el('p', 'reviews-aggregate-note', txt(note)));
    head.append(agg);
  }

  const grid = el('div', 'reviews-grid');
  rows.forEach((row) => {
    const cells = [...row.children];
    const quoteCell = cells.at(-1);
    const n = cells.length > 1 ? parseInt(txt(cells[0]), 10) || 5 : 5;
    const attribution = txt([...quoteCell.querySelectorAll('p')].at(-1));
    let quote = txt(quoteCell.querySelector('blockquote') || quoteCell.querySelector('p') || quoteCell);
    // an attribution merged into the blockquote is split back off
    if (attribution && quote.endsWith(attribution)) {
      quote = quote.slice(0, -attribution.length).trim();
    }

    const card = el('figure', 'reviews-card');
    card.append(stars(n), el('blockquote', null, quote));
    if (attribution) card.append(el('figcaption', null, attribution));
    grid.append(card);
  });

  block.replaceChildren(head, grid);
}
