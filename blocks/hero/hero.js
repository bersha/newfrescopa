/**
 * Hero: full-bleed photo band (row 1 = picture, row 2 = copy) or, when the
 * first row carries no picture, an image-less dark CTA band.
 * Variants: `short` (compact promo band), `tint` (flat dark overlay).
 * @param {Element} block The hero block
 */
export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
  // First paragraph (at any depth) is the eyebrow.
  block.querySelector('p')?.classList.add('eyebrow');
  // The hero image is the LCP candidate on top-of-page heroes.
  const img = block.querySelector(':scope > div:first-child img');
  if (img && block.closest('.section') === block.closest('main')?.firstElementChild) {
    img.loading = 'eager';
  }
}
