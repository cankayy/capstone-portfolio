import { h } from './dom.js';

const VIDEO = /\.(mp4|webm|mov)(\?|#|$)/i;

/**
 * Gray box at the right aspect ratio with the alt text inside, so missing images
 * are obvious during content entry. `src` is shown when a path was given but did not load.
 */
export function placeholder(alt, src) {
  return h(
    'div',
    { class: 'ph', role: 'img', 'aria-label': alt || 'Image coming soon' },
    h('span', { class: 'ph__alt' }, alt || 'Image'),
    src && h('span', { class: 'ph__src' }, `Missing: ${src}`),
  );
}

/**
 * An image (or video) from a JSON `{ src, alt }` object.
 * Returns null when the field is absent, a placeholder when `src` is empty or fails to load.
 */
export function media(item, { lazy = true, cls = '' } = {}) {
  if (!item || typeof item !== 'object') return null;
  const { src, alt = '' } = item;
  let el;
  if (!src) {
    el = placeholder(alt);
  } else if (VIDEO.test(src)) {
    el = h('video', { src, controls: true, muted: true, playsinline: true, preload: 'metadata', 'aria-label': alt || null });
  } else {
    el = h('img', { src, alt, loading: lazy ? 'lazy' : 'eager', decoding: 'async' });
    el.addEventListener('error', () => el.replaceWith(placeholder(alt, src)), { once: true });
  }
  return h('div', { class: `media ${cls}`.trim() }, el);
}
