import { h, text, list, has } from './render/dom.js';
import { media } from './render/media.js';

// When the pointer leaves the list, keep the last-hovered title active (false)
// or snap back to the first visible project (true).
const REVERT_TO_FIRST_ON_LEAVE = false;

const ALL = 'All Projects';
const DESKTOP = matchMedia('(min-width: 1024px)');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
const FADE_MS = 100; // each half of the ~200ms card crossfade

/**
 * Filters, title list, card and connector.
 * `onOpen(slug, opener)` is called when a project should open in the modal.
 */
export function initProjects(root, { projects, filters, onOpen }) {
  const els = {
    filters: root.querySelector('[data-filters]'),
    stage: root.querySelector('[data-stage]'),
    list: root.querySelector('[data-list]'),
    empty: root.querySelector('[data-empty]'),
    card: root.querySelector('[data-card]'),
    inner: root.querySelector('[data-card-inner]'),
    svg: root.querySelector('[data-connector]'),
  };
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  let filter = ALL;
  let active = null;
  let lastPointer = 'mouse';

  /* ---------- Filters ---------- */
  const filterButtons = (filters.length ? filters : [ALL]).map((label) =>
    h('button', { class: 'pill pill--filter', type: 'button', 'aria-pressed': String(label === ALL), onclick: () => setFilter(label) }, label),
  );
  els.filters.replaceChildren(...filterButtons);

  function setFilter(label) {
    filter = label;
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === label)));
    for (const btn of titleButtons) btn.closest('li').hidden = !matches(bySlug.get(btn.dataset.slug));
    const first = visible()[0];
    els.empty.hidden = Boolean(first);
    els.card.hidden = !first;
    setActive(first ? first.slug : null, { force: true });
  }

  function matches(p) {
    return filter === ALL || (Array.isArray(p.categories) && p.categories.includes(filter));
  }

  function visible() {
    return projects.filter(matches);
  }

  /* ---------- Title list ---------- */
  const titleButtons = projects.map((p) => {
    const label = p.title || p.slug;
    const btn = h(
      'button',
      { class: 'ptitle', type: 'button', 'data-slug': p.slug, 'data-text': label, 'aria-label': `${label}, open case study` },
      h('span', { class: 'ptitle__text' }, label),
    );
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'touch') setActive(p.slug);
    });
    // Keyboard focus counts as hover. A touch tap also focuses, but that is handled in click.
    btn.addEventListener('focus', () => lastPointer !== 'touch' && setActive(p.slug));
    btn.addEventListener('click', () => {
      // Touch: first tap activates, a tap on the already active title opens.
      if (lastPointer === 'touch' && active !== p.slug) return setActive(p.slug);
      onOpen(p.slug, btn);
    });
    return btn;
  });
  els.list.replaceChildren(...titleButtons.map((b) => h('li', null, b)));

  root.addEventListener('pointerdown', (e) => (lastPointer = e.pointerType), true);
  // Keyboard clicks have no pointerdown; reset so Enter always opens.
  root.addEventListener('keydown', () => (lastPointer = 'keyboard'), true);

  els.list.addEventListener('pointerleave', (e) => {
    if (REVERT_TO_FIRST_ON_LEAVE && e.pointerType !== 'touch') setActive(visible()[0]?.slug ?? null);
  });

  /* ---------- Card ---------- */
  els.card.addEventListener('click', () => active && onOpen(active, els.card));
  els.card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (active) onOpen(active, els.card);
    }
  });

  function cardContent(p) {
    const c = p.card || {};
    const tags = list(c.tags);
    return [
      media(c.image || { src: '', alt: c.shortName || p.title || '' }, { lazy: false, cls: 'pcard__image' }),
      h(
        'div',
        { class: 'pcard__body' },
        h(
          'div',
          { class: 'pcard__name' },
          has(c.icon) && h('img', { class: 'pcard__icon', src: c.icon, alt: '', width: 40, height: 40, onerror: (e) => e.target.remove() }),
          text('span', null, c.shortName || p.title),
        ),
        text('p', 'pcard__summary', c.summary),
        tags.length > 0 && h('ul', { class: 'pcard__tags', 'aria-label': 'Disciplines' }, tags.map((t) => text('li', 'pill pill--sm', t))),
      ),
    ];
  }

  let fadeTimer = null;
  let pending = null;
  function showCard(p) {
    els.card.setAttribute('aria-label', `Open ${p.title || p.slug} case study`);
    if (REDUCED.matches || !els.inner.hasChildNodes()) return els.inner.replaceChildren(...cardContent(p));
    pending = p;
    if (fadeTimer) return;
    els.inner.classList.add('is-out');
    fadeTimer = setTimeout(() => {
      els.inner.replaceChildren(...cardContent(pending));
      els.inner.classList.remove('is-out');
      fadeTimer = null;
    }, FADE_MS);
  }

  /* ---------- Active state ---------- */
  function setActive(slug, { force = false } = {}) {
    if (slug === active && !force) return;
    active = slug;
    for (const btn of titleButtons) btn.classList.toggle('is-active', btn.dataset.slug === slug);
    if (slug) showCard(bySlug.get(slug));
    connector.update();
  }

  /* ---------- Connector ---------- */
  const connector = createConnector(els, () => titleButtons.find((b) => b.dataset.slug === active));
  new ResizeObserver(() => connector.update(false)).observe(els.stage);
  DESKTOP.addEventListener('change', () => connector.update(false));
  document.fonts?.ready.then(() => connector.update(false));

  // Warm the cache so the crossfade never shows a half-loaded image.
  const preload = () => projects.forEach((p) => p.card?.image?.src && (new Image().src = p.card.image.src));
  'requestIdleCallback' in window ? requestIdleCallback(preload) : setTimeout(preload, 1500);

  setFilter(ALL);

  return {
    /** Element to return focus to after the modal closes. */
    focusTarget(slug) {
      return titleButtons.find((b) => b.dataset.slug === slug && !b.closest('li').hidden) || null;
    },
  };
}

