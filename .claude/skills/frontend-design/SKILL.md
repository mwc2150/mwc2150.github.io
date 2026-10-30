---
name: frontend-design
description: Guides design, building, and refinement of Michael Chen's personal portfolio site (mwc2150.github.io). Use for any change to pages, visuals, copy, interactions, or layout.
---

# Michael's portfolio: design guide

Static site: plain HTML, CSS, vanilla JS. No framework, no build step. Hosted on GitHub Pages from the `mwc2150.github.io` repo. Keep it that way unless asked.

## Purpose and tone
- Audience: recruiters and hiring managers first, friends second. Must work for job hunting *and* be fun to hang out on.
- Feel: minimal and quiet, in the spirit of marco.fyi: lots of whitespace, big lowercase serif statements, hairline dividers, almost no chrome. The Sable-inspired desert survives only as small touches (a flat dune strip, a clickable sun, a rider who zooms off). Playful, never chaotic.
- Voice: warm, first person, plain words. No buzzword soup.

## Visual system
- Flat color only. No gradients, no drop shadows (use hard offset "ink" shadows instead). Palette lives in CSS variables in `css/style.css`; light ("day") and `data-theme="dusk"` themes both must stay readable.
- Hairlines (`--hair`) for dividers and pills; 2px ink outlines only on the sun, the dunes, and the rider.
- Headings: Fraunces. Body: Figtree. Generous spacing.
- Text contrast must pass WCAG AA in both themes. Use `--accent-text`, not `--accent`, for small text.

## Interactions
- Day/dusk toggle (nav button, and the sun), project filters, copy-email button, a rider that zooms across when clicked, playful hover states on project rows and toolkit pills.
- Everything is keyboard reachable with visible focus. Filters use `aria-pressed`.
- Respect `prefers-reduced-motion`: no floating, spinning, or zooming.
- No background music for now (there is no licensed track). If added later, it must never autoplay.

## Content rules
- Facts come from the resume and the GitHub repos. Do not invent metrics, links, outcomes, or personal details.
- Coursework (e.g. the MMM project) must be labeled "Coursework". In-progress work must be labeled "In progress".
- No phone number on the public site. Email, LinkedIn, GitHub only.
- No resume download link unless a real PDF exists at a working path.

## Verification
- Check local links and that every `id` referenced by JS exists.
- Use Playwright CLI to screenshot at about 1440, 820, and 390 px wide, in both themes, and look at the images.
- Run the web-design-guidelines skill before publishing.
- Do not claim browser testing that was not performed.
