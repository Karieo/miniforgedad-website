# miniforgedad-website

Source for [miniforgedad.com](https://miniforgedad.com) — a father & son miniature painting brand. Plain HTML/CSS/JS, no build tools or dependencies required.

---

## Pages

| File | URL | Description |
|---|---|---|
| `index.html` | `/` | Homepage — hero, why we do this, painters, gallery preview, videos, tutorials, on the bench, Instagram, FAQ, newsletter |
| `gallery.html` | `/gallery.html` | Full gallery — filter by painter and faction |
| `story.html` | `/story.html` | Our story — long-form, milestones, photo wall |
| `tutorial.html` | `/tutorial.html` | Tutorial article — "Thinning your paints" |
| `dad.html` | `/dad.html` | Dad's painted miniatures |
| `son.html` | `/son.html` | Son's painted miniatures |
| `hpc.html` | `/hpc.html` | 2025 Independent Characters Hobby Progress Challenge tracker |
| `stream.html` | `/stream.html` | YouTube live stream embed — shows the stream when live |
| `obs-ticker.html` | `/obs-ticker.html` | OBS Browser Source ticker overlay (1920×60px) |

`index.html`, `gallery.html`, `story.html` and `tutorial.html` use the **forge**
design language (see below). `dad.html`, `hpc.html` and `stream.html` are still
on the older parchment/green styling.

---

## Project structure

```
miniforgedad-website/
├── index.html          # Homepage
├── gallery.html        # Full gallery with painter + faction filters
├── story.html          # Our story
├── tutorial.html       # Tutorial article
├── dad.html            # Dad's miniatures
├── son.html            # Son's miniatures
├── hpc.html            # HPC 2025 tracker
├── stream.html         # YouTube live stream page
├── obs-ticker.html     # OBS ticker overlay
├── gallery-data.js     # Single source of truth for all gallery photos
├── hpc-data.js         # Single source of truth for the HPC tracker
├── upload.html         # Private page for phone uploads + month editing
├── live-status.js      # Reveals the nav "Live" pill when streaming
├── netlify/
│   └── functions/
│       ├── live-status.js        # Server-side YouTube live check (hides the API key)
│       ├── upload-hpc-photo.js   # Commits an uploaded photo to images/hpc/
│       └── update-hpc-month.js   # Edits a month's caption/status in hpc-data.js
└── images/
    ├── og-image.png     # Social preview image (1200×630px recommended)
    ├── placeholder.svg  # Development placeholder
    ├── gallery/         # Gallery photos (see gallery-data.js)
    │   ├── knights-1.jpeg … knights-5.jpeg
    │   └── Psychophase-1.jpg, Psychophase-2.jpg
    └── hpc/             # HPC tracker before/after photos
        └── [mon]-[year]-before/after.jpg
```

---

## The forge design language

The redesigned pages share one palette and type system. There's no build step and
no shared stylesheet — each page inlines its own CSS, so these values are repeated
per file. Change one, change them all.

```css
--ink:       #100E0C   /* page background, dark sections */
--panel:     #16110E   /* raised panel on dark */
--slot:      #1B1714   /* image placeholder on dark */
--bone:      #F5F1EA   /* text on dark; background of light sections */
--orange:    #E2622C   /* primary accent */
--orange-lt: #F2854F   /* accent hover */
--gold:      #C9A227   /* eyebrow + rules on dark */
--rust:      #9A5024   /* eyebrow on light sections */
--amber:     #E9A96A   /* painter credit on gallery cards */
--shade:     #E4DED3   /* image placeholder on light */
```

- **Headings** Archivo (900 for display, 600–800 for sub-heads), uppercase, tight `-.04em` tracking
- **Body** Newsreader 300, with italic for pull-quotes
- **Labels** DM Mono, uppercase, wide `.14em`–`.2em` tracking
- Pages are dark by default; gallery and tutorial-card sections flip to `--bone`
- Nav is 74px sticky; on mobile it wraps and the link row scrolls horizontally

### Photo placeholders

Sections that need photos we don't have yet render a `.slot` — a styled block
labelled with what belongs there. To fill one, replace the inner `<span>` with an
image:

```html
<!-- before -->
<div class="slot"><span>Photo of Dad</span></div>

<!-- after -->
<div class="slot"><img src="images/painters/dad.jpg" alt="Dad at the desk" /></div>
```

Slots are on the homepage (hero, painters, video thumbnails, Instagram),
`story.html` (wide photo, candid, photo wall) and `tutorial.html` (hero, steps).

### Uploading and editing from your phone

`/upload.html` is a private page with two tabs:

- **Add photo** — pick the month and Before/After, choose the photo. It resizes
  on your device, names the file correctly, and commits it.
- **Edit month** — change a month's caption, status or badge. Pre-fills with
  what's currently set so you can see before you change it.

Both commit straight to `main`; Netlify rebuilds and it's live in about a minute.

**One-time setup** — two more Netlify environment variables:

| Variable | What |
|---|---|
| `UPLOAD_PASSWORD` | Any passphrase. Gates the page. |
| `GITHUB_TOKEN` | A [fine-grained token](https://github.com/settings/personal-access-tokens) scoped to **this repo only**, with **Contents: Read and write**. Nothing else. |

Until both are set the page returns "Uploads are not configured yet".

**Notes**
- Photos are resized to 1600px on the long edge and re-encoded as JPEG before
  upload, so a 5MB phone photo arrives as a few hundred KB and the committed
  file is always a real `.jpg`.
- Uploading to a month that already has that shot **replaces** it.
- The filename is built server-side from the month you pick, so nothing can be
  written outside `images/hpc/`.
- The page is `noindex`, but it is not secret — the password is what protects
  it. Use a decent one.

### The "Live" pill

The Live button in the nav only appears while the YouTube channel is **actually
streaming**. It's hidden in the HTML by default and revealed by JavaScript, so it
never shows on a guess.

Two pieces:

| File | Role |
|---|---|
| `netlify/functions/live-status.js` | Asks the YouTube API server-side, so the key stays private. Returns `{ live: true/false }`. |
| `live-status.js` | Runs on the page, calls that endpoint, and reveals the pill only on `live: true`. |

**One-time setup** — until this is done the pill simply never appears:

1. Create a free YouTube Data API v3 key at
   [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   (new project → enable "YouTube Data API v3" → create an API key).
2. In Netlify: **Site configuration → Environment variables** →
   `YOUTUBE_API_KEY` = your key.
3. Redeploy.

`YOUTUBE_CHANNEL_ID` is an optional second variable; it defaults to the current
channel, so you only need it if the channel changes.

**Quota** — two API units per check against a free 10,000/day allowance, and
responses are CDN-cached for five minutes, so it's roughly 576 units a day no
matter how much traffic the site gets.

**It fails safe.** Missing key, expired key, exhausted quota, network error, JS
disabled — every one of those hides the pill rather than falsely advertising a
stream. The tradeoff is up to five minutes of lag either side of going live.

To add the pill to another page, mark the element and include the script:

```html
<a href="stream.html" class="nav-live" data-live-pill style="display:none">…</a>
<script src="live-status.js" defer></script>
```

The inline `display:none` is deliberate — it beats whatever `display` the page's
own nav CSS sets without needing a rule in every stylesheet.

### Newsletter

The signup form on the homepage is **inert** — a static site has no backend to
accept a POST. Submitting reveals a note pointing at email instead. To make it
real, point the `<form>` at a hosted form service (Buttondown, Mailchimp,
Formspree) and drop the `submit` handler at the bottom of `index.html`.

---

## Deploying

The site is plain HTML — drop it anywhere that can serve static files.

**GitHub Pages**
1. Go to Settings → Pages
2. Set source to `main` branch, `/ (root)`
3. Site will be live at `https://karieo.github.io/miniforgedad-website`

**Netlify / Cloudflare Pages**
1. Connect this repo
2. Build command: *(leave blank)*
3. Publish directory: `.` (root)

---

## Verse of the day

A verse of the day banner sits prominently below the nav on the main page. It fetches automatically from the [labs.bible.org API](https://labs.bible.org/api_guide.php) (NLT translation, no API key required) and refreshes each page load. If the API is unreachable, it falls back to Jeremiah 29:11.

No configuration needed — it just works.

---

## Adding photos

### Gallery (all pages)

Every gallery photo on the site comes from one file: **`gallery-data.js`**. Drop the
image into `images/gallery/`, add an entry, and it appears on the gallery page and
the right painter's page automatically — no HTML editing.

```js
{
  painter: 'dad',                       // 'dad' or 'son' — drives dad.html / son.html
  src: 'images/gallery/my-photo.jpeg',
  alt: 'Short alt text',
  title: 'Model name',                  // shown in the home-page overlay + lightbox
  description: 'Painting notes…',       // shown in the lightbox panel
  featured: true,                       // also show on the home page (max 9)

  // gallery.html fields — all optional
  faction: 'Imperial Knights',          // adds/uses a faction filter chip
  year: 2025,                           // shown under the card title
  credit: 'Together',                   // 'Dad' | 'Son' | 'Together' (defaults to painter)
  caption: 'Heraldry detail',           // short card title (defaults to title)
},
```

**Notes**
- Cards render in the order listed in `gallery-data.js`, on every page.
- Filter chips are built from the data — add a new `faction` and its chip appears
  on its own. Entries without a faction still show under **All**.
- Use `credit: 'Together'` for pieces you both worked on. Leave `painter` as `'dad'`
  or `'son'` so the piece still shows up on that painter's page.

### Story section (`index.html`)
Replace the `📷 Add photo` placeholder divs in `.story-image-grid` with:
```html
<div class="story-img">
  <img src="images/your-photo.jpg" alt="Description" class="loaded" />
</div>
```

### Social preview (`og-image.png`)
Used by Discord, Twitter/X, iMessage, etc. when someone shares your URL. Recommended size: **1200×630px**. Replace `images/og-image.png` with your image.

---

## Updating "On the Bench"

Edit the bench card in `index.html` — find the `<!-- ON THE BENCH -->` section and update:

```html
<h3>Your current project name</h3>
<p>What stage it's at, what techniques you're using...</p>
<div class="bench-tags">
  <span class="bench-tag">Tag 1</span>
  <span class="bench-tag">Tag 2</span>
</div>
```

---

## HPC 2025 tracker (`hpc.html`)

The [Independent Characters Hobby Progress Challenge](https://theindependentcharacters.com/blog/the-2025-hobby-progress-challenge/) runs **September 2025 – August 2026**.

### Editing a month

Everything the tracker shows lives in **`hpc-data.js`** — statuses, badges and
captions. Edit it there, or use `/upload.html` on your phone, which writes to it
for you.

```js
{
  "name": "June 2026",
  "slug": "jun-2026",          // photo filenames: images/hpc/jun-2026-before.jpg
  "status": "complete",        // pending | active | complete | missed
  "badge": "Complete",         // the label on the card — free text
  "notes": "What you painted…" // the caption under the photos
}
```


### Adding before/after photos

Place photos in `images/hpc/` using the naming convention `[mon]-[year]-before.jpg` / `[mon]-[year]-after.jpg` (e.g. `sep-2025-before.jpg`, `may-2026-after.jpg`). The `<img>` tags are already wired up in `hpc.html` — just drop the correctly named files into the folder and they'll appear automatically.

### Marking a bonus category complete

Add `class="done"` to the `.bonus-card`:

```html
<div class="bonus-card done">
```

### Updating the poll options

The "What should I paint next?" poll is driven by a config array at the top of the `<script>` block in `hpc.html`. To change the options, edit the array:

```js
const POLL_OPTIONS = [
  "Space Marine Intercessor Squad",
  "Chaos Daemon Prince",
  "Your New Option Here",  // ← add, remove, or rename freely
];
```

**Notes:**
- Adding or removing an option takes effect immediately
- Renaming an option creates a brand new counter — old votes for that option are lost
- Votes are stored via [countapi.xyz](https://api.countapi.xyz) and persist across all visitors
- If the API is unreachable, votes are saved in the visitor's browser and the poll still works

### The score bar

**It counts itself.** Monthly entries = months with `status: "complete"`, bonus
entries = bonuses with `done: true` (capped at 6), total = the two added. There
are no numbers to keep in step by hand — change a status and the bar follows.


### Current progress

| Category | Earned | Possible |
|---|---|---|
| Monthly entries | 4 | 12 |
| Bonus entries | 1 | 6 |
| **Total** | **5** | **18** |

**Completed months:** September 2025 (Imperial Knight Paladin — Titanic bonus),
October 2025, November 2025, December 2025

---

## OBS ticker (`obs-ticker.html`)

Used as an OBS Browser Source overlay. Displays a scrolling ticker with live news from Warhammer hobby RSS feeds, Central Time clock, and Austin TX weather.

**OBS setup:**
- Source type: Browser Source
- URL: `https://yourdomain.com/obs-ticker.html`
- Width: `1920`, Height: `60`
- ✅ Shutdown source when not visible

**Configuring the ticker** — edit `TICKER_CONFIG` near the top of `obs-ticker.html`:

```js
const TICKER_CONFIG = {
  currentTopic: "Today's project: ...",   // shown as "Now: ..."
  schedule: "Live every Tue & Thu at 7PM CT",
  messages: [ "..." ],                    // custom scrolling messages
  twitch:    "miniforgedad",
  youtube:   "@miniforgedad",
  instagram: "@miniforgedad",
  patreon:   "patreon.com/miniforgedad",
  scrollSpeed: 30,                        // seconds for one full scroll
  newsFeeds: [ ... ],                     // toggle feeds on/off here
  headlinesPerFeed: 3,
};
```

Update `currentTopic` before each stream. The news feeds and weather refresh automatically while the source is active.

---

## Socials

| Platform | Handle |
|---|---|
| YouTube | [@miniforgedad](https://youtube.com/@miniforgedad) |
| Instagram | [@miniforgedad](https://instagram.com/miniforgedad) |
| Twitch | [twitch.tv/miniforgedad](https://twitch.tv/miniforgedad) |
| Patreon | [patreon.com/miniforgedad](https://patreon.com/miniforgedad) |
| Email | miniforgedad@gmail.com |
