import { h, text, paragraphs, list, has } from '../dom.js';
import { section, sectionHead } from '../blocks.js';
import { media } from '../media.js';

// One row per person: photo, name and contact on the left; bio, skills, experience and links on the right.
function member(m) {
  const skills = list(m.skills);
  const experience = list(m.experience);
  const links = list(m.links);
  const contact = [
    has(m.email) && h('a', { class: 'pill cs-team__contact', href: `mailto:${m.email}` }, m.email),
    has(m.linkedin) && h('a', { class: 'pill cs-team__contact', href: m.linkedin, target: '_blank', rel: 'noopener noreferrer' }, 'LinkedIn ↗'),
  ].filter(Boolean);

  return h(
    'li',
    { class: 'cs-team__member' },
    h(
      'div',
      { class: 'cs-team__id' },
      media(m.photo || { src: '', alt: m.name || '' }, { cls: 'cs-team__photo' }),
      h('div', null, text('h4', 'cs-subhead cs-subhead--lg', m.name), text('p', 'cs-team__role', m.role)),
      contact.length > 0 && h('div', { class: 'cs-team__contacts' }, contact),
    ),
    h(
      'div',
      { class: 'cs-team__detail' },
      paragraphs(m.bio, 'cs-body'),
      h(
        'div',
        { class: 'cs-team__cols' },
        skills.length > 0 &&
          h('div', null, text('p', 'cs-eyebrow', 'Key skills'), h('ul', { class: 'cs-team__skills' }, skills.map((s) => text('li', 'pill pill--sm', s)))),
        experience.length > 0 &&
          h(
            'div',
            null,
            text('p', 'cs-eyebrow', 'Experience'),
            h('ul', { class: 'cs-team__exp' }, experience.map((e) => h('li', null, text('span', 'cs-item-title', e.title), text('span', 'cs-small', e.org)))),
          ),
      ),
      links.length > 0 &&
        h('ul', { class: 'cs-team__links' }, links.map((l) => h('li', null, text('span', 'cs-eyebrow', l.label), text('p', 'cs-team__link', l.text)))),
    ),
  );
}

export default function team(s) {
  const members = list(s.members);
  return section('team', { wide: true }, sectionHead(s), members.length > 0 && h('ul', { class: 'cs-team' }, members.map(member)));
}
