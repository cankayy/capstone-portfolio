import { h, text, paragraphs, list } from '../dom.js';
import { section } from '../blocks.js';

export default function split(s) {
  const columns = list(s.columns);
  if (!columns.length) return null;
  return section(
    'split',
    { wide: true },
    h('div', { class: 'cs-split__grid' }, columns.map((c) => h('div', null, text('p', 'cs-eyebrow', c.eyebrow), text('h4', 'cs-subhead cs-subhead--lg', c.heading), paragraphs(c.body, 'cs-small')))),
  );
}
