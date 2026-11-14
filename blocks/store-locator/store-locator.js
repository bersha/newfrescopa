import { loadCSS, loadScript } from '../../scripts/aem.js';

/**
 * Store locator.
 * One authored row per café: [name] [city] [address] [amenities] [hours] [directions link].
 * An optional leading row holding only an image (a legacy static map) is dropped.
 * Renders a search box + region filters, a Leaflet/OpenStreetMap map and a live-filtered
 * card list. Addresses are geocoded through Nominatim (throttled, cached per session)
 * to drop pins; selecting a card flies the map to it.
 */

const BASE = window.hlx?.codeBasePath || '';
const LEAFLET = `${BASE}/blocks/store-locator/vendor/leaflet`;
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const THROTTLE_MS = 1100; // Nominatim usage policy: max 1 request / second
const CACHE_KEY = 'store-locator-geocode-v1';
const START = { center: [39.5, -98.35], zoom: 4 };
const REGIONS = ['All regions', 'East', 'Midwest', 'South', 'West'];
const CELL_ROLES = ['name', 'city', 'address', 'chips', 'hours', 'actions'];

const lower = (text) => (text || '').toLowerCase();

/* ---------- geocoding: one request at a time, cached ---------- */

const cache = new Map();

function loadGeoCache() {
  try {
    Object.entries(JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}'))
      .forEach(([k, v]) => cache.set(k, v));
  } catch (e) { /* storage unavailable */ }
}

function saveGeoCache() {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch (e) { /* storage unavailable */ }
}

let queue = Promise.resolve();
const pause = () => new Promise((r) => { setTimeout(r, THROTTLE_MS); });

