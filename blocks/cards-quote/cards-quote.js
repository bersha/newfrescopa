/**
 * Cards (quote): side-by-side testimonials. Each row is one card whose cell
 * holds the quote paragraph followed by a citation paragraph.
 * @param {Element} block the cards-quote block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.append(...row.children);
    [...li.children].forEach((cell) => {
      cell.className = cell.children.length === 1 && cell.querySelector('picture')
        ? 'cards-quote-card-image'
        : 'cards-quote-card-body';
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}
