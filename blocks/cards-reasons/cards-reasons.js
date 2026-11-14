import { createOptimizedPicture } from '../../scripts/aem.js';

/* Line icons used when the author leaves the icon cell empty (the source
   design ships these as code, keyed by card position). */
const ICONS = [
  // cup
  '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M7 4c0 .8-.5 1.2-.5 2M11 4c0 .8-.5 1.2-.5 2"/>',
  // machine
  '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  // people
  '<circle cx="9" cy="8" r="3"/><path d="M15 11a3 3 0 1 0-2-5.24"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M17 20a5 5 0 0 0-3-4.58"/>',
  // sofa
  '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 12a2 2 0 0 1 2 2v3h16v-3a2 2 0 0 1 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2v1H6v-1a2 2 0 0 0-2-2 2 2 0 0 0-2 2Z"/>',
];

function lineIcon(index) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.entries({
    width: 30,
    height: 30,
    viewBox: '0 0 24 24',
    fill: 'none',
    'stroke-width': 1.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  }).forEach(([k, v]) => svg.setAttribute(k, v));
  svg.innerHTML = ICONS[index % ICONS.length];
  return svg;
}

/**
 * Reasons cards: one row per card — [icon (optional/empty)] [heading + copy].
 * @param {Element} block the cards-reasons block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row, i) => {
    const item = document.createElement('li');
    item.append(...row.children);
    let icon = null;
    [...item.children].forEach((cell) => {
      if (cell.querySelector('h1, h2, h3, h4, h5, h6, p')) {
        cell.className = 'cards-reasons-card-body';
      } else {
        cell.className = 'cards-reasons-card-icon';
        icon = cell;
      }
    });
    if (icon && !icon.querySelector('img, svg')) icon.replaceChildren(lineIcon(i));
    list.append(item);
  });
  list.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '120' }]));
  });
  block.replaceChildren(list);
}
