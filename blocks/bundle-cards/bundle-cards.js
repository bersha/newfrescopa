const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const txt = (node) => (node ? node.textContent.trim() : '');

/**
 * Bundle pricing cards. Rows: optional one-cell head (eyebrow + h2), then one
 * cell per bundle: badge p? · h3 · description · price p ("$2,799 $2,899" or
 * "$2,399 save $110") · CTA link. A card with a badge is featured.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let head = null;
  const first = rows[0];
  if (first.children.length === 1 && first.querySelector('h2') && !first.querySelector('h3')) {
    head = el('div', 'bundle-cards-head');
    head.append(...rows.shift().children);
  }

  const grid = el('div', 'bundle-cards-grid');
  rows.forEach((row) => {
    const cell = row.lastElementChild;
    if (!cell) return;
    const kids = [...cell.children];
    const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
    const paras = kids.filter((k) => k.tagName === 'P');
    const badge = paras.find((p) => /most loved|best|popular/i.test(txt(p)) && txt(p).length < 24);
    const desc = paras.find((p) => p !== badge && txt(p).length > 24);
    const price = paras.find((p) => /[$£€]\s?\d|save/i.test(txt(p)));
    const link = cell.querySelector('a');

    const card = el('div', 'bundle-cards-card');
    if (badge) {
      card.classList.add('is-featured');
      card.append(el('span', 'bundle-cards-badge', txt(badge)));
    }
    if (heading) card.append(el('h3', null, txt(heading)));
    if (desc) card.append(el('p', 'bundle-cards-desc', txt(desc)));
    if (price) {
      const [amount, extra] = txt(price).match(/[$£€]\s?[\d,]+|save\s+[$£€]?[\d,]+/gi) || [txt(price)];
      const priceRow = el('div', 'bundle-cards-price');
      priceRow.append(el('span', 'bundle-cards-amount', amount));
      if (extra) priceRow.append(el('span', /save/i.test(extra) ? 'bundle-cards-save' : 'bundle-cards-was', extra));
      card.append(priceRow);
    }
    const cta = el('a', 'bundle-cards-cta', (link && txt(link).replace(/\s*→\s*$/, '')) || 'Add to cart');
    cta.href = link?.getAttribute('href') || '#';
    card.append(cta);
    grid.append(card);
  });

  block.replaceChildren(...(head ? [head] : []), grid);
}
