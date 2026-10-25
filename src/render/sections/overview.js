import { h, text, list, pad } from '../dom.js';
import { section, sectionHead } from '../blocks.js';

export default function overview(s) {
  const pillars = list(s.pillars);
  return section(
    'overview',
    { wide: true },
    sectionHead(s),
    pillars.length > 0 &&
      h(
        'ol',
        { class: 'cs-pillars' },
        pillars.map((p, i) =>
          h('li', { class: 'cs-pillar' }, h('span', { class: 'cs-num' }, pad(i + 1)), text('h4', 'cs-item-title', p.title), text('p', 'cs-small', p.text)),
        ),
      ),
  );
}
