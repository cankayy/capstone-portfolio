import { h, text, paragraphs, list, has } from '../dom.js';
import { section } from '../blocks.js';
import { media } from '../media.js';

const FRAMES = new Set(['phone', 'browser']);

function framed(item) {
  const frame = FRAMES.has(item.frame) ? item.frame : 'none';
  const el = media(item, { cls: `frame frame--${frame}` });
  if (frame === 'browser') el.prepend(h('span', { class: 'frame__bar', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  return el;
}

// ctx.side is decided by the section loop (explicit `side`, or alternating).
export default function feature(s, ctx) {
  const items = list(s.media).slice(0, 2);
  const bullets = list(s.bullets);
  const eyebrow = [s.number, s.label].filter(has).join(' ');
  const textCol = h(
    'div',
    { class: 'cs-feature__text' },
    text('p', 'cs-eyebrow', eyebrow),
    text('h3', 'cs-display cs-display--md', s.heading),
    paragraphs(s.body, 'cs-body'),
    bullets.length > 0 && h('ul', { class: 'cs-bullets' }, bullets.map((b) => text('li', null, b))),
    text('p', 'cs-note', s.note),
  );
  const mediaCol = items.length ? h('div', { class: `cs-feature__media ${items.length > 1 ? 'is-pair' : ''}`.trim() }, items.map(framed)) : null;
  const cls = [mediaCol ? `media-${ctx.side}` : 'is-text-only', ctx.afterFeature && 'has-divider'].filter(Boolean).join(' ');
  return section('feature', { wide: Boolean(mediaCol), cls }, mediaCol ? [textCol, mediaCol] : textCol);
}
