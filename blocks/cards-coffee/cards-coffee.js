/**
 * Coffee product cards — uniform shop grid, one block per product family.
 * Each row: [image?] [body: badge? · category · h3 · description · formats ul? ·
 *   price ("from $10") · CTA link].
 * Paragraphs before the heading: the last is the category, an earlier one the badge.
 */

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

function buildCard(row) {
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture'));
  const bodyCell = cells.find((c) => c !== imageCell && c.textContent.trim())
    || cells[cells.length - 1];
  const kids = bodyCell ? [...bodyCell.children] : [];
  const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
  const hIndex = kids.indexOf(heading);
  const isP = (k) => k.tagName === 'P';

  const before = hIndex >= 0 ? kids.slice(0, hIndex).filter(isP) : [];
  const after = hIndex >= 0 ? kids.slice(hIndex + 1).filter(isP) : kids.filter(isP);
  const badge = before.length > 1 ? before[0] : null;
  const category = before.at(-1) || null;
  const ctaP = after.find((p) => p.querySelector('a'));
  const price = after.find((p) => p !== ctaP && /\d/.test(p.textContent) && /from|[£$€]/i.test(p.textContent));
  const desc = after.find((p) => p !== ctaP && p !== price);
  const list = kids.find((k) => k.tagName === 'UL');

  const media = el('div', 'cards-coffee-media');
  const picture = imageCell?.querySelector('picture');
  if (picture) {
    media.append(picture); // authored picture as delivered, like the source
  } else {
    media.classList.add('cards-coffee-media-placeholder');
    media.append(el('span', 'cards-coffee-placeholder-label', heading?.textContent.trim()));
  }
  if (badge) media.append(el('span', 'cards-coffee-badge', badge.textContent.trim()));

  const body = el('div', 'cards-coffee-body');
  if (category) body.append(el('span', 'cards-coffee-category', category.textContent.trim()));
  if (heading) {
    heading.classList.add('cards-coffee-title');
    body.append(heading);
  }
  if (desc) {
    desc.classList.add('cards-coffee-desc');
    body.append(desc);
  }
  if (list) {
    list.classList.add('cards-coffee-formats');
    body.append(list);
  }
  const foot = el('div', 'cards-coffee-foot');
  if (price) {
    price.classList.add('cards-coffee-price');
    foot.append(price);
  }
  const link = ctaP?.querySelector('a');
  if (link) {
    link.classList.add('cards-coffee-cta');
    foot.append(link);
  }
  if (foot.children.length) body.append(foot);

  const card = el('article', 'cards-coffee-card');
  card.append(media, body);
  return card;
}

export default function decorate(block) {
  const grid = el('div', 'cards-coffee-grid');
  [...block.children]
    .filter((row) => row.textContent.trim() || row.querySelector('picture'))
    .forEach((row) => grid.append(buildCard(row)));
  block.replaceChildren(grid);
}
