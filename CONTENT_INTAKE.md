# Content intake: turning raw project content into a case study

Use this file whenever a team member pastes content for a project (notes, a report, a Google Doc export, slide text, bullet dumps, image files) and asks you to add or update that project.

## What you produce

One JSON file at `content/projects/<slug>.json` that follows `content/projects/_template.json`, plus any images copied into `public/images/<slug>/`. Do not change renderer code to fit content. If something truly cannot fit, use the `text` or `image` fallback types and say so in your summary.

## Steps

1. **Read everything first.** Identify the project title, a one-line purpose, the team roles, the stage, the platform, the focus and the main outcome.
2. **Fill the project-level fields.** `slug` is kebab-case from the title. `categories` must use the exact filter labels: Project Management, User Research, UX/UI Design, Front-End Development. Pick only those the content supports.
3. **Write the card.** `summary` is 2–4 sentences: what was studied or built, and the result. Keep any numbers exactly as given. `tags` are 1–3 short disciplines. If the team supplies an organization or product logo for the card, put it in `card.logo` (`src`, `alt`); it replaces the icon and short name.
4. **Build `sections` in narrative order.** Use the mapping below. The usual order is: intro → overview → feature (one per key finding or deliverable) → comparison → steps → split → gallery → media-pair → architecture. Skip anything the content does not support. Reorder when the story reads better another way.
5. **Place images.** Match each supplied image to the section it illustrates by filename, caption or surrounding text. Write real `alt` text describing what the image shows. If a section needs an image that was not supplied, leave `"src": ""` with a descriptive `alt`. The site shows a labeled placeholder.
6. **Validate.** The JSON parses, every `type` is known, there are no leftover `[Placeholder]` strings unless intended, `npm run build` finishes with no warnings, and the project opens at `/#<slug>` in `npm run dev` with no console warnings. A gray box labeled "Missing: /images/..." means an image path does not match a file in `public/`.
7. **Report back** with: the sections you created and why, any content you could not place, any images still missing, and any facts you were unsure of.

## Mapping raw content to section types

| If the content contains… | Use |
|---|---|
| Title, summary, roles, stage, platform, focus, hero photo | `intro` (always first) |
| Problem statement, goal, or "what this project is" framing, often with 2–4 themes or principles | `overview` (themes become `pillars`) |
| A key finding, feature, recommendation, screen or deliverable with its own explanation | `feature`, one per item, with `number` in order (01, 02…) |
| Before/after, current vs proposed, old design vs new design, competitor vs ours | `comparison` |
| A method, research process, timeline or pipeline with ordered stages | `steps` (only for true sequences) |
| Two contrasting responsibilities, perspectives or user groups | `split` |
| Many visual artifacts: components, screens, style tiles, sketches, maps | `gallery` |
| Tooling, prototypes or testing setups shown with 2 images and a short list | `media-pair` |
| Tech stack, system diagram, data flow, or how parts of a solution connect | `architecture` (`tools` = stack pills, `flow` = 2–5 stages) |
| Anything else worth keeping (budget breakdown, next steps, acknowledgements) | `text` |
| A standalone large image or video | `image` |

## Writing rules

- **Never invent facts, numbers, quotes or results.** You may shorten, split and reorganize, but meaning must stay the same. If a field would need made-up content, leave it out.
- Headings are short statements in sentence case, under about 10 words. They are written in the team's voice ("We…") where natural.
- Separate paragraphs inside one text field with a blank line (`\n\n` in the JSON string).
- Body text: short paragraphs, plain words, active voice. Feature bodies are 40–90 words. Pillar and step lines are one sentence.
- Bullets are fragments under about 8 words each, 2–4 per feature.
- Keep acronyms as the team writes them, and spell each out once on first use (for example "Accessible Pedestrian Signals (APS)").
- Use `*asterisks*` only for the rare bold italic emphasis the team asks for.

## Updating an existing project

Edit the existing JSON in place. Keep sections the new content does not touch. Do not reorder unless asked. List what changed in your report.
