# Capstone team portfolio

One-page portfolio for our UW capstone team: a homepage with an interactive grid hero, a hoverable project list with a linked project card, and a case study modal for each project.

Built with Vite, vanilla JavaScript (ES modules) and plain CSS. No framework.

## Run it

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build into dist/
npm run preview   # serve the built dist/ locally
```

## How to add or update a project

Every project is one JSON file in `content/projects/`. Adding a file adds the project to the list, the filters and the modal, with no code changes. Files starting with `_` are ignored.

1. Copy `content/projects/_template.json` to `content/projects/<slug>.json`.
2. Fill in the card fields and the `sections` you need. Order is up to you.
3. Put images in `public/images/<slug>/` and reference them as `/images/<slug>/file.jpg`.
4. Open `http://localhost:5173/#<slug>` to check it.

Missing images show a gray box with their alt text (and the missing path), so gaps are easy to spot.

**Using Claude Code:** paste the raw project material (notes, report text, slide text, image files) and ask it to add or update the project. It follows the rules in [`CONTENT_INTAKE.md`](CONTENT_INTAKE.md).

## Where things live

| Path | What |
|---|---|
| `content/site.json` | Tagline, nav links, Team Resume URL, filter labels, footer emails |
| `content/projects/*.json` | One file per project |
| `public/logo.svg` | Fox mark (placeholder; replace with the real file, same name) |
| `src/grid.js` | Hero grid animation. Tune it in the `CFG` object |
| `src/projects-list.js` | Filters, list, active-title rule, card, connector. `REVERT_TO_FIRST_ON_LEAVE` is at the top |
| `src/modal.js` | Modal open/close, focus, scroll lock, `#slug` deep links |
| `src/render/` | Case study renderer. `index.js` maps section `type` to a file in `sections/` |
| `src/styles/tokens.css` | Colors, radii, spacing, type sizes, font family |
| `docs/` | Original build handoff and reference screenshots |

## Deploying

The site deploys to Vercel from the GitHub repository (framework preset **Vite**, build command `npm run build`, output directory `dist`). No environment variables are needed.

- Every push to `main` redeploys production automatically.
- Every other branch and pull request gets its own preview URL, so the team can review changes (including new project content) before merging.
