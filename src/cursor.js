// Custom cursor: a dot that trails the pointer. Mouse and trackpad only.

// Share of the remaining distance covered per 60fps frame. Lower = slower, floatier follow.
const FOLLOW = 0.16;
const INTERACTIVE = 'a, button, [role="button"]';

const FINE = matchMedia('(hover: hover) and (pointer: fine)');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

export function initCursor() {
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');

  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let last = 0;
  let raf = 0;
  let seen = false;

  const place = () => (dot.style.transform = `translate3d(${x}px, ${y}px, 0)`);

  function tick(now) {
    const dt = Math.min(64, now - (last || now));
    last = now;
    const k = 1 - Math.pow(1 - FOLLOW, dt / 16.67);
    x += (tx - x) * k;
    y += (ty - y) * k;
    place();
    if (Math.abs(tx - x) + Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(tick);
    else raf = last = 0;
  }

  function onMove(e) {
    if (e.pointerType === 'touch') return;
    tx = e.clientX;
    ty = e.clientY;
    if (!seen || REDUCED.matches) {
      x = tx;
      y = ty;
      seen = true;
      place();
    } else if (!raf) {
      raf = requestAnimationFrame(tick);
    }
    dot.classList.add('is-visible');
    dot.classList.toggle('is-hover', Boolean(e.target.closest?.(INTERACTIVE)));
  }

  const onDown = () => dot.classList.add('is-down');
  const onUp = () => dot.classList.remove('is-down');
  const onLeave = () => dot.classList.remove('is-visible');

  // An open modal <dialog> sits in the top layer, above everything in <body>, so the dot moves into it.
  const dialogs = [...document.querySelectorAll('dialog')];
  const reparent = () => (dialogs.find((d) => d.open) || document.body).append(dot);
  const observer = new MutationObserver(reparent);

  function enable() {
    document.documentElement.classList.add('has-custom-cursor');
    reparent();
    dialogs.forEach((d) => observer.observe(d, { attributes: true, attributeFilter: ['open'] }));
    addEventListener('pointermove', onMove);
    addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
  }

  function disable() {
    document.documentElement.classList.remove('has-custom-cursor');
    observer.disconnect();
    dot.remove();
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerdown', onDown);
    removeEventListener('pointerup', onUp);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    seen = false;
  }

  FINE.addEventListener('change', () => (FINE.matches ? enable() : disable()));
  if (FINE.matches) enable();
}
