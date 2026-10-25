import { h, text, list, pad } from '../dom.js';
import { section } from '../blocks.js';

export default function steps(s) {
  const items = list(s.steps);
  const eyebrow = text('p', 'cs-eyebrow', s.eyebrow);
  const intro = text('p', 'cs-body', s.intro);
  return section(
    'steps',
    { wide: true },
    (eyebrow || intro) && h('header', { class: 'cs-steps__head' }, eyebrow, intro),
    items.length > 0 &&
      h(
        'ol',
        { class: 'cs-steps__grid' },
        items.map((step, i) => h('li', null, h('span', { class: 'cs-num' }, pad(i + 1)), text('h4', 'cs-item-title', step.title), text('p', 'cs-small', step.text))),
      ),
  );
}
