import { text as textEl, paragraphs } from '../dom.js';
import { section } from '../blocks.js';

export default function text(s) {
  return section('text', {}, textEl('p', 'cs-eyebrow', s.eyebrow), textEl('h3', 'cs-display', s.heading), paragraphs(s.body || s.lead, 'cs-body'));
}
