import { h, text, has } from './dom.js';

/** Eyebrow + big italic heading + lead paragraph, shared by most section types. */
export function sectionHead(s, cls = '') {
  const parts = [
    text('p', 'cs-eyebrow', [s.number, s.eyebrow].filter(has).join(' ')),
    text('h3', s.headingSize === 'md' ? 'cs-display cs-display--md' : 'cs-display', s.heading),
    text('p', 'cs-lead', s.lead),
  ].filter(Boolean);
  return parts.length ? h('header', { class: `cs-head ${cls}`.trim() }, parts) : null;
}

/** Section wrapper. `wide` sections use the full panel width, others the ~840px text column. */
export function section(type, { wide = false, cls = '' } = {}, ...children) {
  return h('section', { class: `cs-section cs-${type} ${wide ? 'is-wide' : ''} ${cls}`.replace(/\s+/g, ' ').trim() }, children);
}
