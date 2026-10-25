import { h, text, list, pad } from '../dom.js';
import { section, sectionHead } from '../blocks.js';
import { media } from '../media.js';

export default function mediaPair(s) {
  const items = list(s.items);
  const points = list(s.list);
  const cols = items.map((it) => `${Number(it.width) > 0 ? Number(it.width) : 1}fr`).join(' ');
  return section(
    'media-pair',
    { wide: true },
    sectionHead(s),
    items.length > 0 &&
      h(
        'div',
        { class: 'cs-pair', style: `--cols: ${cols}` },
        items.map((it) => h('figure', null, media(it.image || { src: '', alt: '' }, { cls: 'cs-panel-media' }), text('figcaption', 'cs-caption', it.caption))),
      ),
    points.length > 0 &&
      h(
        'ol',
        { class: 'cs-pair__list' },
        points.map((p, i) => h('li', null, h('span', { class: 'cs-num' }, pad(i + 1)), h('div', null, text('h4', 'cs-item-title', p.title), text('p', 'cs-small', p.text)))),
      ),
  );
}
