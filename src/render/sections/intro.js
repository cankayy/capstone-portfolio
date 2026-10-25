import { h, text, paragraphs, list } from '../dom.js';
import { media } from '../media.js';

export default function intro(s) {
  const meta = list(s.meta);
  const image = media(s.image, { lazy: false, cls: 'cs-intro__image' });
  return h(
    'section',
    { class: 'cs-intro' },
    media(s.banner, { lazy: false, cls: 'cs-intro__banner' }),
    h(
      'div',
      { class: `cs-intro__body ${image ? '' : 'is-single'}`.trim() },
      h(
        'div',
        { class: 'cs-intro__text' },
        text('h2', 'cs-intro__title', s.title),
        paragraphs(s.summary, 'cs-intro__summary'),
        meta.length > 0 &&
          h(
            'dl',
            { class: 'cs-meta' },
            meta.map((m) => h('div', { class: 'cs-meta__item' }, text('dt', 'cs-meta__label', m.label), text('dd', 'cs-meta__value', m.value))),
          ),
      ),
      image,
    ),
  );
}
