import { h, text, list, pad, has } from '../dom.js';
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
          h(
            'li',
            { class: `cs-pillar ${has(p.icon) ? 'has-icon' : ''}`.trim() },
            has(p.icon) && h('img', { class: 'cs-pillar__icon', src: p.icon, alt: '', width: 48, height: 48, onerror: (e) => e.target.remove() }),
            h('span', { class: 'cs-num' }, pad(i + 1)),
            text('h4', 'cs-item-title', p.title),
            text('p', 'cs-small', p.text),
          ),
        ),
      ),
  );
}
