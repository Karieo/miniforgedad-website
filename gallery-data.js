// ── GALLERY DATA ──────────────────────────────────────────────────────────────
// Add new photos here — one object per model.
//
// Fields:
//   painter:     'dad' or 'son'
//   src:         path to image, e.g. 'images/gallery/my-photo.jpg'
//   alt:         short alt text
//   title:       model name shown in overlay + lightbox
//   description: painting notes shown in lightbox panel (fill in later)
//   featured:    true = also show on the home page (max 9 shown, dad/son interleaved)
//
// Workflow: add a new entry below → it appears on the painter page automatically.
// Set featured: true to also include it on the home page.
// ──────────────────────────────────────────────────────────────────────────────

const GALLERY = [
  {
    painter: 'dad',
    src: 'images/gallery/knights-1.jpeg',
    alt: 'Imperial Knight Paladin',
    title: 'Imperial Knight Paladin',
    description: 'Update this with your painting notes — techniques used, paints, how long it took, any story behind this model.',
    featured: true,
  },
  {
    painter: 'son',
    src: 'images/gallery/Psychophase-1.jpg',
    alt: 'Psychophage',
    title: 'Psychophage',
    description: 'This was his second model that he painted.',
    featured: true,
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-2.jpeg',
    alt: 'Imperial Knight — rear three-quarter view',
    title: 'Knight — Heraldry Detail',
    description: 'Update this with your painting notes.',
    featured: true,
  },
  {
    painter: 'son',
    src: 'images/gallery/Psychophase-2.jpg',
    alt: 'Psychophage',
    title: 'Psychophage 2',
    description: 'This was his second model that he painted.',
    featured: true,
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-3.jpeg',
    alt: 'Imperial Knight — weapon arm',
    title: 'Knight — Weapon Arm',
    description: 'Update this with your painting notes.',
    featured: true,
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-4.jpeg',
    alt: 'Imperial Knight — weapon bits',
    title: 'Weapon Bits',
    description: 'Update this with your painting notes.',
    featured: false,
  },
  {
    painter: 'dad',
    src: 'images/gallery/knights-5.jpeg',
    alt: 'Imperial Knight — rear view',
    title: 'Knight — Rear View',
    description: 'Update this with your painting notes.',
    featured: false,
  },
];
