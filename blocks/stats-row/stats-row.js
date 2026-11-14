/**
 * Stats row: one authored row per statistic — [value] [label].
 * Rebuilt as a list so the numbers read as a set.
 * @param {Element} block the stats-row block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const item = document.createElement('li');
    const [value, label] = row.children;
    if (value) value.className = 'stats-row-number';
    if (label) label.className = 'stats-row-label';
    item.append(...row.children);
    list.append(item);
  });
  block.replaceChildren(list);
}
