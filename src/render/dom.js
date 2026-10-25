// Small DOM helpers shared by the homepage and the case study renderers.
// Everything from JSON goes in as text nodes. Nothing is ever set through innerHTML.

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style') el.style.cssText = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const child of [children].flat(Infinity)) {
    if (child == null || child === false || child === '') continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

/** True when a JSON value has something worth rendering. */
export function has(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.some(has);
  if (typeof value === 'object') return Object.entries(value).some(([k, v]) => !k.startsWith('_') && has(v));
  return true;
}

/** Array field with empty entries dropped. */
export function list(value) {
  return Array.isArray(value) ? value.filter(has) : [];
}

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

/**
 * Inline syntax: *bold italic* and [link text](url). Everything else is plain text.
 * Returns an array of nodes.
 */
export function rich(text) {
  const out = [];
  const pattern = /\*([^*\n]+)\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
  const source = String(text);
  let last = 0;
  let match;
  while ((match = pattern.exec(source))) {
    if (match.index > last) out.push(source.slice(last, match.index));
    if (match[1] != null) {
      out.push(h('strong', null, h('em', null, match[1])));
    } else if (SAFE_URL.test(match[3])) {
      const external = /^https?:/i.test(match[3]);
      out.push(h('a', { href: match[3], target: external && '_blank', rel: external && 'noopener noreferrer' }, match[2]));
    } else {
      out.push(match[2]);
    }
    last = pattern.lastIndex;
  }
  if (last < source.length) out.push(source.slice(last));
  return out;
}

/** One element with inline-formatted text, or null when the value is empty. */
export function text(tag, cls, value) {
  return has(value) ? h(tag, { class: cls }, rich(value)) : null;
}

/** Paragraphs split on blank lines ("\n\n" in JSON). */
export function paragraphs(value, cls) {
  if (!has(value)) return [];
  return String(value)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => h('p', { class: cls }, rich(p)));
}

/** Two-digit number for numbered items: 1 -> "01". */
export function pad(n) {
  return String(n).padStart(2, '0');
}
