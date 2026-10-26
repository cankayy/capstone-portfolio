import './styles/tokens.css';
import './styles/base.css';
import './styles/home.css';
import './styles/modal.css';
import './styles/sections.css';

import site from '../content/site.json';
import about from '../content/about.json';
import { h, rich } from './render/dom.js';
import { initGrid } from './grid.js';
import { initProjects } from './projects-list.js';
import { initModal } from './modal.js';
import { initCursor } from './cursor.js';
import { initPack } from './pack.js';
import { initScroll } from './scroll.js';

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

// Fixed header: hide the wordmark once the page leaves the top, and expose its height for scroll offsets.
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 0);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
new ResizeObserver(() => document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`)).observe(header);

// Small screens: the nav collapses into a hamburger menu next to Sponsor Us.
const menuBtn = header.querySelector('[data-menu-btn]');
function setMenu(open) {
  header.classList.toggle('is-menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('is-menu-open')));
header.querySelector('.site-nav').addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
document.addEventListener('pointerdown', (e) => !e.target.closest?.('.site-actions') && setMenu(false));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !header.classList.contains('is-menu-open')) return;
  setMenu(false);
  menuBtn.focus();
});
matchMedia('(max-width: 767.98px)').addEventListener('change', () => setMenu(false));

/* ---------- Hero ---------- */
document.querySelector('[data-tagline]').replaceChildren(...rich(site.tagline || ''));
initGrid(document.querySelector('[data-grid]'));
initPack(document.querySelector('[data-pack]'), {
  team: site.team,
  hero: document.querySelector('.hero'),
  header,
  flowParent: document.querySelector('[data-hero-text]'),
});
initCursor();
initScroll();

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
  pages: [about],
  focusTarget: (slug) => list.focusTarget(slug),
});

// In-page links to a modal slug (#about, or a case study linked from About) open the modal with a history entry.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#"]');
  const slug = a && decodeURIComponent(a.getAttribute('href').slice(1));
  if (!slug || !modal.has(slug) || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  modal.open(slug, a);
});
