import { loadCSS } from '../../scripts/aem.js';

const icon = (size, body) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${body}</svg>`;
const SEARCH_ICON = icon(22, '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2" stroke-linecap="round"></path>');
const CLOCK_ICON = icon(15, '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l2.5 1.5" stroke-linecap="round"></path>');

const RECENT = ['atelier mini', 'cold brew beans', 'nearest café'];
const POPULAR = ['bean subscription', 'flavour dna', 'espresso blend', 'gift sets'];
const TRENDING = [
  {
    name: 'The Atelier', price: '$2,199', href: '/machines/atelier', img: `${window.hlx?.codeBasePath || ''}/blocks/header/media/trending-atelier.jpg`,
  },
  {
    name: 'Morning Blend coffee', price: 'from $10', href: '/beverages/coffee', img: `${window.hlx?.codeBasePath || ''}/blocks/header/media/trending-morning-blend.jpg`,
  },
];
const RESULTS = [
  {
    terms: ['coffee'], label: 'Coffee', sub: 'in Beverages', href: '/beverages/coffee',
  },
];

// teardown waits for the longest transition (--dur-2, 0.6s) plus margin
const HIDE_DELAY = 650;

const state = {};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderResults(query) {
  const { results } = state;
  results.textContent = '';
  const q = query.toLowerCase();
  const matches = RESULTS.filter((r) => r.terms.some((t) => q.includes(t)));
  if (!matches.length) {
    results.append(el('p', 'search-empty', `No results for “${query}”`));
    return;
  }
  matches.forEach(({ label, sub, href }) => {
    const a = el('a', 'search-result');
    a.href = href;
    a.append(el('span', 'search-result-label', label), el('span', 'search-result-sub', sub));
    results.append(a);
  });
}

function render() {
  const query = state.input.value.trim();
  state.defaults.hidden = !!query;
  state.results.hidden = !query;
  if (query) renderResults(query);
}

function focusables() {
  return [...state.modal.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')]
    .filter((node) => !node.hidden && node.offsetParent !== null);
}

function close() {
  const { overlay } = state;
  if (!overlay?.classList.contains('is-open')) return;
  overlay.classList.remove('is-open');
  overlay.inert = true;
  document.body.style.overflow = '';
  // eslint-disable-next-line no-use-before-define
  document.removeEventListener('keydown', onKeydown);
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => { overlay.hidden = true; }, HIDE_DELAY);
  state.trigger?.focus?.();
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
    return;
  }
  if (e.key !== 'Tab') return;
  const items = focusables();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function group(title, content) {
  const section = el('section', 'search-group');
  section.append(el('p', 'search-group-title', title), content);
  return section;
}

function chips(terms, withClock) {
  const list = el('div', 'search-chips');
  terms.forEach((term) => {
    const chip = el('button', 'search-chip');
    chip.type = 'button';
    chip.dataset.query = term;
    chip.innerHTML = withClock ? `<span class="search-chip-icon">${CLOCK_ICON}</span>` : '';
    chip.append(el('span', '', term));
    list.append(chip);
  });
  return list;
}

function trending() {
  const list = el('div', 'search-trending');
  TRENDING.forEach(({
    name, price, href, img,
  }) => {
    const a = el('a', 'search-trending-item');
    a.href = href;
    // thumbnails ship with the code (the source bakes them into its search widget, not authored)
    const picture = el('picture', 'search-trending-thumb');
    const image = document.createElement('img');
    image.src = img;
    image.alt = '';
    image.loading = 'lazy';
    picture.append(image);
    image.width = 56;
    image.height = 56;
    image.addEventListener('error', () => picture.classList.add('is-empty'));
    a.append(picture, el('span', 'search-trending-name', name), el('span', 'search-trending-price', price));
    list.append(a);
  });
  return list;
}

function build() {
  const overlay = el('div', 'search-overlay');
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true" aria-label="Site search">
      <div class="search-bar">
        <span class="search-bar-icon">${SEARCH_ICON}</span>
        <input class="search-input" type="search" autocomplete="off"
          placeholder="Search products, guides, cafés…" aria-label="Search products, guides, cafés">
        <button class="search-esc" type="button" aria-label="Close search">ESC</button>
      </div>
      <div class="search-body">
        <div class="search-default"></div>
        <div class="search-results" role="status" aria-live="polite" hidden></div>
      </div>
    </div>`;
  Object.assign(state, {
    overlay,
    modal: overlay.querySelector('.search-modal'),
    input: overlay.querySelector('.search-input'),
    defaults: overlay.querySelector('.search-default'),
    results: overlay.querySelector('.search-results'),
  });
  state.defaults.append(
    group('Recent', chips(RECENT, true)),
    group('Popular searches', chips(POPULAR, false)),
    group('Trending now', trending()),
  );

  state.input.addEventListener('input', render);
  state.defaults.addEventListener('click', (e) => {
    const chip = e.target.closest('.search-chip');
    if (!chip) return;
    state.input.value = chip.dataset.query;
    render();
    state.input.focus();
  });
  overlay.querySelector('.search-esc').addEventListener('click', close);
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) close();
  });
  document.body.append(overlay);
}

/**
 * Opens the site search dialog (built on first use).
 * @param {Element} trigger element that receives focus back on close
 */
export default function openSearch(trigger) {
  loadCSS(`${window.hlx?.codeBasePath || ''}/blocks/header/search.css`);
  if (!state.overlay) build();
  const { overlay } = state;
  state.trigger = trigger || document.activeElement;
  clearTimeout(state.hideTimer);
  if (overlay.hidden) {
    overlay.hidden = false;
    // reflow so the opening transition starts from the closed state
    overlay.getBoundingClientRect();
  }
  overlay.classList.add('is-open');
  overlay.inert = false;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKeydown);
  state.input.value = '';
  render();
  state.input.focus();
}
