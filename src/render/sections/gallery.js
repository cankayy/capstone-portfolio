import { h, text, list } from '../dom.js';
import { section, sectionHead } from '../blocks.js';
import { media } from '../media.js';

export default function gallery(s) {
  const tiles = list(s.tiles);
  return section(
    'gallery',
    { wide: true },
    sectionHead(s),
    tiles.length > 0 &&
      h(
        'div',
        { class: 'cs-gallery__grid' },
        tiles.map((tile) =>
          h(
            'figure',
            { class: `cs-tile ${tile.dark ? 'is-dark' : ''}`.trim() },
            h('figcaption', { class: 'cs-tile__top' }, text('span', 'cs-tile__label', tile.label), text('code', 'cs-tile__caption', tile.caption)),
            media(tile.image || { src: '', alt: tile.label || '' }, { cls: 'cs-tile__media' }),
          ),
        ),
      ),
  );
}
