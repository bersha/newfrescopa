/**
 * Machine filter — pill tab bar that shows/hides product-family sections.
 * Each row: [label] [family key | "all"]. Sections opt in through their
 * `data-family` section metadata. Client-side only.
 */
const toKey = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function decorate(block) {
  const tabs = [...block.children].map((row) => {
    const [labelCell, keyCell] = row.children;
    const label = labelCell?.textContent.trim();
    if (!label) return null;
    const family = keyCell?.textContent.trim() || label;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'machine-filter-tab';
    btn.textContent = label;
    btn.dataset.family = family.toLowerCase() === 'all' ? 'all' : toKey(family);
    btn.setAttribute('aria-pressed', 'false');
    return btn;
  }).filter(Boolean);

  const select = (key) => {
    document.querySelectorAll('main .section[data-family]').forEach((section) => {
      section.classList.toggle('is-filtered-out', key !== 'all' && section.dataset.family !== key);
    });
    tabs.forEach((tab) => {
      const on = tab.dataset.family === key;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-pressed', String(on));
    });
  };

  const bar = document.createElement('div');
  bar.className = 'machine-filter-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter by type');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab.dataset.family));
    bar.append(tab);
  });
  block.replaceChildren(bar);
  if (tabs.length) select(tabs[0].dataset.family);
}
