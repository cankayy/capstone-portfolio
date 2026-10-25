# Capstone team portfolio

Vite + vanilla JS + plain CSS. Project content is JSON in `content/projects/`, rendered by `src/render/`.

- When someone pastes project content (notes, reports, slide text, images) and asks to add or update a project, follow `CONTENT_INTAKE.md` exactly. Do not change renderer code to fit content.
- Section types and their fields are defined in `content/projects/_template.json`. If you add or rename a field, update the template, the renderer in `src/render/sections/`, and `CONTENT_INTAKE.md` together.
- Original spec and reference screenshots: `docs/HANDOFF.md`, `docs/reference/`.
- Do not push or deploy unless the team explicitly asks (see `docs/HANDOFF.md` section 10).
- Check work with `npm run build` (must be free of warnings) and `npm run dev`, then open `/#<slug>`.
