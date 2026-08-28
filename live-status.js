// ── LIVE PILL ─────────────────────────────────────────────────────────────────
// Reveals the "Live" pill in the nav only while the YouTube channel is actually
// streaming. Paired with netlify/functions/live-status.js, which does the
// checking server-side.
//
// USAGE: give the link `data-live-pill` and an inline `style="display:none"`,
// then include this script:
//
//   <a href="stream.html" class="nav-live" data-live-pill style="display:none">…</a>
//   <script src="live-status.js" defer></script>
//
// The inline style is deliberate — it beats whatever `display` the page's own
// nav CSS sets, without needing a rule in each stylesheet.
//
// FAILS SAFE: if the check fails, the endpoint is missing (local preview), or
// JS never runs, the pill simply stays hidden. It is never shown on a guess.

(function () {
  var pills = document.querySelectorAll('[data-live-pill]');
  if (!pills.length) return;

  function reveal(info) {
    pills.forEach(function (el) {
      // Clearing the inline value hands display back to the page's CSS.
      el.style.display = '';
      if (info.title) el.setAttribute('title', info.title);
    });
  }

  fetch('/.netlify/functions/live-status', { headers: { Accept: 'application/json' } })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) { if (data && data.live) reveal(data); })
    .catch(function () { /* stay hidden */ });
})();
