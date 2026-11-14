import { createOptimizedPicture } from '../../scripts/aem.js';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const txt = (node) => (node ? node.textContent.trim() : '');

/**
 * Numbered step tabs with a detail panel.
 * Rows: [head: eyebrow · h2 · lede] then per step
 * [title (heading or 1st p) + teaser p] [detail] [picture].
 * @param {Element} block
 */
export default function decorate(block) {
  const [headRow, ...rows] = [...block.children];
  if (!headRow) return;

  const head = el('div', 'steps-tabs-head');
  head.append(...headRow.children);
  const eyebrow = head.querySelector('p');
  if (eyebrow && !eyebrow.previousElementSibling) eyebrow.classList.add('steps-tabs-eyebrow');

  const steps = rows.map((row) => {
    const [titleCell, detailCell, imageCell] = [...row.children];
    const heading = titleCell?.querySelector('h1, h2, h3, h4, h5, h6');
    const paras = [...(titleCell?.querySelectorAll('p') || [])];
    const img = imageCell?.querySelector('picture > img');
    return {
      title: heading ? txt(heading) : txt(paras[0] || titleCell),
      teaser: txt(heading ? paras[0] : paras[1]),
      detail: txt(detailCell?.querySelector('p') || detailCell),
      picture: img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]) : null,
    };
  });

  const tabs = el('div', 'steps-tabs-tabs');
  const stepLabel = el('span', 'steps-tabs-step');
  const title = el('h3');
  const detail = el('p');
  const copy = el('div', 'steps-tabs-copy');
  copy.append(stepLabel, title, detail);
  const media = el('div', 'steps-tabs-media');
  const panel = el('div', 'steps-tabs-panel');
  panel.append(copy, media);

  const select = (i) => {
    const step = steps[i];
    stepLabel.textContent = `Step ${i + 1} of ${steps.length}`;
    title.textContent = step.title;
    detail.textContent = step.detail;
    media.replaceChildren(...(step.picture ? [step.picture.cloneNode(true)] : []));
    [...tabs.children].forEach((tab, j) => {
      tab.classList.toggle('is-active', i === j);
      tab.setAttribute('aria-pressed', String(i === j));
    });
  };

  steps.forEach((step, i) => {
    const tab = el('button', 'steps-tabs-tab');
    tab.type = 'button';
    tab.setAttribute('aria-pressed', 'false');
    tab.append(el('span', 'steps-tabs-num', String(i + 1)), el('h4', null, step.title), el('p', null, step.teaser));
    tab.addEventListener('click', () => select(i));
    tabs.append(tab);
  });

  block.replaceChildren(head, tabs, panel);
  if (steps.length) select(0);
}
