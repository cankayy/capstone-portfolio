import { has } from './dom.js';
import intro from './sections/intro.js';
import overview from './sections/overview.js';
import feature from './sections/feature.js';
import comparison from './sections/comparison.js';
import steps from './sections/steps.js';
import split from './sections/split.js';
import gallery from './sections/gallery.js';
import mediaPair from './sections/media-pair.js';
import architecture from './sections/architecture.js';
import text from './sections/text.js';
import image from './sections/image.js';
import team from './sections/team.js';

/** Section `type` -> renderer. Add a new type here and in content/projects/_template.json. */
export const renderers = {
  intro,
  overview,
  feature,
  comparison,
  steps,
  split,
  gallery,
  'media-pair': mediaPair,
  architecture,
  text,
  image,
  team,
};

const TEXT_FIELDS = ['eyebrow', 'heading', 'lead', 'body'];

/** Renders a project's `sections` array, in the order the JSON gives, into DOM nodes. */
export function renderSections(sections, slug = '') {
  const nodes = [];
  let prev = null;
  let lastSide = null;

  for (const s of Array.isArray(sections) ? sections : []) {
    if (!s || typeof s !== 'object') continue;
    let render = renderers[s.type];
    if (!render) {
      console.warn(`[case study${slug ? ` "${slug}"` : ''}] Unknown section type "${s.type}". Rendering it as "text" if it has text fields.`);
      if (!TEXT_FIELDS.some((f) => has(s[f]))) continue;
      render = text;
    }

    // Features: honor `side`, otherwise alternate with the previous feature (first one puts media on the right).
    const ctx = { afterFeature: prev === 'feature' };
    if (s.type === 'feature') {
      const side = s.side === 'left' || s.side === 'right' ? s.side : prev === 'feature' && lastSide === 'right' ? 'left' : 'right';
      ctx.side = side;
      lastSide = side;
    }

    const el = render(s, ctx);
    if (el && s.rules === true) el.classList.add('has-rules');
    if (el && el.childElementCount > 0) nodes.push(el);
    prev = s.type;
  }
  return nodes;
}
