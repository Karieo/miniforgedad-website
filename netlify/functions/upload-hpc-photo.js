// ── HPC PHOTO UPLOAD ──────────────────────────────────────────────────────────
// Receives a photo from /upload.html and commits it to images/hpc/ with the
// correct filename, so a phone upload never depends on getting the name right
// by hand.
//
// SETUP (one time) — two Netlify environment variables:
//
//   UPLOAD_PASSWORD   any passphrase you'll remember. Gates the upload page.
//   GITHUB_TOKEN      a GitHub fine-grained personal access token, scoped to
//                     the Karieo/miniforgedad-website repo only, with
//                     "Contents: Read and write". Nothing else.
//                     https://github.com/settings/personal-access-tokens
//
// Committing to main triggers a normal Netlify build, so the photo is live in
// about a minute.
//
// SECURITY: the filename is rebuilt server-side from a month + slot the client
// picks off a fixed list; the client's own filename is never trusted, so no
// request can write outside images/hpc/. Password and token live only in
// Netlify env vars, never in the repo.

const crypto = require('crypto');

const OWNER  = 'Karieo';
const REPO   = 'miniforgedad-website';
const BRANCH = 'main';
const DIR    = 'images/hpc';

// The only months that can be written, and the only slugs they map to.
const MONTHS = {
  'September 2025':'sep-2025', 'October 2025':'oct-2025', 'November 2025':'nov-2025',
  'December 2025':'dec-2025',  'January 2026':'jan-2026', 'February 2026':'feb-2026',
  'March 2026':'mar-2026',     'April 2026':'apr-2026',   'May 2026':'may-2026',
  'June 2026':'jun-2026',      'July 2026':'jul-2026',    'August 2026':'aug-2026',
};
const SLOTS = ['before', 'after'];

const MAX_BYTES = 4 * 1024 * 1024;   // decoded image; the page resizes well under this

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

// Constant-time compare that doesn't leak the password's length.
function passwordMatches(given, expected) {
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

const gh = (path, init = {}) => fetch(`https://api.github.com${path}`, {
  ...init,
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'miniforgedad-upload',
    ...(init.headers || {}),
  },
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'Use POST.' });

  if (!process.env.UPLOAD_PASSWORD || !process.env.GITHUB_TOKEN) {
    return reply(503, { ok: false, error: 'Uploads are not configured yet — UPLOAD_PASSWORD and GITHUB_TOKEN need setting in Netlify.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return reply(400, { ok: false, error: 'Could not read the request.' }); }

  const { password, month, slot, image } = body;

  if (!passwordMatches(password, process.env.UPLOAD_PASSWORD)) {
    return reply(401, { ok: false, error: 'Wrong password.' });
  }
  if (!MONTHS[month])       return reply(400, { ok: false, error: 'Pick a month from the list.' });
  if (!SLOTS.includes(slot)) return reply(400, { ok: false, error: 'Pick Before or After.' });
  if (typeof image !== 'string' || !image) {
    return reply(400, { ok: false, error: 'No photo attached.' });
  }

  // Accept a data URL or bare base64; keep only the base64 payload.
  const base64 = image.replace(/^data:image\/\w+;base64,/, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    return reply(400, { ok: false, error: 'That photo did not arrive intact — try again.' });
  }
  const bytes = Buffer.from(base64, 'base64').length;
  if (bytes > MAX_BYTES) {
    return reply(413, { ok: false, error: `That photo is ${(bytes / 1048576).toFixed(1)}MB after resizing, which is too large.` });
  }

  // Built here, never taken from the client.
  const filename = `${MONTHS[month]}-${slot}.jpg`;
  const path     = `${DIR}/${filename}`;

  try {
    // An existing file needs its blob sha to be replaced rather than rejected.
    let sha;
    const existing = await gh(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
    if (existing.ok) sha = (await existing.json()).sha;
    else if (existing.status !== 404) {
      const detail = await existing.text();
      return reply(502, { ok: false, error: `GitHub said ${existing.status} when checking for an existing photo.`, detail: detail.slice(0, 200) });
    }

    const put = await gh(`/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `${sha ? 'Replace' : 'Add'} HPC photo: ${month} ${slot}`,
        content: base64,
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!put.ok) {
      const detail = await put.text();
      return reply(502, { ok: false, error: `GitHub rejected the upload (${put.status}).`, detail: detail.slice(0, 200) });
    }

    return reply(200, {
      ok: true,
      replaced: Boolean(sha),
      path,
      sizeKB: Math.round(bytes / 1024),
      message: `${sha ? 'Replaced' : 'Added'} ${filename}. It'll be live in about a minute.`,
    });

  } catch (err) {
    return reply(502, { ok: false, error: 'Could not reach GitHub. Try again in a moment.' });
  }
};
