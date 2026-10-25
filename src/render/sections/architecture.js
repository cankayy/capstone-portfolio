import { h, text, list, has } from '../dom.js';
import { section, sectionHead } from '../blocks.js';

export default function architecture(s) {
  const tools = list(s.tools);
  const flow = list(s.flow);
  const cards = [];
  flow.forEach((card, i) => {
    if (i > 0) cards.push(h('li', { class: 'cs-flow__arrow', 'aria-hidden': 'true' }, '→'));
    cards.push(h('li', { class: 'cs-flow__card' }, text('p', 'cs-eyebrow', card.eyebrow), text('h4', 'cs-item-title', card.title), text('p', 'cs-small', card.text)));
  });
  return section(
    'architecture',
    { wide: true },
    sectionHead(s),
    tools.length > 0 && h('ul', { class: 'cs-tools', 'aria-label': 'Tools' }, tools.map((t) => text('li', 'pill pill--sm', t))),
    cards.length > 0 && h('ol', { class: 'cs-flow' }, cards),
    has(s.status) && h('p', { class: 'cs-status' }, text('span', 'cs-status__label', s.status.label), text('span', null, s.status.text)),
  );
}
