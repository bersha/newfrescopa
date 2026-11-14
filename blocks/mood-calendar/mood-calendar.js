/**
 * Mood calendar: editorial copy (row 1) beside a calendar card whose days
 * switch a brew readout.
 *
 * Optional header row: month | year (e.g. "March" | "2026").
 * Day rows: day number | brew tag | brew title | brew note.
 * Authored days become buttons; the numbers between them render as muted
 * cells so the grid reads as a real week. The first day (or a row with class
 * "active" / a bold day) starts selected.
 */

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CYCLE_MS = 3000;
const isNum = (s) => s !== '' && !Number.isNaN(Number(s));

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const copy = make('div', 'mood-calendar-copy');
  copy.append(...rows.shift().children);

  let month = 'March';
  let year = '2026';
  const headCells = rows[0] ? [...rows[0].children].map((c) => c.textContent.trim()) : [];
  if (headCells.length === 2 && !isNum(headCells[0]) && isNum(headCells[1])) {
    [month, year] = headCells;
    rows.shift();
  }

  const days = rows.map((row) => {
    const cells = [...row.children];
    const text = (i) => cells[i]?.textContent.trim() || '';
    return {
      day: text(0),
      tag: text(1),
      title: text(2),
      note: text(3),
      active: row.classList.contains('active') || !!cells[0]?.querySelector('strong, b'),
    };
  }).filter((d) => d.day);

  const head = make('div', 'mood-calendar-head');
  head.append(make('span', 'mood-calendar-month', month), make('span', 'mood-calendar-year', year));

  const grid = make('div', 'mood-calendar-grid');
  DOW.forEach((d) => grid.append(make('span', 'mood-calendar-dow', d)));

  const brew = make('div', 'mood-calendar-brew');
  const brewTag = make('span', 'mood-calendar-tag');
  const brewTitle = make('h4', 'mood-calendar-title');
  const brewNote = make('p', 'mood-calendar-note');
  brew.append(brewTag, brewTitle, brewNote);

  const entries = [];
  let timer = null;
  let activeIdx = 0;
  const select = (idx) => {
    activeIdx = idx;
    const { info } = entries[idx];
    brewTag.textContent = info.tag;
    brewTitle.textContent = info.title;
    brewNote.textContent = info.note;
    entries.forEach(({ btn }, j) => {
      btn.classList.toggle('is-active', j === idx);
      btn.setAttribute('aria-pressed', String(j === idx));
    });
  };
  const addButton = (info) => {
    const btn = make('button', 'mood-calendar-day', info.day);
    btn.type = 'button';
    const idx = entries.length;
    btn.addEventListener('click', () => {
      clearTimeout(timer);
      timer = null;
      select(idx);
    });
    entries.push({ info, btn });
    grid.append(btn);
  };

  const numeric = days.every((d) => isNum(d.day));
  if (numeric && days.length) {
    const byNum = new Map(days.map((d) => [Number(d.day), d]));
    const nums = [...byNum.keys()];
    for (let n = Math.min(...nums); n <= Math.max(...nums); n += 1) {
      if (byNum.has(n)) addButton(byNum.get(n));
      else grid.append(make('span', 'mood-calendar-day mood-calendar-muted', String(n)));
    }
  } else {
    days.forEach(addButton);
  }

  const cal = make('div', 'mood-calendar-cal');
  cal.append(head, grid);
  const panel = make('div', 'mood-calendar-panel');
  panel.append(cal, brew);
  block.replaceChildren(copy, panel);

  if (!entries.length) return;
  select(Math.max(0, entries.findIndex(({ info }) => info.active)));

  // Auto-cycle the days once in view, until the visitor picks one.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || entries.length < 2) return;
  const cycle = () => {
    timer = setTimeout(() => {
      select((activeIdx + 1) % entries.length);
      cycle();
    }, CYCLE_MS);
  };
  const observer = new IntersectionObserver((list) => {
    if (!list.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    cycle();
  }, { threshold: 0.35 });
  observer.observe(block);
}
