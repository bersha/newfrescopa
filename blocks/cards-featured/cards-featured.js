import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Featured post: one large horizontal card linking to a journal story.
 * Row: [image] [body: "Featured<Category>" · heading · description… ·
 *   meta (date · read time) · link].
 * A leading "Featured" in the label paragraph becomes a badge on the image;
 * the story link also covers the whole card through an overlay anchor.
 */

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  const bodyCell = cells.find((c) => c !== imageCell) || cells[1];
  const kids = bodyCell ? [...bodyCell.children] : [];
  const paras = kids.filter((k) => k.tagName === 'P');

  const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
  const linkP = paras.find((p) => p.querySelector('a'));
  const link = linkP?.querySelector('a');
  const labelP = paras.find((p) => p !== linkP);
  const rest = paras.filter((p) => p !== labelP && p !== linkP);
  const metaP = rest.at(-1);
  const descs = rest.slice(0, -1);

  const labelText = labelP?.textContent.trim() || '';
  const featured = /^featured/i.test(labelText);
  const category = labelText.replace(/^featured/i, '').trim();

  const media = el('div', 'cards-featured-media');
  const img = imageCell?.querySelector('img');
  if (img) media.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  if (featured) media.append(el('span', 'cards-featured-badge', 'Featured'));

  const body = el('div', 'cards-featured-body');
  if (category) body.append(el('span', 'cards-featured-category', category));
  if (heading) {
    heading.classList.add('cards-featured-title');
    body.append(heading);
  }
  descs.forEach((p) => {
    p.classList.add('cards-featured-desc');
    body.append(p);
  });
  const meta = el('div', 'cards-featured-meta');
  if (metaP) meta.append(el('span', 'cards-featured-meta-text', metaP.textContent.trim()));
  if (link) {
    link.className = 'cards-featured-link';
    meta.append(link);
  }
  if (meta.children.length) body.append(meta);

  const card = el('div', 'cards-featured-card');
  card.append(media, body);
  if (link?.getAttribute('href')) {
    card.classList.add('cards-featured-card-linked');
    const overlay = el('a', 'cards-featured-overlay');
    overlay.href = link.getAttribute('href');
    overlay.setAttribute('aria-label', heading?.textContent.trim() || link.textContent.trim());
    card.append(overlay);
  }
  block.replaceChildren(card);
}
