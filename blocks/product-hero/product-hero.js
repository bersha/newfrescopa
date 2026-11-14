import { createOptimizedPicture } from '../../scripts/aem.js';

const STAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';

const TRUST_ICONS = {
  delivery: '<path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" stroke-linejoin="round"></path><circle cx="7" cy="18" r="1.6"></circle><circle cx="17.5" cy="18" r="1.6"></circle>',
  guarantee: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke-linejoin="round"></path><path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"></path>',
  returns: '<path d="M4 12a8 8 0 1 1 2.3 5.6" stroke-linecap="round"></path><path d="M4 6v5h5" stroke-linecap="round" stroke-linejoin="round"></path>',
};

// The live block renders these reassurance lines when the document carries
// none (the authored document has lost them); authored trust lines win.
const DEFAULT_TRUST = [
  "Free delivery, and we'll set it up for you.",
  'Two-year workshop guarantee.',
  'Thirty mornings to fall for it, or send it back.',
];
const TRUST_RE = /deliver|guarantee|warranty|return|morning|trial|set it up|send it back|free/i;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const txt = (node) => (node ? node.textContent.trim() : '');

function trustIcon(text) {
  let key = 'guarantee';
  if (/deliver|set it up|ship/i.test(text)) key = 'delivery';
  else if (/return|send it back|morning|trial|fall for/i.test(text)) key = 'returns';
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${TRUST_ICONS[key]}</svg>`;
}

function buildGallery(cell) {
  const gallery = el('div', 'product-hero-gallery');
  const imgs = [...(cell?.querySelectorAll('picture > img') || [])]
    .map((img) => createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]).querySelector('img'));
  const stage = el('div', 'product-hero-stage');
  gallery.append(stage);
  if (!imgs.length) return gallery;

  const main = imgs[0].cloneNode(true);
  main.removeAttribute('width');
  main.removeAttribute('height');
  stage.append(main);
  if (imgs.length < 2) return gallery;

  const thumbs = el('div', 'product-hero-thumbs');
  imgs.forEach((img, i) => {
    const btn = el('button', 'product-hero-thumb');
    btn.type = 'button';
    btn.classList.toggle('is-active', i === 0);
    btn.setAttribute('aria-label', img.alt || `View image ${i + 1}`);
    const thumb = img.cloneNode(true);
    thumb.alt = '';
    btn.append(thumb);
    btn.addEventListener('click', () => {
      main.src = img.src;
      main.alt = img.alt || '';
      thumbs.querySelectorAll('.product-hero-thumb').forEach((b) => b.classList.toggle('is-active', b === btn));
    });
    thumbs.append(btn);
  });
  gallery.append(thumbs);
  return gallery;
}

function buildBreadcrumb(p, current) {
  const nav = el('nav', 'product-hero-breadcrumb');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const links = [...p.querySelectorAll('a')];
  if (links.length) {
    links.forEach((a) => {
      const link = el('a', null, txt(a));
      link.href = a.getAttribute('href') || '#';
      nav.append(link, ' / ');
    });
    const here = el('span', null, current || txt(p).split('/').pop().trim());
    here.setAttribute('aria-current', 'page');
    nav.append(here);
  } else {
    const parts = txt(p).split('/').map((s) => s.trim()).filter(Boolean);
    parts.forEach((part, i) => {
      const span = el('span', null, part);
      if (i === parts.length - 1) span.setAttribute('aria-current', 'page');
      nav.append(span);
      if (i < parts.length - 1) nav.append(' / ');
    });
  }
  return nav;
}

function buildFinish(labelP, finishes) {
  const wrap = el('div', 'product-hero-finish');
  const label = el('p', 'product-hero-finish-label', labelP ? txt(labelP) : 'Finish');
  wrap.append(label);
  if (!finishes.length) return wrap;
  const swatches = el('div', 'product-hero-swatches');
  finishes.forEach((name, i) => {
    const btn = el('button', 'product-hero-swatch');
    btn.type = 'button';
    btn.dataset.finish = name.toLowerCase();
    btn.classList.toggle('is-active', i === 0);
    btn.setAttribute('aria-label', name);
    btn.addEventListener('click', () => {
      swatches.querySelectorAll('.product-hero-swatch').forEach((s) => s.classList.toggle('is-active', s === btn));
      label.textContent = `Finish — ${name}`;
    });
    swatches.append(btn);
  });
  wrap.append(swatches);
  return wrap;
}

function buildActions() {
  const actions = el('div', 'product-hero-actions');
  const qty = el('div', 'product-hero-qty');
  let count = 1;
  const num = el('span', null, '1');
  const step = (label, sign, delta) => {
    const b = el('button', null, sign);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.addEventListener('click', () => {
      count = Math.max(1, count + delta);
      num.textContent = String(count);
    });
    return b;
  };
  qty.append(step('Decrease quantity', '−', -1), num, step('Increase quantity', '+', 1));
  const cart = el('button', 'product-hero-cart', 'Add to cart');
  cart.type = 'button';
  actions.append(qty, cart);
  return actions;
}

/**
 * Product hero / buy panel.
 * Row: [gallery pictures] [breadcrumb · eyebrow · h1 · rating · lede · price ·
 * finance · "Finish — X" · "Finishes: a, b, c" · trust lines?] — matched by content.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  if (!cells.length) return;
  const galleryCell = cells.find((c) => c.querySelector('picture')) || cells[0];
  const buyCell = cells.find((c) => c !== galleryCell) || cells.at(-1);

  const kids = [...buyCell.children];
  const at = (node) => kids.indexOf(node);
  const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
  const headingIdx = heading ? at(heading) : 0;
  const paras = kids.filter((k) => k.tagName === 'P');

  const crumb = paras.find((p) => at(p) < headingIdx && (p.querySelector('a') || txt(p).includes('/')));
  const rating = paras.find((p) => /review|★|·/.test(txt(p)) && /\d/.test(txt(p)) && txt(p).length < 40);
  const price = paras.find((p) => /^[$£€]\s?\d/.test(txt(p)));
  const finance = paras.find((p) => /\/mo|month/i.test(txt(p)));
  const finishes = paras.find((p) => /^finishes:/i.test(txt(p)));
  const finishLabel = paras.find((p) => p !== finishes && /^finish/i.test(txt(p)));
  const eyebrow = paras.find((p) => at(p) < headingIdx && txt(p).length < 32
    && ![crumb, rating, price, finance, finishLabel].includes(p));
  const priceIdx = price ? at(price) : headingIdx;
  const trust = paras.filter((p) => at(p) > priceIdx && p !== finishLabel && p !== finishes
    && TRUST_RE.test(txt(p)));
  const used = [crumb, rating, price, finance, finishes, finishLabel, eyebrow, ...trust];
  const lede = paras.find((p) => !used.includes(p) && txt(p).length >= 32
    && at(p) > headingIdx && at(p) < priceIdx);

  const panel = el('div', 'product-hero-panel');
  if (eyebrow) panel.append(el('span', 'product-hero-eyebrow', txt(eyebrow)));
  if (heading) {
    const h1 = el('h1', 'product-hero-name', txt(heading));
    if (heading.id) h1.id = heading.id;
    panel.append(h1);
  }
  if (rating) {
    const a = el('a', 'product-hero-rating');
    a.href = '#reviews';
    const stars = el('span', 'product-hero-stars');
    stars.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 5; i += 1) stars.append(Object.assign(el('span', 'product-hero-star'), { innerHTML: STAR }));
    a.append(stars, el('span', 'product-hero-rating-text', txt(rating)));
    panel.append(a);
  }
  if (lede) panel.append(el('p', 'product-hero-lede', txt(lede)));
  if (price || finance) {
    const row = el('div', 'product-hero-price');
    if (price) row.append(el('span', 'product-hero-amount', txt(price)));
    if (finance) row.append(el('span', 'product-hero-finance', txt(finance)));
    panel.append(row);
  }
  const finishNames = finishes
    ? txt(finishes).replace(/^finishes:\s*/i, '').split(',').map((s) => s.trim())
      .filter(Boolean)
    : [...(buyCell.querySelector('ul')?.children || [])].map(txt);
  if (finishLabel || finishNames.length) panel.append(buildFinish(finishLabel, finishNames));
  panel.append(buildActions());

  const list = el('ul', 'product-hero-trust');
  (trust.length ? trust.map(txt) : DEFAULT_TRUST).forEach((line) => {
    const li = el('li');
    const icon = el('span', 'product-hero-trust-icon');
    icon.innerHTML = trustIcon(line);
    li.append(icon, el('span', null, line));
    list.append(li);
  });
  panel.append(list);

  const grid = el('div', 'product-hero-grid');
  grid.append(buildGallery(galleryCell), panel);
  const inner = el('div', 'product-hero-inner');
  if (crumb) inner.append(buildBreadcrumb(crumb, txt(heading)));
  inner.append(grid);
  block.replaceChildren(inner);
}
