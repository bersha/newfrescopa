function span(className, text) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

/**
 * Event cards: one row per event, a single cell of default content —
 * day, title, description and a last "time price" line (e.g. "6:30–7:30pm Free").
 * The last line becomes a footer with the price (its final word) split off.
 * @param {Element} block the cards-event block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const parts = [...cell.children];
    const day = parts[0]?.tagName === 'P' ? parts[0] : null;
    day?.classList.add('cards-event-day');

    const last = parts[parts.length - 1];
    if (last && last !== day && last.tagName === 'P') {
      const text = last.textContent.trim();
      const footer = document.createElement('div');
      footer.className = 'cards-event-footer';
      const m = text.match(/^(.*?)\s+(\S+)$/);
      if (m) footer.append(span('cards-event-time', m[1]), span('cards-event-price', m[2]));
      else footer.textContent = text;
      last.replaceWith(footer);
    }

    [...cell.children].forEach((el) => {
      if (/^H[1-6]$/.test(el.tagName)) el.classList.add('cards-event-title');
      else if (el.tagName === 'P' && el !== day) el.classList.add('cards-event-desc');
    });

    const item = document.createElement('li');
    item.append(...cell.children);
    list.append(item);
  });
  block.replaceChildren(list);
}
