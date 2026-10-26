// Custom cursor: a dot that follows the pointer exactly. Mouse and trackpad only.

const INTERACTIVE = 'a, button, [role="button"]';
// Areas that show the system grab cursor instead of the dot (e.g. the draggable team card).
const NATIVE = '[data-native-cursor]';

const FINE = matchMedia('(hover: hover) and (pointer: fine)');

export function initCursor() {
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');

  function onMove(e) {
    if (e.pointerType === 'touch') return;
    dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    dot.classList.add('is-visible');
    const interactive = Boolean(e.target.closest?.(INTERACTIVE));
    dot.classList.toggle('is-hover', interactive);
    dot.classList.toggle('is-native', !interactive && Boolean(e.target.closest?.(NATIVE)));
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
  }

  FINE.addEventListener('change', () => (FINE.matches ? enable() : disable()));
  if (FINE.matches) enable();
}
