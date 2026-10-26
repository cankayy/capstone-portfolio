// Slower, eased mouse-wheel and trackpad scrolling for the page and the open modal.
// Touch scrolling, keyboard scrolling and the scrollbar are left to the browser.

// Share of each wheel step that is scrolled. Lower = slower.
const SPEED = 0.7;
// Share of the remaining distance covered per 60fps frame. Lower = longer glide.
const EASE = 0.16;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');

export function initScroll() {
  let el = null; // element being scrolled
  let target = 0;
  let current = 0;
  let last = 0;
  let raf = 0;

  // The open modal's panel, or the page.
  const scroller = () => document.querySelector('dialog[open] [data-modal-panel]') || document.scrollingElement;
  const max = (s) => s.scrollHeight - s.clientHeight;

  function tick(now) {
    const dt = Math.min(64, now - (last || now));
    last = now;
    current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.67));
    if (Math.abs(target - current) < 0.5) current = target;
    el.scrollTo({ top: current, behavior: 'instant' });
    raf = current === target ? (last = 0) : requestAnimationFrame(tick);
  }

  function onWheel(e) {
    if (REDUCED.matches || e.ctrlKey || e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // Leave other scrollable areas (e.g. a wide table) to the browser.
    const s = scroller();
    if (hasOwnScroll(e.target, s)) return;

    e.preventDefault();
    if (s !== el || !raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      el = s;
      current = target = s.scrollTop;
    }
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? s.clientHeight : 1;
    target = Math.max(0, Math.min(target + e.deltaY * unit * SPEED, max(s)));
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // Stop gliding when something else scrolls the page (keyboard, links, scrollbar).
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  addEventListener('keydown', stop);
  addEventListener('pointerdown', stop);
  addEventListener('hashchange', stop);

  addEventListener('wheel', onWheel, { passive: false });
}

// True when an element between `node` and `outer` scrolls vertically on its own.
function hasOwnScroll(node, outer) {
  for (let n = node instanceof Element ? node : null; n && n !== outer && n !== document.body; n = n.parentElement) {
    if (n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) return true;
  }
  return false;
}
