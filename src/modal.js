import { renderSections } from './render/index.js';

/**
 * Project modal: <dialog> with showModal() for focus handling and Escape,
 * body scroll lock, and #slug deep links that work with the back button.
 */
export function initModal(dialog, { projects, focusTarget }) {
  const panel = dialog.querySelector('[data-modal-panel]');
  const content = dialog.querySelector('[data-modal-content]');
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  let opener = null;
  let openSlug = null;
  let pushed = false; // true when opening added a history entry we can go back from

  const slugFromHash = () => decodeURIComponent(location.hash.slice(1));

  function show(slug) {
    const project = bySlug.get(slug);
    if (!project) return false;
    openSlug = slug;
    content.replaceChildren(...renderSections(project.sections, slug));
    const title = content.querySelector('.cs-intro__title');
    if (title) {
      title.id = 'modal-title';
      dialog.setAttribute('aria-labelledby', 'modal-title');
      dialog.removeAttribute('aria-label');
    } else {
      dialog.removeAttribute('aria-labelledby');
      dialog.setAttribute('aria-label', project.title || slug);
    }
    document.documentElement.classList.add('is-modal-open');
    if (!dialog.open) dialog.showModal();
    panel.scrollTop = 0;
    return true;
  }

  function hide() {
    if (!dialog.open) return;
    dialog.close();
    document.documentElement.classList.remove('is-modal-open');
    const target = (opener && opener.isConnected && !opener.closest('[hidden]') && opener) || focusTarget(openSlug);
    target?.focus({ preventScroll: true });
    opener = null;
    openSlug = null;
  }

  /** Close from the UI (×, Escape, backdrop). Goes back in history when we pushed an entry. */
  function requestClose() {
    if (pushed) {
      pushed = false;
      history.back(); // popstate does the hiding
    } else {
      history.replaceState(history.state, '', location.pathname + location.search);
      hide();
    }
  }

  dialog.querySelector('[data-modal-close]').addEventListener('click', requestClose);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestClose();
  });
  // The dialog fills the viewport; clicks on it (not the panel) are backdrop clicks.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) requestClose();
  });

  addEventListener('popstate', () => {
    const slug = slugFromHash();
    if (bySlug.has(slug)) {
      pushed = false;
      show(slug);
    } else {
      pushed = false;
      hide();
    }
  });

  // Deep link on load.
  if (bySlug.has(slugFromHash())) show(slugFromHash());

  return {
    open(slug, from) {
      if (!bySlug.has(slug)) return;
      opener = from || null;
      if (slugFromHash() !== slug) {
        history.pushState({ modal: slug }, '', `#${encodeURIComponent(slug)}`);
        pushed = true;
      }
      show(slug);
    },
  };
}
