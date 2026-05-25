# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Plain HTML/CSS/JS static site for the "miniforgedad" father & son miniature painting brand. No build tools, no dependencies, no compilation step — edit files and open in a browser.

## Development

No build or install commands. Open files directly in a browser or use any static file server:

```bash
python3 -m http.server 8080
```

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Main site — hero, story, gallery, content hub, on the bench, FAQ |
| `hpc.html` | `/hpc.html` | 2025 Independent Characters Hobby Progress Challenge tracker |
| `obs-ticker.html` | `/obs-ticker.html` | OBS Browser Source overlay (1920×60px) — not in main nav |

## Architecture

All CSS and JS is **inlined** in each HTML file — no external stylesheets or script files. Each page is fully self-contained.

### Design tokens (CSS custom properties)

```css
--ink: #1c1410        /* body text */
--parchment: #f5ede0  /* section backgrounds */
--green: #2d5a3d      /* primary accent */
--green-dark: #224730
--green-light: #e8f0eb
--gold: #b8882a       /* external link accent */
--mist: #8a7a6a       /* secondary text */
--light: #faf5ee      /* page background */
--rust: #c0522a       /* error/missed state */
```

### Typography

- Headings: `Playfair Display` (Google Fonts)
- Body: `Crimson Pro`
- Labels/mono: `DM Mono`

### Mobile nav pattern (both `index.html` and `hpc.html`)

Full-screen overlay that slides in from the right. Three pieces must stay in sync:
1. **HTML**: `<div class="nav-overlay" id="nav-overlay"></div>` before `<nav>`, hamburger `<button class="nav-toggle" id="nav-toggle">` inside `<nav>`, nav links as `<ul class="nav-links" id="nav-links">`
2. **CSS**: `.nav-toggle` hidden by default, shown at `max-width: 900px`; `.nav-links` uses `transform: translateX(100%)` / `.open { transform: translateX(0) }` for the slide
3. **JS**: `openNav()` / `closeNav()` functions wired to the toggle button, overlay click, and each nav link click

### External APIs (no keys required)

- **Bible verse**: `https://labs.bible.org/api/?passage=votd&type=json` — fetches NLT verse of the day on `index.html`; falls back to Jeremiah 29:11
- **Poll votes**: `https://api.countapi.xyz/` — persists cross-visitor vote counts for the HPC poll; namespace `miniforgedad-hpc-2025-poll`; falls back to `localStorage`

### HPC tracker (`hpc.html`)

- Month cards use `data-status="pending|active|complete|missed"` for styling
- Score bar numbers (1/12, 1/6, 2/18) are updated manually in the HTML
- Poll options are controlled by `const POLL_OPTIONS = [...]` at the top of the `<script>` block — rename = new counter, old votes lost
- Poll voted state stored in `localStorage` key `hpc-poll-voted-v1`

## Image folders

```
images/
  hero.jpg              ← site hero (right panel on desktop)
  about.jpg             ← story section main photo
  og-image.png          ← social share preview
  gallery/
    knights-1.jpg       ← main gallery, first knight photo (spans 2 cols)
    knights-2.jpg
    knights-3.jpg …     ← add more as needed
  hpc/
    sep-2025-before.jpg ← HPC tracker: before photo for that month
    sep-2025-after.jpg  ← HPC tracker: after photo for that month
    oct-2025-before.jpg
    oct-2025-after.jpg
    … (pattern: [mon]-[year]-before/after.jpg)
```

Adding a new gallery project: add a new comment block in the `.gallery-grid` in `index.html` and drop images in `images/gallery/`.

Adding HPC photos for a new month: drop files into `images/hpc/` following the naming pattern — `<img>` tags are already wired in `hpc.html` for each month.

## Standing conventions

- Always say **miniatures**, never "soldiers"
- Always update `README.md` when making changes to features or file structure
- Nav link color coding: green (`.nav-link-page`) for internal pages, gold + ↗ (`.nav-link-ext`) for external links
- Image paths: `images/hero.jpg`, `images/about.jpg`, `images/og-image.png`, `images/gallery/`, `images/hpc/`

## GitHub workflow

- Development branch: `claude/miniature-painting-website-c3UuZ`
- Always create a new PR after pushing — never assume a prior PR is still open (check first with `list_pull_requests`)
- MCP GitHub tools are scoped to `karieo/miniforgedad-website` only