function geocode(address) {
  const key = lower(address).trim();
  if (!key) return Promise.resolve(null);
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  const job = queue.then(async () => {
    if (cache.has(key)) return cache.get(key);
    try {
      const url = `${NOMINATIM}?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(address)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const [hit] = res.ok ? await res.json() : [];
      if (!hit) return null;
      const loc = { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
      cache.set(key, loc);
      saveGeoCache();
      return loc;
    } catch (e) {
      return null;
    }
  });
  queue = job.then(pause, pause);
  return job;
}

/* ---------- cards ---------- */

function buildCard(row) {
  let cells = [...row.children];
  if (cells[0]?.querySelector('picture, img') && !cells[0].textContent.trim()) cells = cells.slice(1);
  cells.forEach((cell, i) => { cell.className = `store-locator-card-${CELL_ROLES[i] || 'extra'}`; });
  const [name, city, address] = cells;

  const card = document.createElement('article');
  card.className = 'store-locator-card';
  card.dataset.region = lower(row.dataset.region || row.firstElementChild?.dataset.region || 'all');
  if (name) card.dataset.name = name.textContent.trim();
  if (address) card.dataset.address = address.textContent.trim();

  const body = document.createElement('div');
  body.className = 'store-locator-card-body';
  if (name && city) {
    const head = document.createElement('div');
    head.className = 'store-locator-card-head';
    head.append(name, city);
    body.append(head, ...cells.slice(2));
  } else {
    body.append(...cells);
  }
  card.append(body);
  card.dataset.search = lower(card.textContent);
  return card;
}

function buildControls() {
  const controls = document.createElement('div');
  controls.className = 'store-locator-controls';
  const searchWrap = document.createElement('div');
  searchWrap.className = 'store-locator-search';
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search by city, neighborhood or address';
  search.setAttribute('aria-label', 'Search locations');
  searchWrap.append(search);

  const filters = document.createElement('div');
  filters.className = 'store-locator-regions';
  const buttons = REGIONS.map((label, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.region = i ? lower(label) : 'all';
    button.classList.toggle('is-active', !i);
    return button;
  });
  filters.append(...buttons);
  controls.append(searchWrap, filters);
  return { controls, search, buttons };
}

/* ---------- map ---------- */

async function initMap(canvas, cards) {
  await Promise.all([loadCSS(`${LEAFLET}.css`), loadScript(`${LEAFLET}.js`)]);
  const { L } = window;
  if (!L) return; // the list keeps working without a map

  const map = L.map(canvas, { ...START, scrollWheelZoom: false, zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // The canvas only gets its final size after layout settles (sticky + aspect-ratio).
  const resize = () => map.invalidateSize(false);
  requestAnimationFrame(resize);
  [100, 300, 600].forEach((ms) => setTimeout(resize, ms));
  let size = `${canvas.offsetWidth}x${canvas.offsetHeight}`;
  new ResizeObserver(() => {
    const now = `${canvas.offsetWidth}x${canvas.offsetHeight}`;
    if (now !== size) { size = now; resize(); }
  }).observe(canvas);

  const icon = L.divIcon({
    className: 'store-locator-pin',
    html: '<span class="store-locator-pin-dot"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });

  const markers = new Map();
  const activate = (card) => cards.forEach((c) => c.classList.toggle('is-active', c === card));

  const pin = (card, { lat, lon }) => {
    if (markers.has(card)) return markers.get(card);
    const popup = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = card.dataset.name || '';
    popup.append(strong, document.createElement('br'), card.dataset.address || '');
    const marker = L.marker([lat, lon], { icon }).addTo(map).bindPopup(popup);
    marker.on('click', () => {
      activate(card);
      card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    markers.set(card, marker);
    return marker;
  };

  const select = async (card) => {
    activate(card);
    card.classList.add('is-locating');
    const loc = await geocode(card.dataset.address);
    card.classList.remove('is-locating');
    if (!loc) return;
    const marker = pin(card, loc);
    map.flyTo([loc.lat, loc.lon], 14, { duration: 0.8 });
    marker.openPopup();
  };

  const located = cards.filter((c) => c.dataset.address);
  located.forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) select(card);
    });
    card.addEventListener('keydown', (e) => {
      if (e.target.closest('a') || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      select(card);
    });
  });

  // Drop every pin progressively; centre on the first visible café once it resolves.
  const first = located.find((c) => !c.hidden);
  located.forEach(async (card) => {
    const loc = await geocode(card.dataset.address);
    if (!loc) return;
    pin(card, loc);
    if (card === first) map.setView([loc.lat, loc.lon], 11);
  });
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows[0]?.children.length === 1 && rows[0].querySelector('picture, img')
    && !rows[0].textContent.trim()) rows.shift();
  const cards = rows.map(buildCard);

  const { controls, search, buttons } = buildControls();

  const layout = document.createElement('div');
  layout.className = 'store-locator-layout';
  const mapPanel = document.createElement('div');
  mapPanel.className = 'store-locator-map';
  const canvas = document.createElement('div');
  canvas.className = 'store-locator-map-canvas';
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', 'Map of café locations');
  mapPanel.append(canvas);

  const listPanel = document.createElement('div');
  listPanel.className = 'store-locator-list';
  const count = document.createElement('p');
  count.className = 'store-locator-count';
  count.setAttribute('aria-live', 'polite');
  const list = document.createElement('div');
  list.className = 'store-locator-cards';
  list.append(...cards);
  listPanel.append(count, list);
  layout.append(mapPanel, listPanel);
  block.replaceChildren(controls, layout);

  let region = 'all';
  const filter = () => {
    const term = lower(search.value);
    let shown = 0;
    cards.forEach((card) => {
      card.hidden = !((region === 'all' || card.dataset.region === region)
        && (!term || card.dataset.search.includes(term)));
      if (!card.hidden) shown += 1;
    });
    count.textContent = `${shown} café${shown === 1 ? '' : 's'} near you`;
  };
  search.addEventListener('input', filter);
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.toggle('is-active', b === button));
    region = button.dataset.region;
    filter();
  }));
  filter();

  loadGeoCache();
  await initMap(canvas, cards);
}
