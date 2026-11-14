import { createOptimizedPicture } from '../../scripts/aem.js';

const toKey = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PLACEHOLDER_ICON = '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" fill="none" stroke="currentColor" stroke-width="1.5"/>';

/**
 * Splits the flattened filter paragraph ("All posts The Atelier Brewing …")
 * back into labels, using the card categories as the vocabulary.
 */
function splitLabels(text, categories) {
  const vocab = [...categories].sort((a, b) => b.length - a.length);
  let rest = text.replace(/^all\s+posts\s*/i, '').trim();
  const labels = [];
  while (rest) {
    const lower = rest.toLowerCase();
    const known = vocab.find((c) => lower.startsWith(c.toLowerCase()));
    if (known) {
      labels.push(known);
      rest = rest.slice(known.length).trim();
    } else {
      // unknown label (no posts yet): take everything up to the next known one
      const next = vocab.map((c) => lower.indexOf(c.toLowerCase())).filter((i) => i > 0);
      const cut = next.length ? Math.min(...next) : rest.length;
      labels.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
  }
  return labels.length ? labels : categories;
}

/**
 * Journal listing only: the section's "All posts …" paragraph becomes a
 * category filter bar.
 */
function buildFilter(block, categories, cards) {
  const source = [...(block.closest('.section')?.querySelectorAll('.default-content-wrapper > p') || [])]
    .find((p) => /^all\b/i.test(p.textContent.trim()));
  if (!source) return;

  const bar = document.createElement('div');
  bar.className = 'cards-article-filter';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter posts by category');

  const select = (key) => {
    cards.forEach((card) => card.classList.toggle('is-filtered-out', key !== 'all' && card.dataset.category !== key));
    [...bar.children].forEach((btn) => {
      const on = btn.dataset.key === key;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  };

  [['all', 'All posts'], ...splitLabels(source.textContent.trim(), categories).map((l) => [toKey(l), l])]
    .forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cards-article-filter-tab';
      btn.dataset.key = key;
      btn.textContent = label;
      btn.addEventListener('click', () => select(key));
      bar.append(btn);
    });

  source.replaceWith(bar);
  select('all');
}

/**
 * Article cards. Each row: [image] [category p · heading · description? · meta?]
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  const categories = [];

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.append(...row.children);
    let emptyImage = null;
    let title = '';

    [...li.children].forEach((cell) => {
      const img = cell.querySelector('picture > img');
      if (img && cell.children.length === 1) {
        cell.className = 'cards-article-card-image';
        cell.querySelector('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
        return;
      }
      if (!cell.children.length && !cell.textContent.trim()) {
        cell.className = 'cards-article-card-image cards-article-card-image-empty';
        emptyImage = cell;
        return;
      }
      cell.className = 'cards-article-card-body';
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      const paras = [...cell.querySelectorAll(':scope > p')];
      if (heading) title = heading.textContent.trim();
      let category = null;
      if (heading && paras[0] && heading.previousElementSibling === paras[0]) {
        [category] = paras;
        category.className = 'cards-article-card-category';
        const label = category.textContent.trim();
        li.dataset.category = toKey(label);
        if (label && !categories.includes(label)) categories.push(label);
      }
      const last = paras.at(-1);
      if (last && last !== category) last.classList.add('cards-article-card-meta');
    });

    if (emptyImage) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.classList.add('cards-article-card-image-icon');
      icon.innerHTML = PLACEHOLDER_ICON;
      const label = document.createElement('span');
      label.className = 'cards-article-card-image-label';
      label.textContent = title;
      emptyImage.append(icon, label);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
  buildFilter(block, categories, [...ul.children]);
}
