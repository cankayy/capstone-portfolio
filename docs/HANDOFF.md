# Capstone team portfolio: build handoff

You are building a one-page portfolio site for a four-person UW capstone team. This document is the source of truth. Read it fully, then look at every file in `reference/` before writing code.

The build has two goals that matter equally:

1. A homepage that matches `reference/01-homepage.png`, with the interactive grid hero, the hoverable project list and the project card.
2. A **content-driven case study system**. Each project opens in a modal whose layout follows the section structure in `reference/03-case-study-structure-full.png`. Real content does not exist yet. Later, the team will paste raw project content into Claude Code and expect it to be placed into the right sections automatically. Design every piece of this so that is easy.

---

## 1. Files in this handoff

| Path | What it is |
|---|---|
| `reference/01-homepage.png` | Homepage, default state (first project active). |
| `reference/02-project-modal-open.png` | The same page with a project modal open. Shows the modal's top section only. |
| `reference/03-case-study-structure-full.png` | A full case study page from another product (StayPass). **Use it for structure and section types only.** Its copy, serif typeface and app screenshots are not ours. |
| `reference/case-study-slices/part-1.png` … `part-10.png` | The same case study cut into 10 readable slices, top to bottom. Use these to read the small text. |
| `src/grid-animation.html` | Finished, dependency-free canvas grid animation for the homepage hero. Integrate it, do not rewrite it. |
| `content/projects/_template.json` | Every section type with every field, documented inline. |
| `content/projects/aps-transit.json` | First project filled with the placeholder copy visible in the screenshots. |
| `CONTENT_INTAKE.md` | The rules Claude Code follows later when the team pastes in real content. |

---

## 2. Tech stack

- **Vite + vanilla JavaScript (ES modules) + plain CSS.** No framework, no CSS library. The grid animation is already vanilla, and the site is small.
- Project content lives in **JSON files under `content/projects/`**, one file per project. A small renderer turns JSON sections into DOM.
- Static build output (`dist/`), deployed to **Vercel from a GitHub repository** once the team approves the front end (section 10). Keep Vite's default `base: '/'`.
- Add a `README.md` with `npm install`, `npm run dev`, `npm run build`, and a short "how to add a project" note pointing at `CONTENT_INTAKE.md`.

Suggested structure:

```
/
├─ index.html
├─ public/
│  ├─ images/<project-slug>/...     # project media
│  └─ logo.svg                      # fox mark (team will supply; use a placeholder until then)
├─ content/
│  ├─ site.json                     # nav links, tagline, filters, footer emails, resume link
│  └─ projects/
│     ├─ _template.json
│     ├─ aps-transit.json
│     └─ ...
├─ src/
│  ├─ main.js                       # boot, load content, wire up page
│  ├─ grid.js                       # grid animation, ported from src/grid-animation.html
│  ├─ projects-list.js              # list hover/active state, filters, connector curve, card
│  ├─ modal.js                      # open/close, focus trap, scroll lock, URL hash
│  ├─ render/
│  │  ├─ index.js                   # section type -> renderer map
│  │  └─ sections/*.js              # one file per section type
│  └─ styles/
│     ├─ tokens.css
│     ├─ base.css
│     ├─ home.css
│     ├─ modal.css
│     └─ sections.css
└─ README.md
```

Load all project JSON at build time with `import.meta.glob('/content/projects/*.json', { eager: true })`, skipping files that start with `_`.

---

## 3. Visual language

Match the screenshots. Where a value is not visible, use the closest reasonable value and keep it in `tokens.css` so the team can tune it.

**Color.** White page (`#fff`). Text is black (`#000` or `#111`). Secondary text is mid gray (about `#555`). Hairline borders are light gray (about `#e5e5e5`). The footer is solid black with white text. The modal backdrop is a black overlay at about 45% opacity that leaves the page visible underneath (see `02`).

**Type.** One sans-serif family throughout, roughly geometric with a clean italic (it reads close to Figtree or a similar grotesk). Expose it as `--font-sans` and load it from Google Fonts with a system fallback stack. Ask the team to confirm the exact family from their Figma file and leave a `TODO` comment if it is unconfirmed. Key treatments:
- Hero tagline: large, light gray weight, with the four verbs (**define**, **learn**, **design**, **ship**) in bold italic, darker.
- Project list titles: very large (about 64–72px on desktop). Regular weight by default. **Active title is bold italic.**
- Modal project title: large italic, regular to medium weight (see "Crosswalks & Signals" in `02`).
- Meta labels (ROLE, STAGE, PLATFORM, FOCUS): small caps-style uppercase, small size, gray. Values below in regular body size.

