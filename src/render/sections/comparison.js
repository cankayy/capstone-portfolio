import { h, text, paragraphs, list, has } from '../dom.js';
import { section, sectionHead } from '../blocks.js';
import { media } from '../media.js';

function column(side, letter) {
  if (!has(side)) return null;
  return h(
    'div',
    { class: 'cs-compare__col' },
    h(
      'div',
      { class: 'cs-compare__text' },
      h('span', { class: 'cs-compare__letter', 'aria-hidden': 'true' }, letter),
      h('div', null, text('p', 'cs-eyebrow', side.eyebrow), text('h4', 'cs-subhead', side.heading), paragraphs(side.body, 'cs-small')),
    ),
    columnMedia(Array.isArray(side.media) ? list(side.media) : [side.media]),
  );
}

// One image, or several stacked. `size: "small"` renders an item narrower.
function columnMedia(items) {
  const els = items.map((m) => media(m, { cls: `cs-panel-media ${m.size === 'small' ? 'is-small' : ''}`.trim() })).filter(Boolean);
  if (els.length < 2) return els[0] || h('div');
  return h('div', { class: 'cs-compare__stack' }, els);
}

export default function comparison(s) {
  const a = column(s.a, 'A');
  const b = column(s.b, 'B');
  const arrow = a && b && h('span', { class: 'cs-compare__arrow', 'aria-hidden': 'true' }, '→');
  return section('comparison', { wide: true }, sectionHead(s), (a || b) && h('div', { class: `cs-compare ${a && b ? '' : 'is-single'}`.trim() }, a, arrow, b));
}
