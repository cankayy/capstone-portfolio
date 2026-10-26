import { h, text } from '../dom.js';
import { section, sectionHead } from '../blocks.js';
import { media } from '../media.js';

export default function image(s) {
  return section('image', { wide: true }, sectionHead(s), h('figure', null, media(s.media || { src: '', alt: s.caption || '' }, { cls: 'cs-image__media' }), text('figcaption', 'cs-caption', s.caption)));
}