The case study reference uses a serif display face. **Do not copy that.** Every heading in our case study uses our sans family, with the italic display style from the modal title for section headings.

**Shape.** Pills (filters, nav, tags, footer email links) are fully rounded with a 1px border. The project card and modal have large radii (about 24px). Images inside the card and modal have about 20px radii. The footer has large rounded top corners (about 40px).

---

## 4. Homepage

Build top to bottom, matching `01-homepage.png`.

### 4.1 Header
- Fox logo at top left (`public/logo.svg`, placeholder until supplied). Links to top of page.
- Right side: a single soft gray pill containing three links: **Projects** (scrolls to the projects section), **Contact** (scrolls to the footer), **Team Resume** (opens the URL from `site.json` in a new tab; placeholder `#` for now).
- The header sits over the grid. It does not need to be sticky.

### 4.2 Hero with grid animation
- The hero is roughly the top 37% of the screenshot (about 680–720px tall at desktop width, not full viewport). Use `height: clamp(520px, 70vh, 720px)`.
- The grid canvas fills the hero only. The grid stops at the hero's bottom edge, and everything below sits on plain white.
- Tagline left-aligned on the content column: "We **define** the product, **learn** from users, **design** every screen, and **ship** it in code." The text comes from `site.json`. The `<strong><em>` spans are marked in the JSON with `*asterisks*`.

**Integrating `src/grid-animation.html`:**
- Move the script into `src/grid.js` as an exported `initGrid(canvasEl)` function. Keep the `CFG` object, the math and the behavior exactly as written.
- Keep its CSS for the canvas (`position:absolute; inset:0`). Change the `.hero` height as above. Drop the file's `html, body` rules, since global styles live in `base.css`.
- The tagline and header must sit above the canvas (`position: relative; z-index: 1`) and must not block pointer events from reaching the window listener. The script listens on `window`, so this already works. Keep it that way.
- It already handles `prefers-reduced-motion`, DPR, resize and pausing offscreen. Do not remove any of that.

### 4.3 Filters
A row of pills under the hero: **All Projects** (default, filled black with white text), **Product Definition**, **User Research**, **UX/UI Design**, **Front-End Development**. These come from `site.json`.
- Clicking a pill filters the project list to projects whose `categories` array includes it. Only one filter is active at a time.
- After filtering, the first visible project becomes the active one.
- Use `<button aria-pressed>` for each pill.

### 4.4 Project list, connector and card (the core interaction)

Layout: the list of project titles on the left, the project card on the right, with a curved line connecting the active title to the card.

**Active-title rule.** Exactly one title is styled bold italic at any moment.
- **On page load, the first project in the list is active**, matching the screenshot.
- Hovering a title makes it active and returns all others to regular weight. Never show two bold italic titles at once.
- When the pointer leaves the list, the last-hovered title stays active, so the card on the right always matches a bold title. Put this behavior behind a constant `REVERT_TO_FIRST_ON_LEAVE = false` so the team can switch it to reverting to the first project if they prefer.
- Keyboard focus counts as hover. Tabbing to a title makes it active.
- Swap the weight and style with no layout shift. Reserve the bold italic width, for example with a hidden bold italic duplicate using `::after { content: attr(data-text); }`, or use a variable font and set a fixed width.

**Card.** The card on the right shows the active project's:
- Thumbnail image (left half of the card, rounded)
- Small icon and short name (for example the walking-person icon and "APS")
- Summary paragraph
- Tag pills (for example "Product Management", "Information Management")

When the active project changes, crossfade the card content quickly (about 200ms). Respect reduced motion by swapping instantly.

**Connector.** An SVG curve from just right of the active title's baseline to the card's left edge, with a small filled dot at each end (see the screenshot: it dips down in the middle like a smile). Recompute and animate it when the active title changes and on resize. Hide it below the desktop breakpoint.

**Opening a project.** Clicking a title **or** anywhere on the card opens that project's modal. Titles are `<button>` elements. The card is a `<button>` or has `role="button"` with `tabindex="0"`, and Enter or Space opens it.

### 4.5 Footer
Solid black block with large rounded top corners. On the left, "Get in touch →" in large white text. Next to it, outlined pill links for each team email (`athanc@uw.edu`, `c4nnkayy@uw.edu`, `hchang42@uw.edu`, `jserra2@uw.edu`) as `mailto:` links. These come from `site.json`.

