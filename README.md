# miniforgedad-website

Source for [miniforgedad.com](https://miniforgedad.com) — a father & son miniature painting brand. Plain HTML/CSS/JS, no build tools or dependencies required.

---

## Pages

| File | URL | Description |
|---|---|---|
| `index.html` | `/` | Main site — hero, story, gallery, content hub, on the bench, FAQ |
| `hpc.html` | `/hpc.html` | 2025 Independent Characters Hobby Progress Challenge tracker |
| `obs-ticker.html` | `/obs-ticker.html` | OBS Browser Source ticker overlay (1920×60px) |

---

## Project structure

```
miniforgedad-website/
├── index.html          # Main site
├── hpc.html            # HPC 2025 tracker
├── obs-ticker.html     # OBS ticker overlay
└── images/
    ├── hero.jpg         # Hero section image
    ├── about.jpg        # Story/about section image
    ├── og-image.png     # Social preview image (1200×630px recommended)
    ├── placeholder.svg  # Development placeholder
    ├── gallery/         # Main site gallery photos
    │   ├── knight-1.jpg
    │   └── knight-2.jpg
    └── hpc/             # HPC tracker before/after photos
        └── (monthly photos go here)
```

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

### Gallery (`index.html`)
Drop images into `images/gallery/` and update the `<img>` tags inside `.gallery-item` divs in `index.html`. The first gallery item spans two columns — use a landscape photo there.

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

### Marking a month complete

Find the month's card and change its `data-status`:

```html
<!-- Options: pending | active | complete | missed -->
<div class="month-card" data-status="complete">
  <div class="month-header">
    <span class="month-name">September 2025</span>
    <span class="month-badge">Complete</span>  <!-- update badge text too -->
  </div>
```

### Adding before/after photos

Place photos in `images/hpc/` and add `<img>` tags inside the `.photo-slot` divs:

```html
<div class="photo-slot">
  <span class="photo-slot-label">Before</span>
  <img src="../images/hpc/sep-before.jpg" alt="September before" />
</div>
<div class="photo-slot">
  <span class="photo-slot-label">After</span>
  <img src="../images/hpc/sep-after.jpg" alt="September after" />
</div>
```

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

### Updating the score bar

Edit the three numbers at the top of `hpc.html` manually:

```html
<div class="score-value">1 <span class="score-denom">/ 12</span></div>  <!-- monthly -->
<div class="score-value">1 <span class="score-denom">/ 6</span></div>   <!-- bonus -->
<div class="score-value">2 <span class="score-denom">/ 18</span></div>  <!-- total -->
```

### Current progress

| Category | Earned | Possible |
|---|---|---|
| Monthly entries | 1 | 12 |
| Bonus entries | 1 | 6 |
| **Total** | **2** | **18** |

**Completed months:** September 2025 (Imperial Knight Paladin — Titanic bonus)

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
