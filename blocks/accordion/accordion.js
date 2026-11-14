const CHECK_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12 5 5 9-11" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEVRON_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let groupSeq = 0;

const span = (className, html) => {
  const node = document.createElement('span');
  if (className) node.className = className;
  if (html) {
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = html;
  }
  return node;
};

/**
 * Accordion of native <details>, single-open (shared name), first item open.
 * Rows: optional one-cell head row, then [summary] [answer].
 * A set with no question ("?") summaries is a claims list and gets check icons.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let head = null;
  if (rows[0].children.length === 1) {
    head = document.createElement('div');
    head.className = 'accordion-head';
    head.append(...rows.shift().firstElementChild.children);
  }

  const items = rows
    .map((row) => [...row.children])
    .filter(([summary]) => summary?.textContent.trim());
  const isClaims = items.length > 0 && !items.some(([s]) => s.textContent.trim().endsWith('?'));
  block.classList.toggle('accordion-checks', isClaims);
  groupSeq += 1;

  const list = document.createElement('div');
  list.className = 'accordion-items';
  items.forEach(([summaryCell, bodyCell], i) => {
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.name = `accordion-${groupSeq}`;
    details.open = i === 0;

    const label = span('accordion-label');
    if (isClaims) label.append(span('accordion-check', CHECK_ICON));
    const text = span();
    text.textContent = summaryCell.textContent.trim();
    label.append(text);

    const summary = document.createElement('summary');
    summary.className = 'accordion-summary';
    summary.append(label, span('accordion-chevron', CHEVRON_ICON));

    const body = document.createElement('div');
    body.className = 'accordion-body';
    if (bodyCell) {
      const p = document.createElement('p');
      p.textContent = (bodyCell.querySelector('p') || bodyCell).textContent.trim();
      body.append(p);
    }
    details.append(summary, body);
    list.append(details);
  });

  block.replaceChildren(...(head ? [head] : []), list);
}
