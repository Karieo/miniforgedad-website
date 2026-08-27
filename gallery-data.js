// ── GALLERY DATA ──────────────────────────────────────────────────────────────
// Add new photos here — one object per model.
//
// Fields:
//   painter:     'dad' or 'son' — who painted it (drives dad.html / son.html)
//   src:         path to image, e.g. 'images/gallery/my-photo.jpg'
//   alt:         short alt text
//   title:       model name shown in overlay + lightbox
//   description: painting notes shown in lightbox panel (fill in later)
//   featured:    true = also show on the home page (max 9 shown, dad/son interleaved)
//
// Gallery page fields (gallery.html) — all optional:
//   faction:     'Imperial Knights', 'Tyranids', … — drives the faction filter.
//                Entries without one still show under "All".
//   year:        year finished, shown under the card title
//   credit:      'Dad' | 'Son' | 'Together' — the label on the card and the
//                painter filter. Defaults to `painter` when omitted. Use
//                'Together' for pieces you both worked on; `painter` stays
//                'dad' or 'son' so the piece still appears on that painter's page.
//   caption:     short descriptive card title for the gallery page
//                (e.g. 'Heraldry detail'). Falls back to `title` when omitted.
//
// Workflow: add a new entry below → it appears on the painter page and the
// gallery page automatically. Set featured: true to also include it on the home
// page. Cards render in the order listed here, on every page.
// ──────────────────────────────────────────────────────────────────────────────

const GALLERY = [
  {
    painter: 'dad',
    src: 'images/gallery/knights-1.jpeg',
    alt: 'Imperial Knight Paladin',
    title: 'Imperial Knight Paladin',
    description: 'Update this with your painting notes — techniques used, paints, how long it took, any story behind this model.',
    featured: true,
    faction: 'Imperial Knights',
    year: 2025,
    caption: 'Front plate, freehand',
  },
  {
    painter: 'son',
    src: 'images/gallery/Psychophase-1.jpg',
    alt: 'Psychophage',
    title: 'Psychophage',
    description: 'This was his second model that he painted.',
    featured: true,
    faction: 'Tyranids',
    year: 2025,
    caption: 'Psychophage',
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-2.jpeg',
    alt: 'Imperial Knight — rear three-quarter view',
    title: 'Knight — Heraldry Detail',
    description: 'Update this with your painting notes.',
    featured: true,
    faction: 'Imperial Knights',
    year: 2025,
    caption: 'Heraldry detail',
  },
  {
    painter: 'son',
    src: 'images/gallery/Psychophase-2.jpg',
    alt: 'Psychophage',
    title: 'Psychophage 2',
    description: 'This was his second model that he painted.',
    featured: true,
    faction: 'Tyranids',
    year: 2025,
    caption: 'Carapace wet blend',
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-3.jpeg',
    alt: 'Imperial Knight — weapon arm',
    title: 'Knight — Weapon Arm',
    description: 'Update this with your painting notes.',
    featured: true,
    faction: 'Imperial Knights',
    year: 2025,
    caption: 'Weathered greaves',
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-4.jpeg',
    alt: 'Imperial Knight — weapon bits',
    title: 'Weapon Bits',
    description: 'Update this with your painting notes.',
    featured: false,
    faction: 'Imperial Knights',
    year: 2025,
    credit: 'Together',
    caption: 'Titan cockpit',
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-5.jpeg',
    alt: 'Imperial Knight — rear view',
    title: 'Knight — Rear View',
    description: 'Update this with your painting notes.',
    featured: false,
    faction: 'Imperial Knights',
    year: 2025,
    caption: 'Questoris Knight, finished',
  },
];
