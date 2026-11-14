import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Video teaser: poster, play button and duration badge (no player on the
 * source — the button is presentational).
 * Rows: [head: eyebrow + h2] [poster picture + "m:ss"] [optional note]
 * @param {Element} block
 */
export default function decorate(block) {
  const [headRow, posterRow, noteRow] = [...block.children];
  if (!headRow) return;

  const head = document.createElement('div');
  head.className = 'media-video-head';
  head.append(...headRow.children);

  const stage = document.createElement('div');
  stage.className = 'media-video-stage';
  if (posterRow) {
    const img = posterRow.querySelector('picture > img');
    if (img) stage.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'media-video-play';
    play.setAttribute('aria-label', 'Play the film');
    play.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    stage.append(play);
    const duration = [...posterRow.querySelectorAll('p, span')]
      .map((n) => n.textContent.trim()).find((s) => /^\d+:\d{2}$/.test(s));
    if (duration) {
      const badge = document.createElement('span');
      badge.className = 'media-video-duration';
      badge.textContent = duration;
      stage.append(badge);
    }
  }

  block.replaceChildren(head, stage);
  const note = noteRow?.textContent.trim();
  if (note) {
    const p = document.createElement('p');
    p.className = 'media-video-note';
    p.textContent = note;
    block.append(p);
  }
}
