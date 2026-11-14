/**
 * Taste profile: editorial copy (row 1) beside a six-axis flavour radar with
 * profile toggles (rows 2+).
 *
 * Profile rows: label | readout title | readout note | six comma-separated
 * 0–1 values (Strength, Body, Sweetness, Smoothness, Warmth, Crema).
 * Cells after the label are optional. For the known labels (Weekday, Slow
 * Sunday, After dinner) the site's canonical readout copy and values apply,
 * as on the source site; authored values in cell 4 still override. A row with
 * class "active" or a bold label starts selected.
 */

const AXES = ['Strength', 'Body', 'Sweetness', 'Smoothness', 'Warmth', 'Crema'];

// Point-list items flatten to "<Label> <text>" on import; split them back.
const POINT_LABELS = ['Remembered', 'Adaptive', 'Yours everywhere'];

const PROFILES = {
  weekday: {
    title: 'The weekday cup',
    note: 'Brisk and a little bolder. Enough to meet the day, never so much it rushes you.',
    values: [0.92, 0.62, 0.34, 0.5, 0.66, 0.82],
  },
  'slow-sunday': {
    title: 'The slow Sunday',
    note: 'Softer and rounder, made for lingering. It knows there is nowhere you need to be.',
    values: [0.58, 0.8, 0.6, 0.88, 0.84, 0.62],
  },
  'after-dinner': {
    title: 'The after-dinner cup',
    note: 'Gentle and sweet, half the strength. A quiet close to the evening, not a second start.',
    values: [0.34, 0.7, 0.78, 0.74, 0.9, 0.5],
  },
};

const SVGNS = 'http://www.w3.org/2000/svg';
const CX = 210;
const CY = 206;
const RADIUS = 138;
const RINGS = [0.25, 0.5, 0.75, 1];
const CYCLE_MS = 3000;

const toKey = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const point = (i, v) => {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return [CX + RADIUS * v * Math.cos(a), CY + RADIUS * v * Math.sin(a)];
};
const fmt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
const easeExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