### 4.6 Responsive
- **Desktop (≥ 1024px):** as in the screenshot.
- **Tablet and phone (< 1024px):** hide the connector. Stack the card below the list. On touch devices, where there is no hover, the first tap on a title makes it active and updates the card, and a tap on an already active title or on the card opens the modal.
- **Phone (< 640px):** title sizes scale down with `clamp()`. Filters scroll horizontally in one row. The footer stacks with emails wrapping.

---

## 5. Project modal

`02-project-modal-open.png` shows the top of the modal. The rest of the modal is the full case study (section 6).

**Shell**
- Fixed, full-screen overlay with a dim backdrop. A centered white panel of about 1240px max width, large radius, with a small margin from the top of the viewport.
- The panel scrolls internally. The page behind does not scroll (lock body scroll, preserving scroll position).
- Close button (thin ×) at the top right of the panel, over the banner image. It stays visible while scrolling (sticky within the panel).
- It closes on: the × button, Escape, or a click on the backdrop outside the panel.
- Use `<dialog>` with `showModal()` for the built-in focus handling and Escape support, or implement a focus trap manually. Return focus to the title or card that opened it.
- Opening animation: a quick fade of the backdrop and a short rise of the panel. Reduced motion means none.

**Deep linking.** Opening a project sets `location.hash` to `#<slug>`. Loading the page with a valid hash opens that modal. Closing clears the hash. The browser back button closes the modal.

**Top of modal (matches `02`)**
1. Full-width banner image (the Seattle skyline in the screenshot), about 300px tall, cropped with `object-fit: cover`.
2. Two-column intro: on the left the italic title, a summary paragraph and a 2×2 meta grid (ROLE, STAGE, PLATFORM, FOCUS). On the right, a tall rounded image.

This top block is the `intro` section type in section 6. Everything below it is rendered from the project's `sections` array.

---

## 6. Case study section system

This is the part that has to hold up when real content arrives. The renderer reads a project's `sections` array in order and renders each item by its `type`. **Section order is decided by the JSON, not hardcoded.** A project may use any subset of the types, in any order, and may repeat types.

The types below were derived from `03-case-study-structure-full.png`. The slice numbers tell you where to look.

| `type` | What it looks like | Ref |
|---|---|---|
| `intro` | Banner image, then two columns: title, summary and meta grid on the left, image on the right. Always first. In our modal this is the layout from `02`. | `02`, part-1 |
| `overview` | Eyebrow, big heading, lead paragraph, then a row of 2–4 short "pillars" (number, title, one line). | part-1, part-2 |
| `feature` | Two columns: text on one side (number + label eyebrow, italic heading, body, optional bullet list, optional small pill note) and media on the other (one or two device or screen images on a soft panel). The `side` field sets which side the media is on, and consecutive features alternate automatically if `side` is omitted. Hairline divider between consecutive features. | part-2 to part-4 |
| `comparison` | Eyebrow, big heading, lead paragraph, then two columns labeled A and B (eyebrow, heading, body, media below), with an arrow between the media. Used for before/after or old/new. | part-5, part-6 |
| `steps` | Optional eyebrow and intro sentence on one row, then a grid of numbered steps (3 per row on desktop), each with a title and one line. Use only when the content really is a sequence. | part-6, part-7 |
| `split` | Two columns, each with an eyebrow, a medium heading and a short paragraph. Used to contrast two responsibilities, owners or approaches. | part-7 |
| `gallery` | Eyebrow, big heading, lead paragraph, then a 2-column grid of tiles. Each tile has a label (top left), an optional small code or caption label (top right), an image, and an optional `dark: true` background. | part-7, part-8 |
| `media-pair` | Eyebrow, big heading, lead paragraph, then two images side by side (unequal widths allowed) with captions below, then an optional numbered list in 3 columns. | part-9, part-10 |
| `architecture` | Eyebrow, big heading, lead paragraph, a row of tech/tool pills, then a horizontal flow of 2–5 cards joined by arrows (each card has an eyebrow, title and one line), then an optional small status note. | part-10 |
| `text` | Fallback: eyebrow, heading, one or more paragraphs. Use for anything that does not fit another type. | none |
| `image` | Fallback: one full-width image or video with optional caption. | none |

Exact fields for each type are in `content/projects/_template.json`. Build to that file.

**Renderer rules**
- Every field except `type` is optional. A missing field renders nothing (no empty wrappers, no "undefined").
- A missing image renders a neutral gray placeholder box at the right aspect ratio with the alt text written inside it. This makes gaps obvious during content entry.
- Unknown `type` values log a console warning and render through `text` if they have text fields, otherwise nothing.
- Text fields support a tiny inline syntax: `*bold italic*` and `[link text](url)`. Escape everything else. Never inject raw HTML from JSON.
- All images get `loading="lazy"` except those in the `intro`, and `alt` comes from the JSON.
- The modal content column is about 840px wide for text-only sections and the full panel width for two-column and grid sections, matching the case study's proportions.

