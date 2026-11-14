/**
 * "Still deciding? — Jump to" bar. Row: [intro lines] [list of links].
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  if (!cells.length) return;
  const linksCell = cells.find((c) => c.querySelector('a')) || cells.at(-1);
  const introCell = cells.find((c) => c !== linksCell);
  const inner = document.createElement('div');
  inner.className = 'product-jumpnav-inner';

  if (introCell) {
    const intro = document.createElement('div');
    intro.className = 'product-jumpnav-intro';
    const lines = [...introCell.children].filter((c) => c.textContent.trim());
    (lines.length ? lines : [introCell]).forEach((line, i) => {
      const span = document.createElement('span');
      span.className = i === 0 ? 'product-jumpnav-hint' : 'product-jumpnav-label';
      span.textContent = line.textContent.trim();
      intro.append(span);
    });
    inner.append(intro);
  }

  const nav = document.createElement('nav');
  nav.className = 'product-jumpnav-links';
  nav.setAttribute('aria-label', 'Jump to a section');
  linksCell.querySelectorAll('a').forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    link.textContent = a.textContent.trim();
    nav.append(link);
  });
  inner.append(nav);
  block.replaceChildren(inner);
}
