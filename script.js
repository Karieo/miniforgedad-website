/* MiniForgeDad — script.js */

// ── Year in footer ──────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Mobile nav ──────────────────────────────────────────────
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open', !expanded);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  });
});

// ── Gallery filter ──────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hidden', !match);
    });
  });
});

// ── Lightbox ────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lightbox-img');
const lbCap    = document.getElementById('lightbox-caption');

let visibleItems = [];
let currentIndex = 0;

function openLightbox(item) {
  visibleItems = [...galleryItems].filter(i => !i.classList.contains('hidden'));
  currentIndex = visibleItems.indexOf(item);
  showSlide(currentIndex);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function showSlide(index) {
  const item = visibleItems[index];
  const img  = item.querySelector('img');
  const cap  = item.querySelector('figcaption strong');
  lbImg.src  = img.src;
  lbImg.alt  = img.alt;
  lbCap.textContent = cap ? cap.textContent : '';
}

galleryItems.forEach(item => {
  item.addEventListener('click', () => openLightbox(item));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
  });
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
});

document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

document.querySelector('.lightbox-prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showSlide(currentIndex);
});

document.querySelector('.lightbox-next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showSlide(currentIndex);
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showSlide(currentIndex);
  }
  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showSlide(currentIndex);
  }
});

// ── Contact form (client-side demo) ─────────────────────────
const form = document.getElementById('contact-form');

form.addEventListener('submit', e => {
  e.preventDefault();

  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.classList.remove('error');
    if (!field.value.trim()) { field.classList.add('error'); valid = false; }
    if (field.type === 'email' && field.value && !field.value.includes('@')) {
      field.classList.add('error'); valid = false;
    }
  });
  if (!valid) { required[0].focus(); return; }

  // Replace with real form submission (Formspree, Netlify Forms, etc.)
  form.innerHTML = `
    <div class="form-success">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>Message sent!</h3>
      <p>Thanks for reaching out. I'll get back to you within 48 hours.</p>
    </div>`;
});

// Clear error state on input
form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('error'));
});

// ── Scroll-triggered fade-in ────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.gallery-item, .process-step, .stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 500ms ease, transform 500ms ease';
  observer.observe(el);
});