/** SVG curve from the active title to the card, with a dot at each end. */
function createConnector(els, getTitle) {
  const path = els.svg.querySelector('path');
  const [dotA, dotB] = els.svg.querySelectorAll('circle');
  let current = null;
  let raf = 0;

  function target() {
    const title = getTitle();
    if (!DESKTOP.matches || !title || els.card.hidden) return null;
    const stage = els.stage.getBoundingClientRect();
    const t = title.querySelector('.ptitle__text').getBoundingClientRect();
    const card = els.card.getBoundingClientRect();
    const x1 = t.right - stage.left + 22;
    const x2 = card.left - stage.left - 42;
    const y = Math.min(Math.max(t.top - stage.top + t.height * 0.6, card.top - stage.top + 40), card.bottom - stage.top - 40);
    return x2 - x1 > 40 ? { x1, x2, y } : null;
  }

  function draw({ x1, x2, y }) {
    const d = x2 - x1;
    const dip = Math.min(64, d * 0.14);
    path.setAttribute('d', `M${x1},${y} C${x1 + d * 0.3},${y + dip * 1.3} ${x2 - d * 0.3},${y + dip * 1.3} ${x2},${y}`);
    dotA.setAttribute('cx', x1);
    dotA.setAttribute('cy', y);
    dotB.setAttribute('cx', x2);
    dotB.setAttribute('cy', y);
  }

  function update(animate = true) {
    cancelAnimationFrame(raf);
    const next = target();
    els.svg.classList.toggle('is-hidden', !next);
    if (!next) return (current = null);
    if (!animate || !current || REDUCED.matches) {
      current = next;
      return draw(next);
    }
    const from = current;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 260);
      const e = 1 - Math.pow(1 - k, 3);
      current = { x1: from.x1 + (next.x1 - from.x1) * e, x2: from.x2 + (next.x2 - from.x2) * e, y: from.y + (next.y - from.y) * e };
      draw(current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  return { update };
}
