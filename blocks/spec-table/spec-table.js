const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const txt = (node) => (node ? node.textContent.trim() : '');

/**
 * Specification groups. Rows: optional one-cell head (eyebrow + h2, no h3),
 * then [group h3] [ul of "Label — Value"]. An "In the box" group renders as a
 * plain list card under the grid.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let head = null;
  if (rows[0].children.length === 1 && !rows[0].querySelector('h3')) {
    head = el('div', 'spec-table-head');
    head.append(...rows.shift().children);
  }

  const grid = el('div', 'spec-table-grid');
  let inBox = null;
  rows.forEach((row) => {
    const [titleCell, listCell = titleCell] = [...row.children];
    const title = txt(titleCell.querySelector('h3') || titleCell);
    const items = [...listCell.querySelectorAll('li')];

    if (/in the box/i.test(title)) {
      inBox = el('div', 'spec-table-inbox');
      const ul = el('ul');
      items.forEach((li) => ul.append(el('li', null, txt(li).replace(/^[—–-]\s*/, ''))));
      inBox.append(el('h3', null, title), ul);
      return;
    }

    const dl = el('dl');
    items.forEach((li) => {
      const parts = [...li.children];
      const [label, ...rest] = parts.length >= 2
        ? [txt(parts[0]), txt(parts[1])]
        : txt(li).split(/\s+[—–-]\s+/);
      const pair = el('div', 'spec-table-row');
      pair.append(el('dt', null, label), el('dd', null, rest.join(' — ')));
      dl.append(pair);
    });
    const card = el('div', 'spec-table-card');
    card.append(el('h3', null, title), dl);
    grid.append(card);
  });

  block.replaceChildren(...[head, grid, inBox].filter(Boolean));
}
