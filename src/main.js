import './styles/tokens.css';
import './styles/base.css';
import './styles/home.css';
import './styles/modal.css';
import './styles/sections.css';

import site from '../content/site.json';
import { h, rich } from './render/dom.js';
import { initGrid } from './grid.js';
import { initProjects } from './projects-list.js';
import { initModal } from './modal.js';
import { initCursor } from './cursor.js';
import { initPack } from './pack.js';

// Every content/projects/*.json is a project, except files starting with "_".
const files = import.meta.glob(['/content/projects/*.json', '!/content/projects/_*.json'], { eager: true, import: 'default' });
const projects = Object.entries(files)
  .filter(([path]) => !path.split('/').pop().startsWith('_'))
  .map(([path, data]) => ({ ...data, slug: data.slug || path.split('/').pop().replace(/\.json$/, '') }))
  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || String(a.title).localeCompare(String(b.title)));

/* ---------- Header ---------- */
document.querySelector('[data-nav]').replaceChildren(
  ...(site.nav || []).map((link) =>
    h('li', null, h('a', { href: link.href, target: link.external && '_blank', rel: link.external && 'noopener noreferrer' }, link.label)),
  ),
);

/* ---------- Hero ---------- */
document.querySelector('[data-tagline]').replaceChildren(...rich(site.tagline || ''));
initGrid(document.querySelector('[data-grid]'));
initPack(document.querySelector('[data-pack]'), {
  team: site.team,
  hero: document.querySelector('.hero'),
  header: document.querySelector('.site-header'),
  flowParent: document.querySelector('[data-hero-text]'),
});
initCursor();

/* ---------- Footer ---------- */
const footer = site.footer || {};
document.querySelector('[data-footer-heading]').replaceChildren(
  footer.heading || 'Get in touch',
  h('span', { class: 'site-footer__arrow', 'aria-hidden': 'true' }, ' →'),
);
document.querySelector('[data-emails]').replaceChildren(
  ...(footer.emails || []).map((email) => h('li', null, h('a', { class: 'pill pill--invert', href: `mailto:${email}` }, email))),
);

/* ---------- Projects + modal ---------- */
let modal;
const list = initProjects(document.querySelector('#projects'), {
  projects,
  filters: site.filters || [],
  onOpen: (slug, opener) => modal.open(slug, opener),
});
modal = initModal(document.querySelector('[data-modal]'), {
  projects,
  focusTarget: (slug) => list.focusTarget(slug),
});
