# Miniforgedad

Source for [miniforgedad.com](https://miniforgedad.com), a father-and-son miniature painting site. Static HTML, CSS and JavaScript; Netlify Functions handle password-protected updates. No frontend build step.

## Pages

| Page | Purpose |
|---|---|
| `/` | Knight hero, painter galleries, tutorials, Instagram links, FAQ and contact |
| `/start` | New visitor path: story, gallery, beginner tutorials |
| `/story` | Confirmed father-and-son hobby story |
| `/gallery` | Shared portfolio with painter, collection and status filters; accessible photo dialog |
| `/dad`, `/son` | Painter-specific views of the same gallery data |
| `/tutorials` | Ten attributed community tutorials across three levels |
| `/tutorial` | Original thinning-paints article |
| `/stream` | Existing YouTube live page |
| `/upload` | Mobile gallery editor; excluded from search indexing |
| `/brand-kit` | Profile images, channel banner, browser-only thumbnail maker and OBS downloads; excluded from search indexing |
| `/upload-archive` | Preserved legacy HPC and ticker controls |
| `/hpc` | Archived tracker, retained at its original URL and removed from public navigation |

## Shared files

- `site-brand.css`, `site-nav.js`: burgundy/ivory/brass identity and responsive navigation.
- `site-pages.css`: layouts for Start Here, story, gallery and brand kit.
- `gallery-data.js`: `const GALLERY = [...]` containing strict JSON. Stable entry IDs allow editing; keep this format for the publisher.
- `gallery.js`: shared gallery rendering, filters, source links and modal photos.
- `gallery-editor.js`: local image preparation, text drafts and publishing UI.
- `tutorials-data.json`, `tutorials.js`: attributed external lessons and level filters.
- `assets/brand-kit/`: approved primary and badge marks, PNG/SVG exports, setup guide and ZIP.
- `stream-assets/`: matching 1920×1080 OBS browser sources and transparent lower third. Existing `Stream assets/` scene URLs are retained.
- `obs-ticker.html`, `ticker-data.js`: existing live ticker, recoloured to match. Browser Source size: 1920×60.

## Gallery publishing

Open `/upload` on a phone or desktop. Add or select a photo, enter its title and alt text, choose painter and status, add notes and an optional Instagram/YouTube source, then publish with the existing admin password. Each upload is resized to a maximum edge of 1280 pixels and encoded as JPEG in the browser. Text drafts use local storage; password and photo data are excluded.

`netlify/functions/gallery-project.js` uses existing host environment variables `UPLOAD_PASSWORD` and `GITHUB_TOKEN`. Never commit these values. The token needs repository contents write access. A photo and gallery metadata are committed together against an exact main-branch commit. Stale edits and concurrent branch changes return a conflict instead of overwriting newer work. Publishing requires the normal hosting deployment to finish before the changes appear; reload the editor before another edit.

The admin HTML is publicly loadable but publishing is authenticated server-side. `noindex` is an indexing preference, not access control. Existing archive and ticker endpoints are preserved.

## Brand kit

Palette: burgundy `#421F2C`, ivory `#F4EADD`, brass `#CDA468`. Use the approved anvil/brush primary mark or workshop badge. Profiles are 512×512; banner is 2560×1440 with central content; thumbnail exports are 1280×720. Download and extract the complete ZIP to keep relative OBS asset paths intact. Banner/profile uploads to social accounts and adding sources in OBS remain manual account setup steps.

Instagram gallery imports use accessible post/reel previews with original source links. Individual painter credits and dates are omitted when unconfirmed. Replace previews with original photographs through the editor when available.

## Checks

```sh
node --test tests/gallery-project.test.js
node --check gallery.js
node --check gallery-editor.js
node --check brand-kit.js
```

The backend tests cover authentication, input validation, source URL restrictions, atomic image/metadata commits, stale edits and concurrent branch changes. Browser checks cover responsive navigation, gallery filters/photo dialogs, editor selection/drafts and thumbnail download. A real authenticated gallery save needs a controlled production check with the owner’s password; mocked tests do not prove host credentials or token permissions.
