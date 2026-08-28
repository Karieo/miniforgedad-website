// ── UPDATE AN HPC MONTH ───────────────────────────────────────────────────────
// Edits one month's caption / status / badge in hpc-data.js and commits it, so
// the tracker can be updated from a phone without touching HTML.
//
// Uses the same UPLOAD_PASSWORD and GITHUB_TOKEN as upload-hpc-photo.js — see
// that file for setup.
//
// SAFETY: hpc-data.js is a comment header followed by strict JSON. This reads
// the file, JSON.parses the payload, changes only the named month's fields, and
// writes the same shape back. It never does regex surgery on the page markup,
// and it can only touch a month whose slug already exists in the file.

const crypto = require('crypto');

const OWNER  = 'Karieo';
const REPO   = 'miniforgedad-website';
const BRANCH = 'main';
const FILE   = 'hpc-data.js';

const STATUSES = ['pending', 'active', 'complete', 'missed'];
const MAX_NOTES = 400;
const MAX_BADGE = 24;

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

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
    return reply(503, { ok: false, error: 'Editing is not configured yet — UPLOAD_PASSWORD and GITHUB_TOKEN need setting in Netlify.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return reply(400, { ok: false, error: 'Could not read the request.' }); }

  const { password, slug, notes, status, badge } = body;

  if (!passwordMatches(password, process.env.UPLOAD_PASSWORD)) {
    return reply(401, { ok: false, error: 'Wrong password.' });
  }
  if (typeof slug !== 'string' || !/^[a-z]{3}-20\d\d$/.test(slug)) {
    return reply(400, { ok: false, error: 'Pick a month from the list.' });
  }
  if (status != null && !STATUSES.includes(status)) {
    return reply(400, { ok: false, error: 'That status is not one of the four.' });
  }
  if (notes != null && (typeof notes !== 'string' || notes.length > MAX_NOTES)) {
    return reply(400, { ok: false, error: `Caption must be text, ${MAX_NOTES} characters or fewer.` });
  }
  if (badge != null && (typeof badge !== 'string' || badge.length > MAX_BADGE)) {
    return reply(400, { ok: false, error: `Badge must be text, ${MAX_BADGE} characters or fewer.` });
  }
  if (notes == null && status == null && badge == null) {
    return reply(400, { ok: false, error: 'Nothing to change.' });
  }

  try {
    const get = await gh(`/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`);
    if (!get.ok) {
      return reply(502, { ok: false, error: `Could not read ${FILE} (${get.status}).` });
    }
    const meta = await get.json();
    const source = Buffer.from(meta.content, 'base64').toString('utf8');

    // Split the comment header from the JSON payload so the header survives.
    const match = source.match(/^([\s\S]*?const HPC_DATA = )([\s\S]*);\s*$/);
    if (!match) return reply(500, { ok: false, error: `${FILE} is not in the expected shape.` });

    let data;
    try { data = JSON.parse(match[2]); }
    catch { return reply(500, { ok: false, error: `${FILE} does not contain valid JSON.` }); }

    const month = (data.months || []).find(m => m.slug === slug);
    if (!month) return reply(404, { ok: false, error: `No month with slug "${slug}".` });

    const before = { notes: month.notes, status: month.status, badge: month.badge };
    if (notes  != null) month.notes  = notes.trim();
    if (status != null) month.status = status;
    if (badge  != null) month.badge  = badge.trim();

    const changed = Object.keys(before).filter(k => before[k] !== month[k]);
    if (!changed.length) {
      return reply(200, { ok: true, changed: [], message: `${month.name} was already set that way.` });
    }

    const updated = match[1] + JSON.stringify(data, null, 2) + ';\n';

    const put = await gh(`/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Update ${month.name}: ${changed.join(', ')}`,
        content: Buffer.from(updated, 'utf8').toString('base64'),
        sha: meta.sha,
        branch: BRANCH,
      }),
    });

    if (!put.ok) {
      const detail = await put.text();
      return reply(502, { ok: false, error: `GitHub rejected the change (${put.status}).`, detail: detail.slice(0, 200) });
    }

    return reply(200, {
      ok: true,
      changed,
      month: month.name,
      message: `Updated ${month.name} (${changed.join(', ')}). Live in about a minute.`,
    });

  } catch (err) {
    return reply(502, { ok: false, error: 'Could not reach GitHub. Try again in a moment.' });
  }
};
