/**
 * Machine product cards — one block per product family.
 * Each row: [image?] [body: badge? · eyebrow? · h3 · description · features ul? ·
 *   "price<a>cta</a>"].
 * A row with a feature list is the flagship (large two-column card); the other
 * rows become companion cards, labelled "Also in this family" when a flagship exists.
 */

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

function buildFoot(p) {
  const foot = el('div', 'cards-machine-foot');
  const link = p.querySelector('a');
  const label = link ? link.textContent.trim() : '';
  const text = p.textContent.trim();
  const price = label && text.endsWith(label) ? text.slice(0, -label.length).trim() : text;
  if (link) link.remove();
  if (price) foot.append(el('span', 'cards-machine-price', price));
  if (link) foot.append(link);
  return foot;
}

function buildCard(row, flagship) {
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture'));
  const bodyCell = cells.find((c) => c !== imageCell && c.textContent.trim())
    || cells[cells.length - 1];
  const card = el('article', `cards-machine-card ${flagship ? 'cards-machine-flagship' : 'cards-machine-companion'}`);
  if (!bodyCell) return card;

  let kids = [...bodyCell.children];
  let badge = '';
  const firstP = kids.find((k) => k.tagName === 'P');
  if (firstP && /^new$/i.test(firstP.textContent.trim())) {
    badge = firstP.textContent.trim();
    kids = kids.filter((k) => k !== firstP);
  }
  const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
  const title = heading ? heading.textContent.trim() : '';

  const media = el('div', 'cards-machine-media');
  const picture = imageCell?.querySelector('picture');
  if (picture) {
    // authored picture kept as delivered (its 2000w source serves desktop, like the source site)
    media.append(picture);
  } else {
    media.classList.add('cards-machine-media-placeholder');
    media.append(el('span', 'cards-machine-placeholder-label', title));
  }
  if (badge) media.append(el('span', 'cards-machine-badge', badge));

  const body = el('div', 'cards-machine-body');
  const paras = kids.filter((k) => k.tagName === 'P');
  const foot = paras.length > 1 || paras.at(-1)?.querySelector('a') ? paras.at(-1) : null;
  const hIndex = heading ? kids.indexOf(heading) : -1;
  const eyebrow = hIndex > 0 ? kids.slice(0, hIndex).find((k) => k.tagName === 'P') : null;

  if (eyebrow) body.append(el('span', 'cards-machine-eyebrow', eyebrow.textContent.trim()));
  if (heading) {
    heading.classList.add('cards-machine-title');
    body.append(heading);
  }
  paras.filter((p) => p !== eyebrow && p !== foot).forEach((p) => {
    p.classList.add('cards-machine-desc');
    body.append(p);
  });
  const list = kids.find((k) => k.tagName === 'UL');
  if (flagship && list) {
    list.classList.add('cards-machine-features');
    body.append(list);
  }
  if (foot) body.append(buildFoot(foot));

  card.append(media, body);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children].filter((r) => r.textContent.trim() || r.querySelector('picture'));
  const flagshipRow = rows.find((r) => r.querySelector('ul'));
  const companions = rows.filter((r) => r !== flagshipRow);

  const out = [];
  if (flagshipRow) out.push(buildCard(flagshipRow, true));
  if (companions.length) {
    const group = el('div', 'cards-machine-companions');
    if (flagshipRow) group.append(el('span', 'cards-machine-group-label', 'Also in this family'));
    const grid = el('div', 'cards-machine-grid');
    grid.dataset.count = companions.length;
    companions.forEach((r) => grid.append(buildCard(r, false)));
    group.append(grid);
    out.push(group);
  }
  block.replaceChildren(...out);
}
