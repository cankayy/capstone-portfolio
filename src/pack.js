import { h } from './render/dom.js';

// "Meet the Pack" card in the hero. Draggable within the hero on larger screens,
// in normal flow under the tagline on small ones. Minimizes to a pill.

const SMALL = matchMedia('(max-width: 767.98px)');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
const GAP = 12; // space kept between the card and the header / hero edges
const TOGGLE_MS = 220;

export function initPack(card, { team = {}, hero, header, flowParent }) {
  const box = card.querySelector('.pack__box');
  const toggle = card.querySelector('[data-pack-toggle]');
  const more = card.querySelector('[data-pack-more]');

  card.querySelector('[data-pack-team]').replaceChildren(
    ...(team.members || []).map((m) =>
      h(
        'li',
        { class: 'pack__member' },
        h('img', { class: 'pack__photo', src: m.photo, alt: '', width: 80, height: 80, loading: 'eager', onerror: (e) => e.target.classList.add('is-missing') }),
        h('span', null, m.name),
      ),
    ),
  );
  const link = team.link || {};
  more.href = link.href || '#';
  if (link.external) Object.assign(more, { target: '_blank', rel: 'noopener noreferrer' });

  /* ---------- Position ---------- */
  let pos = null; // { x, y } in hero coordinates, or null while at the default spot
  let moved = false; // true once the user has dragged it

  function bounds() {
    const top = header.getBoundingClientRect().bottom - hero.getBoundingClientRect().top + GAP;
    return {
      minX: GAP,
      minY: Math.max(GAP, top),
      maxX: hero.clientWidth - card.offsetWidth - GAP,
      maxY: hero.clientHeight - card.offsetHeight - GAP,
    };
  }

  function place(x, y) {
    const b = bounds();
    pos = {
      x: Math.round(Math.max(b.minX, Math.min(x, b.maxX))),
      y: Math.round(Math.max(b.minY, Math.min(y, b.maxY))),
    };
    card.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  }

  // Lower right of the hero, lined up with the header's right edge.
  function placeDefault() {
    const edge = parseFloat(getComputedStyle(header).paddingRight) || GAP;
    const bottom = Math.max(GAP, hero.clientHeight * 0.06);
    place(hero.clientWidth - card.offsetWidth - edge, hero.clientHeight - card.offsetHeight - bottom);
  }

  const reclamp = () => {
    if (SMALL.matches) return;
    if (moved && pos) place(pos.x, pos.y);
    else placeDefault();
  };

  /* ---------- Drag ---------- */
  let drag = null;

  card.addEventListener('pointerdown', (e) => {
    if (SMALL.matches || e.button !== 0 || e.target.closest('button, a')) return;
    e.preventDefault();
    drag = { id: e.pointerId, dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    card.setPointerCapture(e.pointerId);
    card.classList.add('is-dragging');
  });

  card.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    moved = true;
    place(e.clientX - drag.dx, e.clientY - drag.dy);
  });

  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    card.classList.remove('is-dragging');
  };
  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);

  /* ---------- Minimize / expand ---------- */
  function setCollapsed(collapsed) {
    const from = box.getBoundingClientRect();
    card.classList.toggle('is-collapsed', collapsed);
    toggle.setAttribute('aria-label', collapsed ? 'Expand team card' : 'Minimize team card');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    reclamp();
    if (REDUCED.matches) return;
    const to = box.getBoundingClientRect();
    box.animate(
      [
        { width: `${from.width}px`, height: `${from.height}px` },
        { width: `${to.width}px`, height: `${to.height}px` },
      ],
      { duration: TOGGLE_MS, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    );
  }
  toggle.addEventListener('click', () => setCollapsed(!card.classList.contains('is-collapsed')));

  /* ---------- Layout mode ---------- */
  function applyMode() {
    card.toggleAttribute('data-native-cursor', !SMALL.matches);
    if (SMALL.matches) {
      flowParent.append(card);
      card.style.transform = '';
      card.classList.remove('is-floating');
    } else {
      hero.append(card);
      card.classList.add('is-floating');
      reclamp();
    }
  }

  SMALL.addEventListener('change', applyMode);
  new ResizeObserver(reclamp).observe(hero);
  document.fonts?.ready.then(reclamp);
  card.querySelectorAll('img').forEach((img) => img.addEventListener('load', reclamp, { once: true }));
  applyMode();
}