function svgEl(name, attrs = {}) {
  const node = document.createElementNS(SVGNS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function buildRadar() {
  const svg = svgEl('svg', {
    viewBox: '0 0 420 420',
    role: 'img',
    'aria-label': 'Flavour profile radar showing six taste dimensions.',
    class: 'taste-profile-radar',
  });

  const grid = svgEl('g', { class: 'tp-grid' });
  RINGS.forEach((r, idx) => grid.append(svgEl('polygon', {
    points: AXES.map((_, i) => fmt(point(i, r))).join(' '),
    fill: 'none',
    stroke: 'var(--line)',
    'stroke-width': idx === RINGS.length - 1 ? '1.4' : '1',
  })));

  const axes = svgEl('g', { class: 'tp-axes' });
  AXES.forEach((label, i) => {
    const [ox, oy] = point(i, 1);
    axes.append(svgEl('line', {
      x1: CX, y1: CY, x2: ox.toFixed(1), y2: oy.toFixed(1), stroke: 'var(--line)', 'stroke-width': '1',
    }));
    const [lx, ly] = point(i, 1.19);
    let anchor = 'middle';
    if (lx > CX + 1) anchor = 'start';
    else if (lx < CX - 1) anchor = 'end';
    const text = svgEl('text', {
      x: lx.toFixed(1), y: ly.toFixed(1), 'text-anchor': anchor, 'dominant-baseline': 'middle', class: 'tp-label',
    });
    text.textContent = label;
    axes.append(text);
  });

  const area = svgEl('polygon', {
    class: 'tp-area', points: '', fill: 'var(--terracotta-fill)', stroke: 'var(--terracotta)', 'stroke-width': '2',
  });
  svg.append(grid, axes, area);
  const dots = AXES.map(() => {
    const dot = svgEl('circle', {
      cx: CX, cy: CY, r: '3.6', class: 'tp-dot',
    });
    svg.append(dot);
    return dot;
  });
  return { svg, area, dots };
}

function readProfile(row) {
  const cells = [...row.children];
  const label = cells[0]?.textContent.trim() || '';
  const known = PROFILES[toKey(label)] || {};
  let values = cells[3]?.textContent.split(',').map((n) => parseFloat(n)).filter((n) => !Number.isNaN(n));
  if (values?.length !== AXES.length) values = known.values || AXES.map(() => 0.5);
  return {
    label,
    // The site defines the readout for its known profiles in code, so the
    // canonical copy wins for those; other labels use the authored cells.
    title: known.title || cells[1]?.textContent.trim() || label,
    note: known.note || cells[2]?.textContent.trim() || '',
    values,
    active: row.classList.contains('active') || !!cells[0]?.querySelector('strong, b'),
  };
}

function splitPoints(copy) {
  copy.querySelectorAll('ul > li').forEach((item) => {
    const text = item.textContent.trim();
    const label = POINT_LABELS.find((l) => text.toLowerCase().startsWith(l.toLowerCase()));
    if (!label) return;
    const labelEl = document.createElement('span');
    labelEl.className = 'taste-profile-pt-label';
    labelEl.textContent = label;
    const textEl = document.createElement('span');
    textEl.className = 'taste-profile-pt-text';
    textEl.textContent = text.slice(label.length).trim();
    item.replaceChildren(labelEl, textEl);
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const copy = document.createElement('div');
  copy.className = 'taste-profile-copy';
  copy.append(...rows.shift().children);
  copy.querySelector('p')?.classList.add('eyebrow');
  splitPoints(copy);

  const profiles = rows.map(readProfile).filter((p) => p.label);

  const viz = document.createElement('div');
  viz.className = 'taste-profile-viz';
  block.replaceChildren(copy, viz);
  if (!profiles.length) return;

  const frame = document.createElement('div');
  frame.className = 'taste-profile-frame';
  const { svg, area, dots } = buildRadar();
  const readout = document.createElement('div');
  readout.className = 'taste-profile-readout';
  const title = document.createElement('h4');
  const note = document.createElement('p');
  readout.append(title, note);
  frame.append(svg, readout);

  const controls = document.createElement('div');
  controls.className = 'taste-profile-controls';
  viz.append(frame, controls);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = AXES.map(() => 0);
  let raf = null;
  const render = (vals) => {
    area.setAttribute('points', vals.map((v, i) => fmt(point(i, v))).join(' '));
    dots.forEach((dot, i) => {
      const [x, y] = point(i, vals[i]);
      dot.setAttribute('cx', x.toFixed(1));
      dot.setAttribute('cy', y.toFixed(1));
    });
  };
  const animateTo = (target, dur = 820) => {
    if (raf) cancelAnimationFrame(raf);
    if (reduceMotion) {
      current = target.slice();
      render(current);
      return;
    }
    const from = current.slice();
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = easeExpo(t);
      current = from.map((v, i) => v + (target[i] - v) * e);
      render(current);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  let activeIndex = Math.max(0, profiles.findIndex((p) => p.active));
  let timer = null;
  const buttons = profiles.map((profile, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'taste-profile-btn';
    btn.textContent = profile.label;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      clearTimeout(timer);
      timer = null;
      // eslint-disable-next-line no-use-before-define
      select(i);
    });
    controls.append(btn);
    return btn;
  });

  function select(i, animate = true, dur = 820) {
    activeIndex = i;
    title.textContent = profiles[i].title;
    note.textContent = profiles[i].note;
    buttons.forEach((b, j) => {
      b.classList.toggle('is-active', j === i);
      b.setAttribute('aria-pressed', String(j === i));
    });
    if (animate) animateTo(profiles[i].values, dur);
  }

  // Auto-cycle the profiles until the visitor picks one.
  const cycle = () => {
    if (reduceMotion || profiles.length < 2) return;
    timer = setTimeout(() => {
      select((activeIndex + 1) % profiles.length);
      cycle();
    }, CYCLE_MS);
  };

  select(activeIndex, false);
  if (reduceMotion) {
    render(profiles[activeIndex].values);
    return;
  }

  // Bloom outward from the centre when scrolled into view.
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    animateTo(profiles[activeIndex].values, 1100);
    cycle();
  }, { threshold: 0.35 });
  observer.observe(block);
}