**Project-level fields** (also in the template): `slug`, `title` (list title, for example "APS Transit"), `order`, `categories` (must match filter labels), and a `card` object (`shortName`, `icon`, `summary`, `tags`, `image`). The homepage list and card read only these. The modal reads `sections`.

---

## 7. Accessibility and quality floor

- All interactive elements are real buttons or links, with visible focus styles (a 2px black outline offset by 3px works with this design).
- The grid canvas stays `aria-hidden="true"`.
- Color contrast passes WCAG AA for body text. The light gray hero tagline text must still pass, so darken it slightly if needed.
- `prefers-reduced-motion`: no card crossfade, no modal animation, no connector animation. The grid already handles itself.
- Lighthouse: aim for 95+ on Accessibility and Best Practices.
- Test at 1440, 1024, 768 and 390px widths.

---

## 8. Build order

1. Scaffold Vite, tokens, base styles and fonts.
2. Header, hero and grid. Confirm the grid animation behaves exactly as in the standalone file.
3. Filters, list, card and connector, with the active-title rule. Verify that only one title is ever bold italic and that the first is active on load.
4. Footer.
5. Modal shell: open, close, focus, scroll lock, hash.
6. Section renderers, one type at a time, checked against the matching reference slice using the filled `aps-transit.json`.
7. Add two more placeholder projects ("Figma", "UW Comotion", "Cheerful AI" are the list titles in the screenshot) using copies of the template with placeholder content, so the list, filters and modal are tested with four projects.
8. Responsive pass, accessibility pass, README.
9. Stop and ask the team to review. Deploy only after approval (section 10).

## 9. Done means

- The homepage matches `01` at 1440px wide.
- Opening "APS Transit" shows the `02` layout at the top, followed by every section type from `_template.json` rendering correctly.
- Adding a new JSON file to `content/projects/` adds a project to the list, the filters and a working modal with no code changes.
- `CONTENT_INTAKE.md` is still accurate after the build. Update it if any field names changed.
- After approval, the site is live on Vercel from the GitHub repository, and pushes to `main` deploy automatically.

---

## 10. Launch: GitHub + Vercel (only after approval)

**Do not deploy or push anything until the team explicitly says the front end is approved.** Until then, work locally with `npm run dev` and share progress through `npm run build && npm run preview`.

From the start of the build, keep the project deploy-ready so launch is a short step:
- Run `git init` at the start and commit at each build-order milestone with clear messages.
- Add a `.gitignore` covering `node_modules/`, `dist/`, `.vercel/`, `.env*` and `.DS_Store`.
- `npm run build` must finish with no errors or warnings, and the built site must work when served from `dist/`.
- All asset paths must be root-relative (`/images/...`) and resolve in the production build.
- Commit no secrets or API keys. This site needs none.

**When the team approves, walk them through launch step by step:**

1. **Create the GitHub repository.** If the GitHub CLI (`gh`) is installed and logged in, run `gh repo create <name> --private --source=. --push` (or `--public`, whichever the team chooses). Otherwise, give the team the exact steps to create an empty repository on github.com, then add the remote and push `main`. Ask which team member's account or organization should own the repository before creating it.
2. **Connect Vercel.** Have the team sign in at vercel.com with GitHub, choose **Add New → Project**, and import the repository. Vercel detects Vite automatically. Confirm these settings: framework preset **Vite**, build command `npm run build`, output directory `dist`, install command `npm install`. No environment variables are needed. If the Vercel CLI is installed and logged in, `vercel` followed by `vercel --prod` is an alternative, but the GitHub import is preferred because it enables automatic deploys.
3. **Verify the live site.** Open the production URL and check the grid animation, hover states, filters, every project modal, a deep link (`/#aps-transit`), the footer email links and the Team Resume link. Check it on a phone as well.
4. **Explain the workflow going forward.** Every push to `main` redeploys production automatically. Every other branch or pull request gets its own preview URL, so the team can review changes (including new project content) before merging.
5. **Custom domain (optional).** If the team has one, add it under Project Settings → Domains in Vercel and follow the DNS instructions Vercel shows.

Routing uses URL hashes only, so no `vercel.json` rewrites are needed. Add a `vercel.json` only if a later feature requires it.

Add a short "Deploying" section to `README.md` covering the push-to-deploy workflow and preview URLs.
