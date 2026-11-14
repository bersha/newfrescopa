import { createOptimizedPicture } from '../../scripts/aem.js';

const PRICE = /^(\D*\d[\d.,]*)(.*)$/;

/**
 * Builds the price + CTA footer from the trailing paragraph(s): either a price
 * paragraph followed by a CTA paragraph, or one paragraph holding both
 * ("$14Add to cart →").
 * @param {Element} body the card body cell
 */
function buildFoot(body) {
  const paras = [...body.querySelectorAll('p')];
  const last = paras.at(-1);
  if (!last) return;
  const prev = paras.at(-2);
  const isPrice = (p) => p && /^\D*\d[\d.,]*$/.test(p.textContent.trim());

  let priceText;
  let ctaText;
  let href = last.querySelector('a')?.getAttribute('href') || '#';
  if (isPrice(prev)) {
    priceText = prev.textContent.trim();
    ctaText = last.textContent.trim();
    prev.remove();
  } else {
    const m = last.textContent.trim().match(PRICE);
    priceText = m ? m[1].trim() : last.textContent.trim();
    ctaText = m ? m[2].trim() : '';
  }
  if (!last.querySelector('a') && !ctaText) href = null;

  const foot = document.createElement('div');
  foot.className = 'cards-product-card-foot';
  const price = document.createElement('span');
  price.className = 'cards-product-price';
  price.textContent = priceText;
  foot.append(price);
  if (ctaText) {
    const cta = document.createElement('a');
    cta.className = 'cards-product-cta';
    cta.href = href || '#';
    cta.textContent = ctaText;
    foot.append(cta);
  }
  last.replaceWith(foot);
}

/**
 * Cards (product): image card with a category badge, title, description and
 * a price / add-to-cart footer.
 * @param {Element} block the cards-product block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.append(...row.children);
    [...li.children].forEach((cell) => {
      cell.className = cell.children.length === 1 && cell.querySelector('picture')
        ? 'cards-product-card-image'
        : 'cards-product-card-body';
    });

    const image = li.querySelector('.cards-product-card-image');
    const body = li.querySelector('.cards-product-card-body');
    if (body) {
      // leading paragraph = category, shown as a badge over the image
      const cat = body.querySelector('p');
      if (cat && image && cat === body.firstElementChild) {
        const badge = document.createElement('span');
        badge.className = 'cards-product-cat';
        badge.textContent = cat.textContent.trim();
        image.append(badge);
        cat.remove();
      }
      buildFoot(body);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const newImg = pic.querySelector('img');
    if (img.width && img.height) {
      newImg.width = img.getAttribute('width');
      newImg.height = img.getAttribute('height');
    }
    img.closest('picture').replaceWith(pic);
  });
  block.replaceChildren(ul);
}
