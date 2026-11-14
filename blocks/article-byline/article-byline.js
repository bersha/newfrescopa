import { createOptimizedPicture } from '../../scripts/aem.js';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/**
 * Article byline (compact, under the article title) and `bio` variant
 * (end-of-article author card).
 * Row: [avatar picture (optional)] [label? · name (heading or first p) · meta/bio p]
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const isBio = block.classList.contains('bio');
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture')) || null;
  const picture = imageCell?.querySelector('picture');
  const bodyCell = cells.find((c) => c !== imageCell && c.textContent.trim()) || cells.at(-1);

  const kids = bodyCell ? [...bodyCell.children] : [];
  const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
  const paras = kids.filter((k) => k.tagName === 'P');
  const name = (heading || paras[0])?.textContent.trim() || '';

  const avatar = el('div', 'article-byline-avatar');
  const img = picture?.querySelector('img');
  if (img) {
    avatar.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '150' }]));
  } else if (name) {
    avatar.classList.add('article-byline-avatar-monogram');
    avatar.textContent = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')
      .toUpperCase();
  }

  const body = el('div', 'article-byline-body');
  // bio: a paragraph ahead of the name heading is the card label ("About the author")
  const label = isBio && heading && kids[0]?.tagName === 'P' ? kids[0] : null;
  if (label) body.append(el('span', 'article-byline-label', label.textContent.trim()));
  body.append(el('span', 'article-byline-name', name));

  const note = paras.filter((p) => p !== label && p.textContent.trim() !== name).at(-1);
  if (note) {
    body.append(el('p', isBio ? 'article-byline-bio' : 'article-byline-meta', note.textContent.trim()));
  }

  const inner = el('div', 'article-byline-inner');
  inner.append(avatar, body);
  block.replaceChildren(inner);
}
