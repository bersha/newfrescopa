const ICONS = [
  [/\bx\b|twitter/i, '<path d="M4 4l16 16M20 4L4 20" stroke-linecap="round"></path>'],
  [/mail/i, '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6" stroke-linecap="round"></path>'],
  [/copy|link/i, '<rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke-linecap="round"></path>'],
];

/**
 * Article share row. Row: [label] [share links — anchors or a comma list].
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  if (!cells.length) return;
  const linksCell = cells[1] || cells[0];
  const anchors = [...linksCell.querySelectorAll('a')];
  const names = anchors.length
    ? anchors.map((a) => (a.getAttribute('aria-label') || a.textContent).trim())
    : linksCell.textContent.split(',').map((s) => s.trim()).filter(Boolean);

  const label = document.createElement('span');
  label.className = 'article-share-label';
  label.textContent = (cells.length > 1 && cells[0].textContent.trim()) || 'Share';

  const links = document.createElement('div');
  links.className = 'article-share-links';
  names.forEach((name, i) => {
    const a = anchors[i] || document.createElement('a');
    if (!anchors[i]) a.href = '#';
    a.className = 'article-share-link';
    a.setAttribute('aria-label', name);
    const icon = ICONS.find(([re]) => re.test(name));
    if (icon) {
      a.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icon[1]}</svg>`;
    } else {
      a.textContent = name;
    }
    links.append(a);
  });

  const inner = document.createElement('div');
  inner.className = 'article-share-inner';
  inner.append(label, links);
  block.replaceChildren(inner);
}
