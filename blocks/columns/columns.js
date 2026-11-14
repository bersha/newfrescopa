const DAYS = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/;

/**
 * "Flagship location" variant: one row, a short text label on the left and an
 * eyebrow / heading / description / amenities / address+hours / directions
 * link on the right. Rebuilt as a card with a dashed image slot + badge.
 * @param {Element} block the columns block
 * @returns {boolean} true when the block was handled
 */
function decorateLocationCard(block) {
  const rows = [...block.children];
  if (rows.length !== 1 || rows[0].children.length !== 2) return false;
  const [labelCell, detailCell] = rows[0].children;
  const heading = detailCell.querySelector('h2, h3, h4');
  const hasDirections = [...detailCell.querySelectorAll('a')]
    .some((a) => /directions/i.test(a.textContent));
  if (!heading || !hasDirections || labelCell.querySelector('picture, img')) return false;
  const labelText = labelCell.textContent.trim();
  if (!labelText || labelText.length > 24) return false;

  block.classList.add('columns-location');

  const media = document.createElement('div');
  media.className = 'columns-location-media';
  const badge = document.createElement('span');
  badge.className = 'columns-location-badge';
  badge.textContent = labelText;
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.classList.add('columns-location-icon');
  icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>'
    + '<circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>'
    + '<path d="M21 15l-5-5L5 21" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  const slotLabel = document.createElement('span');
  slotLabel.className = 'columns-location-slot-label';
  slotLabel.textContent = `Fréscopa ${labelText.toLowerCase()}`;
  media.append(badge, icon, slotLabel);

  const detail = document.createElement('div');
  detail.className = 'columns-location-detail';
  const paras = [...detailCell.querySelectorAll(':scope > p')];
  const eyebrow = paras[0] && !paras[0].querySelector('a') ? paras[0] : null;
  if (eyebrow) {
    eyebrow.className = 'columns-location-eyebrow';
    detail.append(eyebrow);
  }
  detail.append(heading);

  const description = paras.find((p) => p !== eyebrow && !p.querySelector('a'));
  if (description) {
    description.className = 'columns-location-desc';
    detail.append(description);
  }

  const linkPara = paras.find((p) => p.querySelector('a'));
  const rest = paras.filter((p) => ![eyebrow, description, linkPara].includes(p));
  const amenities = rest.find((p) => !DAYS.test(p.textContent));
  const address = rest.find((p) => DAYS.test(p.textContent));

  if (amenities) {
    const tags = document.createElement('ul');
    tags.className = 'columns-location-tags';
    amenities.textContent.trim().split(/\s+/).forEach((word) => {
      const li = document.createElement('li');
      li.textContent = word;
      tags.append(li);
    });
    detail.append(tags);
  }

  if (address) {
    const meta = document.createElement('div');
    meta.className = 'columns-location-meta';
    const text = address.textContent.trim();
    const m = text.match(DAYS);
    const parts = m && m.index > 0
      ? [text.slice(0, m.index).trim(), text.slice(m.index).trim()]
      : [text];
    parts.forEach((t) => {
      const span = document.createElement('span');
      span.textContent = t;
      meta.append(span);
    });
    detail.append(meta);
  }

  if (linkPara) {
    const link = linkPara.querySelector('a');
    link.className = 'columns-location-cta';
    detail.append(link);
  }

  block.replaceChildren(media, detail);
  return true;
}

/**
 * Columns: editorial two-column rows (text/text, image/text, text/image),
 * with an optional chip list; or the flagship location card.
 * @param {Element} block the columns block
 */
export default function decorate(block) {
  if (!block.firstElementChild || decorateLocationCard(block)) return;

  block.classList.add(`columns-${block.firstElementChild.children.length}-cols`);

  block.querySelectorAll(':scope > div > div').forEach((col) => {
    const pic = col.querySelector('picture');
    const wrapper = pic?.closest('div');
    if (wrapper && wrapper.children.length === 1) wrapper.classList.add('columns-img-col');
  });
}
